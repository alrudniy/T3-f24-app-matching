from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import session, Property, PropertyImage, Accessibility
from werkzeug.utils import secure_filename
import os
import traceback
from sqlalchemy.exc import SQLAlchemyError
import config
from pydantic import BaseModel, Field, validator
from typing import Optional, List

# Blueprint for properties
properties_bp = Blueprint("properties", __name__)

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

# ------------------------------
# Helper function to check file extension
# ------------------------------
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in config.ALLOWED_EXTENSIONS

# ------------------------------
# Edit a Property (Update/Delete Images)
# ------------------------------
@properties_bp.route("/property/edit/<int:property_id>", methods=["PUT"])
@login_required
def edit_property(property_id):
    try:
        print(f"🔹 Current User ID: {current_user.id}")
        print(f"🔹 Checking Property Ownership for ID: {property_id}")

        prop = session.query(Property).filter_by(id=property_id).first()

        if not prop:
            return jsonify({"success": False, "message": "Property not found"}), 404

        print(f"🔹 Property Owner ID: {prop.user_id}")

        if int(prop.user_id) != int(current_user.id):  # Ensure matching types
            return jsonify({"success": False, "message": "Unauthorized access"}), 403

        data = request.form

        try:
            # Prepare data for validation
            update_data = {}
            if 'size_sqft' in data:
                update_data['size_sqft'] = float(data.get('size_sqft'))
            if 'price' in data:
                update_data['price'] = float(data.get('price'))
            if 'bedrooms' in data:
                update_data['bedrooms'] = int(data.get('bedrooms'))
            if 'bathrooms' in data:
                update_data['bathrooms'] = int(data.get('bathrooms'))
            if 'street_address' in data:
                update_data['street_address'] = data.get('street_address')
            if 'city' in data:
                update_data['city'] = data.get('city')
            if 'name' in data:
                update_data['name'] = data.get('name')
            if 'description' in data:
                update_data['description'] = data.get('description')

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
        delete_image_ids = request.form.getlist("delete_image_ids")
        if delete_image_ids:
            for image_id in delete_image_ids:
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
@properties_bp.route('/property/create', methods=['POST'])
@login_required
def create_property():
    try:
        if current_user.role != "landlord":
            return jsonify({"success": False, "message": "Only landlords can create properties"}), 403

        data = request.form

        try:
            # Validate data using Pydantic model
            property_data = PropertyCreateModel(
                size_sqft=float(data.get('size_sqft', 0)),
                price=float(data.get('price', 0)),
                bedrooms=int(data.get('bedrooms', 0)),
                bathrooms=int(data.get('bathrooms', 0)),
                street_address=data.get('street_address', ''),
                city=data.get('city', ''),
                name=data.get('name', ''),
                description=data.get('description', '')
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

# ------------------------------
# Add Accessibilities to Properties (Landlord only)
# ------------------------------
@properties_bp.route("/property/<int:property_id>/add-accessibility", methods=["POST"])
def add_accessibility_to_property(property_id):
    try:
        if current_user.role != "landlord":
            return jsonify({"success": False, "message": "Only landlords can modify property accessibility"}), 403

        data = request.json

        try:
            # Validate data using Pydantic model
            accessibility_data = AccessibilityAddModel(**data)
        except ValueError as e:
            return jsonify({"success": False, "message": f"Validation error: {str(e)}"}), 400

        if not accessibility_data.accessibility_ids:
            return jsonify({"success": False, "message": "No accessibility IDs provided"}), 400

        prop = session.query(Property).filter_by(id=property_id, user_id=current_user.id).first()
        if not prop:
            return jsonify({"success": False, "message": "Property not found"}), 404

        for accessibility_id in accessibility_data.accessibility_ids:
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
@properties_bp.route('/api/properties', methods=['GET'])
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

# ------------------------------
# Get a single property
# ------------------------------
@properties_bp.route('/api/properties/<int:property_id>', methods=['GET'])
def get_property(property_id):
    try:
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

# ------------------------------
# Delete a property
# ------------------------------
@properties_bp.route('/property/delete/<int:property_id>', methods=['DELETE'])
@login_required
def delete_property(property_id):
    try:
        prop = session.query(Property).filter_by(id=property_id, user_id=current_user.id).first()
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
@properties_bp.route("/api/accessibilities", methods=["GET"])
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
