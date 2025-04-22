import traceback
from typing import Optional, List, Dict, Any

from flask import jsonify, request
from flask_login import login_required, current_user
from flask_openapi3 import APIBlueprint, Tag
from pydantic import BaseModel, Field

from models import session, User

# Create APIBlueprint for user routes
users_tag = Tag(name="users", description="User management operations")
users_api = APIBlueprint("users", __name__, abp_tags=[users_tag])


# Pydantic model for validation
class UserProfileUpdateModel(BaseModel):
    firstname: Optional[str] = Field(None, description="First name")
    lastname: Optional[str] = Field(None, description="Last name")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    businessName: Optional[str] = Field(None, description="Business name (for landlords)")


# Form data model for profile update
class UserProfileUpdateFormData(BaseModel):
    firstname: Optional[str] = Field(None, description="First name")
    lastname: Optional[str] = Field(None, description="Last name")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    businessName: Optional[str] = Field(None, description="Business name (for landlords)")


# Response models
class SuccessResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    message: str = Field(..., description="Success message")


class ErrorResponse(BaseModel):
    success: bool = Field(False, description="Error status")
    message: str = Field(..., description="Error message")
    error: Optional[str] = Field(None, description="Detailed error information")


class UserData(BaseModel):
    id: int = Field(..., description="User ID")
    firstname: str = Field(..., description="First name")
    lastname: str = Field(..., description="Last name")


class UserListResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    users: List[UserData] = Field(..., description="List of users")


class UserProfileResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    profile: Dict[str, Any] = Field(..., description="User profile data")


# Get all users
@users_api.get(
    "/api/users",
    summary="Get all users",
    description="Retrieve a list of all users",
    responses={
        200: UserListResponse,
        500: ErrorResponse
    }
)
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
@users_api.get(
    "/api/user/profile",
    summary="Get user profile",
    description="Get the profile of the currently logged in user",
    responses={
        200: UserProfileResponse,
        500: ErrorResponse
    }
)
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
@users_api.put(
    "/api/user/update-profile",
    summary="Update user profile",
    description="Update the profile of the currently logged in user",
    responses={
        200: SuccessResponse,
        400: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse
    },
)
@login_required
def update_user_profile(form: UserProfileUpdateFormData):
    try:
        profile_picture = request.files.get("profile_picture")

        try:
            # Prepare data for validation
            update_data = {}
            if form.firstname is not None:
                update_data['firstname'] = form.firstname
            if form.lastname is not None:
                update_data['lastname'] = form.lastname
            if form.email is not None:
                update_data['email'] = form.email
            if form.phone is not None:
                update_data['phone'] = form.phone
            if form.businessName is not None and current_user.role == "landlord":
                update_data['businessName'] = form.businessName

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
            existing_user = session.query(User).filter(User.email == profile_data.email,
                                                       User.id != current_user.id).first()
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


class DeleteUserPath(BaseModel):
    user_id: int = Field(..., description="User ID")


# Delete user
@users_api.delete(
    "/user/delete/<int:user_id>",
    summary="Delete a user",
    description="Delete a user",
    responses={
        200: SuccessResponse,
        404: ErrorResponse,
        500: ErrorResponse
    }
)
@login_required
def delete_user(path: DeleteUserPath):
    try:
        user_id = path.user_id
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


@users_api.get(
    "/api/current-user",
    summary="Get current user",
    description="Returns the currently logged-in user's information, similar to /api/user/profile but under the key 'user' for easier front-end consumption",
    responses={
        200: UserProfileResponse,
        500: ErrorResponse
    }
)
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


class GetUserPath(BaseModel):
    user_id: int = Field(..., description="User ID")


@users_api.get(
    "/api/user/<int:user_id>",
    summary="Get user by ID",
    description="Get a user by their ID",
    responses={
        200: UserProfileResponse,
        404: ErrorResponse,
        500: ErrorResponse
    }
)
@login_required
def get_user_by_id(path: GetUserPath):
    try:
        user_id = path.user_id
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
