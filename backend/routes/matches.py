import traceback
from typing import Optional, List

from flask import jsonify
from flask_login import login_required, current_user
from flask_openapi3 import APIBlueprint, Tag
from pydantic import BaseModel, Field

from models import session, Match, Property, User

# Create APIBlueprint for matches
matches_tag = Tag(name="matches", description="Match operations between tenants and properties")
matches_api = APIBlueprint("matches", __name__, abp_tags=[matches_tag])


# Pydantic models for validation
class PropertyMatchModel(BaseModel):
    property_id: int = Field(..., description="ID of the property to match")

    class Config:
        orm_mode = True


# Response models
class SuccessResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    message: str = Field(..., description="Success message")


class ErrorResponse(BaseModel):
    success: bool = Field(False, description="Error status")
    message: str = Field(..., description="Error message")
    error: Optional[str] = Field(None, description="Detailed error information")


class PropertyData(BaseModel):
    id: int = Field(..., description="Property ID")
    name: str = Field(..., description="Property name")
    size_sqft: float = Field(..., description="Size in square feet")
    price: float = Field(..., description="Price")
    bedrooms: int = Field(..., description="Number of bedrooms")
    bathrooms: int = Field(..., description="Number of bathrooms")
    street: str = Field(..., description="Street address")
    city: str = Field(..., description="City")
    image_url: str = Field(..., description="Image URL")
    businessName: Optional[str] = Field(None, description="Business name")
    accessibilities: List[str] = Field([], description="List of accessibility types")


class MatchedPropertiesResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    matched_properties: List[PropertyData] = Field(..., description="List of matched properties")


class TenantData(BaseModel):
    id: int = Field(..., description="Tenant ID")
    tenantFirstName: str = Field(..., description="Tenant first name")
    tenantLastName: str = Field(..., description="Tenant last name")
    tenantProfileImageUrl: str = Field(..., description="Tenant profile image URL")
    propertyName: str = Field(..., description="Property name")
    propertyId: int = Field(..., description="Property ID")


class MatchedTenantsResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    matched_tenants: List[TenantData] = Field(..., description="List of matched tenants")


# Match a property (Tenant only)
@matches_api.post(
    "/api/match",
    summary="Match a property",
    description="Tenant can match with a property they are interested in",
    responses={
        200: SuccessResponse,
        400: ErrorResponse,
        403: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse
    },
)
@login_required
def match_property(body: PropertyMatchModel):
    if current_user.role != "tenant":
        return jsonify({"success": False, "message": "Only tenants can match properties"}), 403

    try:
        property_id = body.property_id
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
@matches_api.get(
    "/api/user/matched-properties",
    summary="Get matched properties",
    description="Get all properties that the current tenant user has matched with",
    responses={
        200: MatchedPropertiesResponse,
        403: ErrorResponse,
        500: ErrorResponse
    }
)
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
                    "accessibilities": accessibilities,  # <--- include accessibilities
                })

        return jsonify({"success": True, "matched_properties": matched_properties}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "message": "An error occurred", "error": str(e)}), 500
    finally:
        session.close()


# Get all matched tenants for the current landlord user
@matches_api.get(
    "/api/landlord/matched-tenants",
    summary="Get matched tenants",
    description="Returns a list of tenants (users) who have matched with the properties owned by the current landlord",
    responses={
        200: MatchedTenantsResponse,
        403: ErrorResponse,
        500: ErrorResponse
    }
)
@login_required
def get_matched_tenants():
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
