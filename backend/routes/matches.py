from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import session, Match, Property
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

# Get all matched properties for the current user
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
