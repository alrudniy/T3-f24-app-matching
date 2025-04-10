from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import session, User
import traceback
from pydantic import BaseModel, Field, validator
from typing import Optional

# Create Blueprint for user routes
users_bp = Blueprint("users", __name__)

# Pydantic model for validation
class UserProfileUpdateModel(BaseModel):
    firstname: Optional[str] = Field(None, description="First name")
    lastname: Optional[str] = Field(None, description="Last name")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    businessName: Optional[str] = Field(None, description="Business name (for landlords)")

    class Config:
        orm_mode = True

# Get all users
@users_bp.route("/api/users", methods=["GET"])
@login_required
def get_users():
    try:
        users = session.query(User).all()
        user_list = [
            {"id": user.id, "firstname": user.firstname, "lastname": user.lastname}
            for user in users
        ]
        return jsonify({"success": True, "users": user_list}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "message": "An error occurred", "error": str(e)}), 500

# Get user profile (already handled in auth.py, but adding another route here if needed)
@users_bp.route("/api/user/profile", methods=["GET"])
@login_required
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

# Update user profile
@users_bp.route("/api/user/update-profile", methods=["PUT"])
@login_required
def update_user_profile():
    try:
        data = request.form
        profile_picture = request.files.get("profile_picture")

        try:
            # Prepare data for validation
            update_data = {}
            if 'firstname' in data:
                update_data['firstname'] = data.get('firstname')
            if 'lastname' in data:
                update_data['lastname'] = data.get('lastname')
            if 'email' in data:
                update_data['email'] = data.get('email')
            if 'phone' in data:
                update_data['phone'] = data.get('phone')
            if 'businessName' in data and current_user.role == "landlord":
                update_data['businessName'] = data.get('businessName')

            # Validate data using Pydantic model
            profile_data = UserProfileUpdateModel(**update_data)
        except ValueError as e:
            return jsonify({"success": False, "message": f"Validation error: {str(e)}"}), 400

        user = session.query(User).filter_by(id=current_user.id).first()
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        # Update user with validated data
        if profile_data.firstname is not None:
            user.firstname = profile_data.firstname
        if profile_data.lastname is not None:
            user.lastname = profile_data.lastname
        if profile_data.email is not None:
            existing_user = session.query(User).filter(User.email == profile_data.email, User.id != current_user.id).first()
            if existing_user:
                return jsonify({"success": False, "message": "Email is already in use"}), 400
            user.email = profile_data.email
        if profile_data.phone is not None:
            user.phone = profile_data.phone
        if profile_data.businessName is not None and current_user.role == "landlord":
            user.businessName = profile_data.businessName

        # Handle profile picture upload
        if profile_picture:
            filename = f"{current_user.id}_{profile_picture.filename}"
            filepath = f"./uploads/{filename}"
            profile_picture.save(filepath)
            user.profile_picture = filename

        session.commit()
        return jsonify({"success": True, "message": "Profile updated successfully"}), 200
    except Exception as e:
        session.rollback()
        traceback.print_exc()
        return jsonify({"success": False, "message": "An error occurred", "error": str(e)}), 500

# Delete user
@users_bp.route("/user/delete/<int:user_id>", methods=["DELETE"])
@login_required
def delete_user(user_id):
    try:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        session.delete(user)
        session.commit()
        return jsonify({"success": True, "message": "User deleted successfully"}), 200
    except Exception as e:
        session.rollback()
        traceback.print_exc()
        return jsonify({"success": False, "message": "An error occurred", "error": str(e)}), 500

@users_bp.route("/api/current-user", methods=["GET"])
@login_required
def get_current_user():
    """
    Returns the currently logged-in user's information, 
    similar to /api/user/profile but under the key "user"
    for easier front-end consumption.
    """
    try:
        # Build the user data from current_user
        user_data = {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "phone": current_user.phone,
            "firstname": current_user.firstname,
            "lastname": current_user.lastname,
            "role": current_user.role,
            "businessName": current_user.businessName,
            "profile_picture": (
                f"http://localhost:5000/uploads/{current_user.profile_picture}"
                if current_user.profile_picture
                else "https://via.placeholder.com/150"
            ),
        }

        return jsonify({
            "success": True,
            "user": user_data  # <-- key is "user" so front-end can do data.user
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": "Failed to fetch user",
            "error": str(e)
        }), 500
@users_bp.route("/api/user/<int:user_id>", methods=["GET"])
@login_required
def get_user_by_id(user_id):
    try:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        profile = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "role": user.role,
            "businessName": user.businessName,
            "profile_picture": (
                f"http://localhost:5000/uploads/{user.profile_picture}"
                if user.profile_picture
                else "https://via.placeholder.com/150"
            ),
        }

        return jsonify({"success": True, "profile": profile}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "message": "Failed to fetch user", "error": str(e)}), 500
