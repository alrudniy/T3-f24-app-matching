import os
import traceback
from typing import Optional, List

from flask import jsonify, request
from flask_login import login_required, current_user
from flask_openapi3 import APIBlueprint, Tag
from pydantic import BaseModel, Field
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.utils import secure_filename

import config
from models import session, Property, PropertyImage, Accessibility

# APIBlueprint for properties
properties_tag = Tag(name="properties", description="Property management operations")
properties_api = APIBlueprint("properties", __name__, abp_tags=[properties_tag])


# Pydantic models for validation
class PropertyCreateModel(BaseModel):
    size_sqft: float = Field(..., description="Size in square feet")
    price: float = Field(..., description="Price")
    bedrooms: int = Field(..., description="Number of bedrooms")
    bathrooms: int = Field(..., description="Number of bathrooms")
    street_address: str = Field(..., description="Street address")
    city: str = Field(..., description="City")
    name: str = Field(..., description="Property name")
    description: Optional[str] = Field("", description="Property description")

    class Config:
        orm_mode = True


class PropertyUpdateModel(BaseModel):
    size_sqft: Optional[float] = Field(None, description="Size in square feet")
    price: Optional[float] = Field(None, description="Price")
    bedrooms: Optional[int] = Field(None, description="Number of bedrooms")
    bathrooms: Optional[int] = Field(None, description="Number of bathrooms")
    street_address: Optional[str] = Field(None, description="Street address")
    city: Optional[str] = Field(None, description="City")
    name: Optional[str] = Field(None, description="Property name")
    description: Optional[str] = Field(None, description="Property description")

    class Config:
        orm_mode = True


class AccessibilityAddModel(BaseModel):
    accessibility_ids: List[int] = Field(..., description="List of accessibility IDs")

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


class PropertyCreateSuccessResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    message: str = Field(..., description="Success message")
    property_id: int = Field(..., description="ID of the created property")


class PropertyImageData(BaseModel):
    id: int = Field(..., description="Image ID")
    image_url: str = Field(..., description="Image URL")


class PropertyDetailData(BaseModel):
    id: int = Field(..., description="Property ID")
    name: str = Field(..., description="Property name")
    size_sqft: float = Field(..., description="Size in square feet")
    price: float = Field(..., description="Price")
    bedrooms: int = Field(..., description="Number of bedrooms")
    bathrooms: int = Field(..., description="Number of bathrooms")
    street_address: str = Field(..., description="Street address")
    city: str = Field(..., description="City")
    user_id: int = Field(..., description="User ID of the owner")
    image_url: str = Field(..., description="Primary image URL")
    images: List[str] = Field(..., description="List of all image URLs")
    accessibilities: List[str] = Field(..., description="List of accessibility types")
    businessName: Optional[str] = Field(None, description="Business name")
    description: Optional[str] = Field(None, description="Property description")


class PropertyListResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    properties: List[PropertyDetailData] = Field(..., description="List of properties")


class PropertyDetailResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    property: PropertyDetailData = Field(..., description="Property details")


class AccessibilityData(BaseModel):
    id: int = Field(..., description="Accessibility ID")
    type: str = Field(..., description="Accessibility type")


class AccessibilityListResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    accessibilities: List[AccessibilityData] = Field(..., description="List of accessibilities")


# ------------------------------
# Helper function to check file extension
# ------------------------------
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in config.ALLOWED_EXTENSIONS


# ------------------------------
# Edit a Property (Update/Delete Images)
# ------------------------------
class PropertyEditFormData(BaseModel):
    size_sqft: Optional[str] = Field(None, description="Size in square feet")
    price: Optional[str] = Field(None, description="Price")
    bedrooms: Optional[str] = Field(None, description="Number of bedrooms")
    bathrooms: Optional[str] = Field(None, description="Number of bathrooms")
    street_address: Optional[str] = Field(None, description="Street address")
    city: Optional[str] = Field(None, description="City")
    name: Optional[str] = Field(None, description="Property name")
    description: Optional[str] = Field(None, description="Property description")
    delete_image_ids: Optional[List[str]] = Field(None, description="IDs of images to delete")


