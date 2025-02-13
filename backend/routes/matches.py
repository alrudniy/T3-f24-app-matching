from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import session, Match, Property, User
import traceback

# Create Blueprint for matches
matches_bp = Blueprint("matches", __name__)

# Match a property (Tenant only)
@matches_bp.route("/api/match", methods=["POST"])
@login_required
def match_property():
    if current_user.role != "tenant":
        return jsonify({"success": False, "message": "Only tenants can match properties"}), 403

    try:
        data = request.json
        property_id = data.get("property_id")

        if not property_id:
            return jsonify({"success": False, "message": "Property ID is required"}), 400

        property = session.query(Property).filter_by(id=property_id).first()
        if not property:
            return jsonify({"success": False, "message": "Property not found"}), 404

        existing_match = session.query(Match).filter_by(user_id=current_user.id, property_id=property_id).first()
        if existing_match:
            return jsonify({"success": False, "message": "You already matched with this property"}), 400

        new_match = Match(user_id=current_user.id, property_id=property_id)
        session.add(new_match)
        session.commit()

        return jsonify({"success": True, "message": "Property matched successfully"})
    except Exception as e:
        session.rollback()
        traceback.print_exc()
        return jsonify({"success": False, "message": "An error occurred", "error": str(e)}), 500
    finally:
        session.close()

# Get all matched properties for the current tenant user
@matches_bp.route("/api/user/matched-properties", methods=["GET"])
@login_required
def get_matched_properties():
    try:
        if current_user.role != "tenant":
            return jsonify({"success": False, "message": "Only tenants can view matched properties"}), 403

        matches = session.query(Match).filter_by(user_id=current_user.id).all()
        matched_properties = []

        for match in matches:
            property = session.query(Property).filter_by(id=match.property_id).first()
            if property:
                # Retrieve the first image URL or use a placeholder
                image_url = "https://via.placeholder.com/400x300"
                if property.images and len(property.images) > 0:
                    image_url = f"http://localhost:5000/uploads/{property.images[0].image_url}"

                matched_properties.append({
                    "id": property.id,
                    "name": property.name,
                    "size_sqft": property.size_sqft,
                    "price": property.price,
                    "bedrooms": property.bedrooms,
                    "bathrooms": property.bathrooms,
                    "street": property.street_address,
                    "city": property.city,
                    "image_url": image_url,
                    "businessName": property.user.businessName if property.user else None
                })

        return jsonify({"success": True, "matched_properties": matched_properties}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "message": "An error occurred", "error": str(e)}), 500

#Get all matched properties for the current landlord user
@matches_bp.route("/api/landlord/matched-tenants", methods=["GET"])
@login_required
def get_matched_tenants():
    """
    Returns a list of tenants (users) who have matched with the properties owned by the current landlord.
    """
    try:
        # 1. Check if current_user is a landlord
        if current_user.role != "landlord":
            return jsonify({"success": False, "message": "Only landlords can view matched tenants"}), 403

        # 2. Query for all matches on the landlord's properties
        #    - We join Match -> Property to ensure the property belongs to this landlord
        #    - Then we join Match -> User to get tenant details
        landlord_matches = (
            session.query(Match)
            .join(Property, Match.property_id == Property.id)
            .join(User, Match.user_id == User.id)
            .filter(Property.user_id == current_user.id)  # property.user_id is landlord's user_id
            .all()
        )

        # 3. Build a list of tenant details from these matches
        matched_tenants = []
        for match in landlord_matches:
            tenant_user = match.user  
            if tenant_user:
                matched_tenants.append({
                    "id": tenant_user.id,
                    "tenantFirstName": tenant_user.firstname,
                    "tenantLastName": tenant_user.lastname,
                    "tenantProfileImageUrl": tenant_user.profile_img or "https://via.placeholder.com/150",
                    # Add any extra tenant-related info as needed in the future
                })

        return jsonify({"success": True, "matched_tenants": matched_tenants}), 200

    except Exception as e:
        traceback.print_exc()
        session.rollback()
        return jsonify({"success": False, "message": "An error occurred", "error": str(e)}), 500
    finally:
        session.close()
