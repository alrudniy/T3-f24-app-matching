from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import session, Property, PropertyImage, Accessibility
from werkzeug.utils import secure_filename
import os
import traceback
from sqlalchemy.exc import SQLAlchemyError

# Blueprint for properties
properties_bp = Blueprint("properties", __name__)


# Create a property
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
            user_id=current_user.id
        )

        session.add(new_property)
        session.commit()

        return jsonify({"success": True, "message": "Property created successfully", "property_id": new_property.id}), 201
    except Exception as e:
        session.rollback()
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500
    finally:
        session.close()

# Add Accessibilities to Properties (Landlord only)
@properties_bp.route("/property/<int:property_id>/add-accessibility", methods=["POST"])
def add_accessibility_to_property(property_id):
    try:
        if current_user.role != "landlord":
            return jsonify({"success": False, "message": "Only landlords can modify property accessibility"}), 403

        data = request.json
        accessibility_ids = data.get("accessibility_ids")  # List of accessibility IDs

        if not accessibility_ids:
            return jsonify({"success": False, "message": "No accessibility IDs provided"}), 400

        property = session.query(Property).filter_by(id=property_id, user_id=current_user.id).first()
        if not property:
            return jsonify({"success": False, "message": "Property not found"}), 404

        for accessibility_id in accessibility_ids:
            accessibility = session.query(Accessibility).filter_by(accessibilityID=accessibility_id).first()
            if accessibility and accessibility not in property.accessibilities:
                property.accessibilities.append(accessibility)

        session.commit()
        return jsonify({"success": True, "message": "Accessibility added to property successfully"}), 200
    except Exception as e:
        session.rollback()
        traceback.print_exc()
        return jsonify({"success": False, "message": "An error occurred", "error": str(e)}), 500
    finally:
        session.close()

# Get all properties
@properties_bp.route('/api/properties', methods=['GET'])
def get_properties():
    try:
        properties = session.query(Property).all()
        property_list = []

        for property in properties:
            image_url = "https://via.placeholder.com/400x300"
            if property.images and len(property.images) > 0:
                image_url = f"http://localhost:5000/uploads/{property.images[0].image_url}"

            accessibilities = [
                accessibility.accessibilityType for accessibility in property.accessibilities
            ]

            property_data = {
                "id": property.id,
                "name": property.name,
                "size_sqft": property.size_sqft,
                "price": property.price,
                "bedrooms": property.bedrooms,
                "bathrooms": property.bathrooms,
                "street": property.street_address,
                "city": property.city,
                "user_id": property.user_id,
                "image_url": image_url,
                "accessibilities": accessibilities,
                "businessName": property.user.businessName if property.user else None
            }
            property_list.append(property_data)

        return jsonify({"success": True, "properties": property_list}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500

# Delete a property
@properties_bp.route('/property/delete/<int:property_id>', methods=['DELETE'])
@login_required
def delete_property(property_id):
    try:
        property = session.query(Property).filter_by(id=property_id, user_id=current_user.id).first()
        if not property:
            return jsonify({"success": False, "message": "Property not found"}), 404

        session.delete(property)
        session.commit()
        return jsonify({"success": True, "message": "Property deleted successfully"}), 200
    except Exception as e:
        session.rollback()
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500
    finally:
        session.close()

#Get all accessibilities  
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