class EditPropertyPath(BaseModel):
    property_id: int = Field(..., description="Property ID")


@properties_api.put(
    "/property/edit/<int:property_id>",
    summary="Edit a property",
    description="Update property details and manage images",
    responses={
        200: SuccessResponse,
        400: ErrorResponse,
        403: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse
    },
)
@login_required
def edit_property(path: EditPropertyPath, form: PropertyEditFormData):
    try:
        property_id = path.property_id
        print(f"🔹 Current User ID: {current_user.id}")
        print(f"🔹 Checking Property Ownership for ID: {property_id}")

        prop = session.query(Property).filter_by(id=property_id).first()

        if not prop:
            return jsonify({"success": False, "message": "Property not found"}), 404

        print(f"🔹 Property Owner ID: {prop.user_id}")

        if int(prop.user_id) != int(current_user.id):  # Ensure matching types
            return jsonify({"success": False, "message": "Unauthorized access"}), 403

        try:
            # Prepare data for validation
            update_data = {}
            if form.size_sqft:
                update_data['size_sqft'] = float(form.size_sqft)
            if form.price:
                update_data['price'] = float(form.price)
            if form.bedrooms:
                update_data['bedrooms'] = int(form.bedrooms)
            if form.bathrooms:
                update_data['bathrooms'] = int(form.bathrooms)
            if form.street_address:
                update_data['street_address'] = form.street_address
            if form.city:
                update_data['city'] = form.city
            if form.name:
                update_data['name'] = form.name
            if form.description:
                update_data['description'] = form.description

            # Validate data using Pydantic model
            property_data = PropertyUpdateModel(**update_data)

            # Update property with validated data
            if property_data.size_sqft is not None:
                prop.size_sqft = property_data.size_sqft
            if property_data.price is not None:
                prop.price = property_data.price
            if property_data.bedrooms is not None:
                prop.bedrooms = property_data.bedrooms
            if property_data.bathrooms is not None:
                prop.bathrooms = property_data.bathrooms
            if property_data.street_address is not None:
                prop.street_address = property_data.street_address
            if property_data.city is not None:
                prop.city = property_data.city
            if property_data.name is not None:
                prop.name = property_data.name
            if property_data.description is not None:
                prop.description = property_data.description

        except ValueError as e:
            return jsonify({"success": False, "message": f"Validation error: {str(e)}"}), 400

        # Handle deleting images if requested
        if form.delete_image_ids:
            for image_id in form.delete_image_ids:
                image = session.query(PropertyImage).filter_by(id=image_id, property_id=property_id).first()
                if image:
                    image_path = os.path.join(config.UPLOAD_FOLDER, image.image_url)
                    if os.path.exists(image_path):
                        os.remove(image_path)
                    session.delete(image)

        # Handle uploading new images
        if "new_images" in request.files:
            files = request.files.getlist("new_images")
            for file in files:
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    file_path = os.path.join(config.UPLOAD_FOLDER, filename)
                    file.save(file_path)

                    new_image = PropertyImage(property_id=property_id, image_url=filename)
                    session.add(new_image)

        session.commit()

        return jsonify({"success": True, "message": "Property updated successfully"}), 200

    except Exception as e:
        session.rollback()
        traceback.print_exc()
        return jsonify({"success": False, "message": "An error occurred", "error": str(e)}), 500
    finally:
        session.close()


# ------------------------------
# Create a property
# ------------------------------
class PropertyCreateFormData(BaseModel):
    size_sqft: str = Field(..., description="Size in square feet")
    price: str = Field(..., description="Price")
    bedrooms: str = Field(..., description="Number of bedrooms")
    bathrooms: str = Field(..., description="Number of bathrooms")
    street_address: str = Field(..., description="Street address")
    city: str = Field(..., description="City")
    name: str = Field(..., description="Property name")
    description: Optional[str] = Field("", description="Property description")


