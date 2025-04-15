from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
from geopy.distance import distance as geopy_distance
from models import session, Property

# Define a blueprint for geocoding-related routes.
geocode_bp = Blueprint("geocode", __name__)

# Initialize the geolocator with a unique user agent.
geolocator = Nominatim(user_agent="family_promise_geocoder")
# Apply a rate limiter to ensure we respect the geocoding service limits.
geocode_func = RateLimiter(geolocator.geocode, min_delay_seconds=1)

@geocode_bp.route("/property/geocode/update/<int:property_id>", methods=["POST"])
@login_required
def update_property_geocode(property_id):
    """
    Updates the latitude and longitude for a property based on its address.
    The property record should include 'street_address', 'city', and optionally 'zipcode'.
    If the geocoding for the full address fails, it falls back to using the zipcode alone.
    It is assumed that the Property model has 'latitude' and 'longitude' fields.
    """
    try:
        # Retrieve the property and ensure the current user owns it.
        prop = session.query(Property).filter_by(id=property_id, user_id=current_user.id).first()
        if not prop:
            return jsonify({"success": False, "message": "Property not found or unauthorized access"}), 404

        # Construct the full address from available fields.
        address_parts = []
        if prop.street_address:
            address_parts.append(prop.street_address)
        if prop.city:
            address_parts.append(prop.city)
        if prop.zipcode:
            address_parts.append(prop.zipcode)
        full_address = ", ".join(address_parts)

        # Use geopy to get the location for the constructed address.
        location = geocode_func(full_address)

        # If geocoding with the full address fails and a zipcode is available, try geocoding the zipcode alone.
        if not location and prop.zipcode:
            location = geocode_func(prop.zipcode)

        if location:
            # Update the property record with the new geocode information.
            prop.latitude = location.latitude
            prop.longitude = location.longitude
            session.commit()
            return jsonify({
                "success": True,
                "message": "Geocode updated successfully",
                "address": full_address,
                "latitude": location.latitude,
                "longitude": location.longitude
            }), 200
        else:
            return jsonify({"success": False, "message": "Could not geocode the provided address"}), 404

    except Exception as e:
        session.rollback()
        return jsonify({
            "success": False,
            "message": "An error occurred during geocoding",
            "error": str(e)
        }), 500
    finally:
        session.close()


@geocode_bp.route("/property/<int:property_id>/distance", methods=["GET"])
def calculate_distance(property_id):
    """
    Calculates the distance between a property and a user's zipcode.
    
    Query parameters:
      - user_zipcode: The zipcode for the user's location.
    
    If the property has latitude and longitude, these are used.
    Otherwise, if a fallback zipcode is available on the property, it is used to generate coordinates.
    """
    user_zipcode = request.args.get("user_zipcode")
    if not user_zipcode:
        return jsonify({"success": False, "message": "Missing 'user_zipcode' query parameter"}), 400

    try:
        # Fetch the property from the database.
        prop = session.query(Property).filter_by(id=property_id).first()
        if not prop:
            return jsonify({"success": False, "message": "Property not found"}), 404

        # Determine property coordinates.
        if prop.latitude is not None and prop.longitude is not None:
            property_coords = (prop.latitude, prop.longitude)
        else:
            # Fallback: Use the property's zipcode if available.
            if hasattr(prop, "zipcode") and prop.zipcode:
                fallback_location = geocode_func(prop.zipcode)
                if fallback_location:
                    property_coords = (fallback_location.latitude, fallback_location.longitude)
                else:
                    return jsonify({"success": False, "message": "Could not geocode the property's zipcode"}), 404
            else:
                return jsonify({"success": False, "message": "No geolocation data available for property"}), 400

        # Geocode the user's zipcode.
        user_location = geocode_func(user_zipcode)
        if not user_location:
            return jsonify({"success": False, "message": "Could not geocode user's zipcode"}), 404
        user_coords = (user_location.latitude, user_location.longitude)

        # Calculate the distance (in miles).
        dist = geopy_distance(property_coords, user_coords).miles

        return jsonify({
            "success": True,
            "property_id": property_id,
            "user_zipcode": user_zipcode,
            "distance_miles": dist
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "An error occurred while calculating distance",
            "error": str(e)
        }), 500
    finally:
        session.close()
