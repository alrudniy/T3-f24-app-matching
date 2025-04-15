from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import session, Property, PropertyImage, Accessibility
from werkzeug.utils import secure_filename
import os
import traceback
from sqlalchemy.exc import SQLAlchemyError
import config

# Blueprint for properties
properties_bp = Blueprint("properties", __name__)

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

        # Update property details if provided
        prop.size_sqft = float(data.get("size_sqft", prop.size_sqft))
        prop.price = float(data.get("price", prop.price))
        prop.bedrooms = int(data.get("bedrooms", prop.bedrooms))
        prop.bathrooms = int(data.get("bathrooms", prop.bathrooms))
        prop.street_address = data.get("street_address", prop.street_address)
        prop.city = data.get("city", prop.city)
        prop.name = data.get("name", prop.name)
        prop.description = data.get("description", prop.description)
        prop.zipcode = data.get("zipcode", prop.zipcode)  # New field update

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
        size_sqft = data.get('size_sqft')
        price = data.get('price')
        bedrooms = data.get('bedrooms')
        bathrooms = data.get('bathrooms')
        street_address = data.get('street_address')
        city = data.get('city')
        name = data.get('name')
        description = data.get('description', "")
        zipcode = data.get('zipcode')  # New field

        # Validate required fields
        if not all([size_sqft, price, bedrooms, bathrooms, street_address, city, name]):
            return jsonify({"success": False, "message": "All property fields are required"}), 400

        new_property = Property(
            size_sqft=float(size_sqft),
            price=float(price),
            bedrooms=int(bedrooms),
            bathrooms=int(bathrooms),
            street_address=street_address,
            city=city,
            name=name,
            description=description,
            zipcode=zipcode,  # Set the zipcode if provided
            user_id=current_user.id
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
        accessibility_ids = data.get("accessibility_ids")  # List of accessibility IDs

        if not accessibility_ids:
            return jsonify({"success": False, "message": "No accessibility IDs provided"}), 400

        prop = session.query(Property).filter_by(id=property_id, user_id=current_user.id).first()
        if not prop:
            return jsonify({"success": False, "message": "Property not found"}), 404

        for accessibility_id in accessibility_ids:
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
                "zipcode": prop.zipcode,  # Include zipcode in the output
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
            "zipcode": prop.zipcode,  # Include zipcode in the output
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
