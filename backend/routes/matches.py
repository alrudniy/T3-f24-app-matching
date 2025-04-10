from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import session, Match, Property, User
import traceback
from pydantic import BaseModel, Field
from typing import Optional

# Create Blueprint for matches
matches_bp = Blueprint("matches", __name__)

# Pydantic model for validation
class PropertyMatchModel(BaseModel):
    property_id: int = Field(..., description="ID of the property to match")

    class Config:
        orm_mode = True

# Match a property (Tenant only)
@matches_bp.route("/api/match", methods=["POST"])
@login_required
def match_property():
    if current_user.role != "tenant":
        return jsonify({"success": False, "message": "Only tenants can match properties"}), 403

    try:
        data = request.json

        try:
            # Validate data using Pydantic model
            match_data = PropertyMatchModel(**data)
        except ValueError as e:
            return jsonify({"success": False, "message": f"Validation error: {str(e)}"}), 400

        property_id = match_data.property_id
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
            prop = session.query(Property).filter_by(id=match.property_id).first()
            if prop:
                # Retrieve the first image URL or use a placeholder
                image_url = "https://via.placeholder.com/400x300"
                if prop.images and len(prop.images) > 0:
                    image_url = f"http://localhost:5000/uploads/{prop.images[0].image_url}"

                # Gather accessibilities if your `Property` model has a relationship like `prop.accessibilities`
                # that references a list of `Accessibility` objects.
                accessibilities = []
                if prop.accessibilities:
                    accessibilities = [
                        acc.accessibilityType for acc in prop.accessibilities
                    ]

                matched_properties.append({
                    "id": prop.id,
                    "name": prop.name,
                    "size_sqft": prop.size_sqft,
                    "price": prop.price,
                    "bedrooms": prop.bedrooms,
                    "bathrooms": prop.bathrooms,
                    "street": prop.street_address,
                    "city": prop.city,
                    "image_url": image_url,
                    "businessName": prop.user.businessName if prop.user else None,
                    "accessibilities": accessibilities,   # <--- include accessibilities
                })

        return jsonify({"success": True, "matched_properties": matched_properties}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "message": "An error occurred", "error": str(e)}), 500
    finally:
        session.close()


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
                    "tenantProfileImageUrl": tenant_user.profile_picture or "https://picsum.photos/150/150",
                    "propertyName": match.property.name,
                    "propertyId": match.property.id,
                    # Add any extra tenant-related info as needed in the future
                })

        return jsonify({"success": True, "matched_tenants": matched_tenants}), 200

    except Exception as e:
        traceback.print_exc()
        session.rollback()
        return jsonify({"success": False, "message": "An error occurred", "error": str(e)}), 500
    finally:
        session.close()
