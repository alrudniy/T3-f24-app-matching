from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import session, Property, PropertyImage, Accessibility
from werkzeug.utils import secure_filename
import os
import traceback
from sqlalchemy.exc import SQLAlchemyError

# Blueprint for matching algorithm
algorithm_bp = Blueprint("algorithm", __name__)

# Get user profile
@algorithm_bp.route("/api/user/profile", methods=["GET"])
def get_user_profile():
    try:
        user = {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "phone": current_user.phone,
            "firstname": current_user.firstname,
            "lastname": current_user.lastname,
            "role": current_user.role,
            "businessName": current_user.businessName,
            "profile_picture": f"http://localhost:5000/uploads/{current_user.profile_picture}" if current_user.profile_picture else "https://via.placeholder.com/150",
        }
        return jsonify({"success": True, "profile": user}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "message": "Failed to fetch profile", "error": str(e)}), 500

# Get all properties
@algorithm_bp.route('/api/properties', methods=['GET'])
def get_properties():
    try:
        properties = session.query(Property).all()
        property_list = []

        for property in properties:

            accessibilities = [
                accessibility.accessibilityType for accessibility in property.accessibilities
            ]

            property_data = {
                "id": property.id,
                "size_sqft": property.size_sqft,
                "price": property.price,
                "bedrooms": property.bedrooms,
                "bathrooms": property.bathrooms,
                "accessibilities": accessibilities,
            }
            property_list.append(property_data)

        return jsonify({"success": True, "properties": property_list}), 200
    except Exception as e:
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500