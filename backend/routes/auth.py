import traceback
from enum import Enum
from typing import Optional, Dict, Any

from flask import jsonify
from flask_login import login_user, logout_user, login_required, current_user
from flask_openapi3 import APIBlueprint, Tag
from pydantic import BaseModel, Field
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import generate_password_hash, check_password_hash

from models import session, User

# Create APIBlueprint for authentication
auth_tag = Tag(name="auth", description="Authentication operations")
auth_api = APIBlueprint("auth", __name__, abp_tags=[auth_tag])


class UserRole(str, Enum):
    Tenant = "tenant"
    Landlord = "landlord"


# Pydantic models for validation
class UserRegisterModel(BaseModel):
    username: str = Field(..., description="Username")
    email: str = Field(..., description="Email address")
    password: str = Field(..., description="Password")
    firstName: str = Field(..., description="First name")
    lastName: str = Field(..., description="Last name")
    role: UserRole = Field(..., description="User role (tenant or landlord)")
    phone: Optional[str] = Field(None, description="Phone number")
    businessName: Optional[str] = Field(None, description="Business name (required for landlords)")


class UserLoginModel(BaseModel):
    username: str = Field(..., description="Username")
    password: str = Field(..., description="Password")


# Response models
class SuccessResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    message: str = Field(..., description="Success message")


class ErrorResponse(BaseModel):
    success: bool = Field(False, description="Error status")
    message: str = Field(..., description="Error message")
    error: Optional[str] = Field(None, description="Detailed error information")


class UserProfileData(BaseModel):
    id: int = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    email: str = Field(..., description="Email address")
    role: str = Field(..., description="User role")


class LoginSuccessResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    message: str = Field(..., description="Success message")
    user: UserProfileData = Field(..., description="User profile data")


class ProfileResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    profile: Dict[str, Any] = Field(..., description="User profile data")


# Register route
@auth_api.post(
    '/register',
    summary="Register a new user",
    description="Register a new user with the provided information",
    responses={
        201: SuccessResponse,
        400: ErrorResponse,
        500: ErrorResponse
    }
)
def register(body: UserRegisterModel):
    try:
        username = body.username
        email = body.email
        phone = body.phone
        password = body.password
        firstname = body.firstName
        lastname = body.lastName
        role = body.role
        business_name = body.businessName

        if role == UserRole.Landlord and business_name is None:
            return jsonify({"success": False, "message": "Business name is required for landlords"}), 400

        # Check if email or username already exists
        existing_user = session.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        if existing_user:
            return jsonify({"success": False, "message": "Username or email already exists"}), 400

        # Hash the password
        hashed_password = generate_password_hash(password, method='scrypt')

        # Create new user
        new_user = User(
            username=username,
            email=email,
            phone=phone,
            password=hashed_password,
            firstname=firstname,
            lastname=lastname,
            role=role,
            businessName=business_name,
        )

        session.add(new_user)
        session.commit()

        print("User registered successfully:", new_user.id)
        return jsonify({"success": True, "message": "User registered successfully"}), 201

    except SQLAlchemyError as e:
        session.rollback()
        print("Database Error:", str(e))
        return jsonify({"success": False, "message": "Database error", "error": str(e)}), 500

    except Exception as e:
        print("Unexpected Error:", str(e))
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500

    finally:
        session.close()


# Login route
@auth_api.post(
    "/login",
    summary="Login a user",
    description="Login a user with the provided credentials",
    responses={
        200: LoginSuccessResponse,
        401: ErrorResponse,
        500: ErrorResponse
    },
)
def login(body: UserLoginModel):
    try:
        username = body.username
        password = body.password

        # Retrieve the user from the database
        user = session.query(User).filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            login_user(user)
            return jsonify(
                {
                    "success": True,
                    "message": "Login successful",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": user.role,
                    },
                }
            ), 200

        return jsonify({"success": False, "message": "Invalid username or password"}), 401
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "message": "An error occurred", "error": str(e)}), 500


# Logout route
@auth_api.get(
    "/logout",
    summary="Logout a user",
    description="Logout the currently logged in user",
    responses={
        200: SuccessResponse,
        401: ErrorResponse,
        500: ErrorResponse
    }
)
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "User logged out successfully"}), 200


# Get user profile
@auth_api.get(
    "/api/user/profile",
    summary="Get user profile",
    description="Get the profile of the currently logged in user",
    responses={
        200: ProfileResponse,
        401: ErrorResponse,
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