@properties_api.post(
    '/property/create',
    summary="Create a property",
    description="Create a new property listing",
    responses={
        201: PropertyCreateSuccessResponse,
        400: ErrorResponse,
        403: ErrorResponse,
        500: ErrorResponse
    },
)
@login_required
def create_property(form: PropertyCreateFormData):
    try:
        if current_user.role != "landlord":
            return jsonify({"success": False, "message": "Only landlords can create properties"}), 403

        try:
            # Validate data using Pydantic model
            property_data = PropertyCreateModel(
                size_sqft=float(form.size_sqft),
                price=float(form.price),
                bedrooms=int(form.bedrooms),
                bathrooms=int(form.bathrooms),
                street_address=form.street_address,
                city=form.city,
                name=form.name,
                description=form.description or ''
            )
        except ValueError as e:
            return jsonify({"success": False, "message": f"Validation error: {str(e)}"}), 400

        # Create new property using validated data
        new_property = Property(
            size_sqft=property_data.size_sqft,
            price=property_data.price,
            bedrooms=property_data.bedrooms,
            bathrooms=property_data.bathrooms,
            street_address=property_data.street_address,
            city=property_data.city,
            name=property_data.name,
            user_id=current_user.id,
            description=property_data.description
        )

        session.add(new_property)
        session.commit()

        return jsonify({
            "success": True,
            "message": "Property created successfully",
            "property_id": new_property.id
        }), 201

    except Exception as e:
        session.rollback()
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500
    finally:
        session.close()


class AddAccessibilityToPropertyPath(BaseModel):
    property_id: int = Field(..., description="Property ID")


# ------------------------------
# Add Accessibilities to Properties (Landlord only)
# ------------------------------
@properties_api.post(
    "/property/<int:property_id>/add-accessibility",
    summary="Add accessibilities to a property",
    description="Add accessibility features to a property (landlord only)",
    responses={
        200: SuccessResponse,
        400: ErrorResponse,
        403: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse
    },
)
@login_required
def add_accessibility_to_property(path: AddAccessibilityToPropertyPath, body: AccessibilityAddModel):
    try:
        property_id = path.property_id
        if current_user.role != "landlord":
            return jsonify({"success": False, "message": "Only landlords can modify property accessibility"}), 403

        if not body.accessibility_ids:
            return jsonify({"success": False, "message": "No accessibility IDs provided"}), 400

        prop = session.query(Property).filter_by(id=property_id, user_id=current_user.id).first()
        if not prop:
            return jsonify({"success": False, "message": "Property not found"}), 404

        for accessibility_id in body.accessibility_ids:
            accessibility = session.query(Accessibility).filter_by(accessibilityID=accessibility_id).first()
            if accessibility and accessibility not in prop.accessibilities:
                prop.accessibilities.append(accessibility)

        session.commit()
        return jsonify({"success": True, "message": "Accessibility added to property successfully"}), 200

    except Exception as e:
        session.rollback()
        traceback.print_exc()
        return jsonify({"success": False, "message": "An error occurred", "error": str(e)}), 500
    finally:
        session.close()


# ------------------------------
# Get all properties
# ------------------------------
@properties_api.get(
    '/api/properties',
    summary="Get all properties",
    description="Retrieve a list of all properties",
    responses={
        200: PropertyListResponse,
        500: ErrorResponse
    }
)
def get_properties():
    try:
        properties = session.query(Property).all()
        property_list = []

        for prop in properties:
            # Build array of all image URLs
            images = []
            if prop.images and len(prop.images) > 0:
                images = [
                    f"http://localhost:5000/uploads/{img.image_url}"
                    for img in prop.images
                ]

            # Fallback single-image field
            image_url = images[0] if images else "https://via.placeholder.com/400x300"

            # Gather any accessibilities
            accessibilities = [
                accessibility.accessibilityType
                for accessibility in prop.accessibilities
            ]

            property_data = {
                "id": prop.id,
                "name": prop.name,
                "size_sqft": prop.size_sqft,
                "price": prop.price,
                "bedrooms": prop.bedrooms,
                "bathrooms": prop.bathrooms,
                "street": prop.street_address,
                "city": prop.city,
                "user_id": prop.user_id,
                "image_url": image_url,
                "images": images,
                "accessibilities": accessibilities,
                "businessName": prop.user.businessName if prop.user else None,
                "description": prop.description
            }
            property_list.append(property_data)

        return jsonify({"success": True, "properties": property_list}), 200

    except Exception as e:
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500


