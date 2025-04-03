from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import session, User
import traceback

# Create Blueprint for user routes
users_bp = Blueprint("users", __name__)

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
        firstname = data.get("firstname")
        lastname = data.get("lastname")
        email = data.get("email")
        phone = data.get("phone")
        businessName = data.get("businessName") if current_user.role == "landlord" else None
        profile_picture = request.files.get("profile_picture")

        user = session.query(User).filter_by(id=current_user.id).first()
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        if firstname:
            user.firstname = firstname
        if lastname:
            user.lastname = lastname
        if email:
            existing_user = session.query(User).filter(User.email == email, User.id != current_user.id).first()
            if existing_user:
                return jsonify({"success": False, "message": "Email is already in use"}), 400
            user.email = email
        if phone:
            user.phone = phone
        if businessName:
            user.businessName = businessName

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