class GetPropertyPath(BaseModel):
    property_id: int = Field(..., description="Property ID")


# ------------------------------
# Get a single property
# ------------------------------
@properties_api.get(
    '/api/properties/<int:property_id>',
    summary="Get a property",
    description="Retrieve details of a specific property",
    responses={
        200: PropertyDetailResponse,
        404: ErrorResponse,
        500: ErrorResponse
    }
)
def get_property(path: GetPropertyPath):
    try:
        property_id = path.property_id
        prop = session.query(Property).filter_by(id=property_id).first()
        if not prop:
            return jsonify({"success": False, "message": "Property not found"}), 404

        images = []
        if prop.images and len(prop.images) > 0:
            images = [
                f"http://localhost:5000/uploads/{img.image_url}"
                for img in prop.images
            ]

        image_url = images[0] if images else "https://via.placeholder.com/400x300"

        accessibilities = [
            acc.accessibilityType for acc in prop.accessibilities
        ]

        property_data = {
            "id": prop.id,
            "name": prop.name,
            "size_sqft": prop.size_sqft,
            "price": prop.price,
            "bedrooms": prop.bedrooms,
            "bathrooms": prop.bathrooms,
            "street_address": prop.street_address,
            "city": prop.city,
            "user_id": prop.user_id,
            "image_url": image_url,
            "images": images,
            "accessibilities": accessibilities,
            "businessName": prop.user.businessName if prop.user else None,
            "description": prop.description
        }

        return jsonify({"success": True, "property": property_data}), 200

    except Exception as e:
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500
    finally:
        session.close()


class DeletePropertyPath(BaseModel):
    property_id: int = Field(..., description="Property ID")


# ------------------------------
# Delete a property
# ------------------------------
@properties_api.delete(
    '/property/delete/<int:property_id>',
    summary="Delete a property",
    description="Delete a specific property (owner only)",
    responses={
        200: SuccessResponse,
        404: ErrorResponse,
        500: ErrorResponse
    }
)
@login_required
def delete_property(path: DeletePropertyPath):
    try:
        prop = session.query(Property).filter_by(id=path.property_id, user_id=current_user.id).first()
        if not prop:
            return jsonify({"success": False, "message": "Property not found"}), 404

        session.delete(prop)
        session.commit()
        return jsonify({"success": True, "message": "Property deleted successfully"}), 200

    except Exception as e:
        session.rollback()
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500
    finally:
        session.close()


# ------------------------------
# Get all accessibilities
# ------------------------------
@properties_api.get(
    "/api/accessibilities",
    summary="Get all accessibilities",
    description="Retrieve a list of all accessibility types",
    responses={
        200: AccessibilityListResponse,
        500: ErrorResponse
    }
)
def get_accessibilities():
    try:
        accessibilities = session.query(Accessibility).all()
        accessibilities_list = [
            {"id": a.accessibilityID, "type": a.accessibilityType}
            for a in accessibilities
        ]

        return jsonify({"success": True, "accessibilities": accessibilities_list}), 200

    except SQLAlchemyError as e:
        session.rollback()
        print("Database error:", str(e))
        return jsonify({"success": False, "message": "Database error", "error": str(e)}), 500
    except Exception as e:
        print("Unexpected error:", str(e))
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500
