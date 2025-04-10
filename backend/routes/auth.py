from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models import session, User
import traceback
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, Field, validator
from typing import Optional

# Create Blueprint for authentication
auth_bp = Blueprint("auth", __name__)

# Pydantic models for validation
class UserRegisterModel(BaseModel):
    username: str = Field(..., description="Username")
    email: str = Field(..., description="Email address")
    password: str = Field(..., description="Password")
    firstName: str = Field(..., description="First name")
    lastName: str = Field(..., description="Last name")
    role: str = Field(..., description="User role (tenant or landlord)")
    phone: Optional[str] = Field(None, description="Phone number")
    businessName: Optional[str] = Field(None, description="Business name (required for landlords)")

    @validator('role')
    def validate_role(cls, v):
        if v not in ["tenant", "landlord"]:
            raise ValueError("Role must be either 'tenant' or 'landlord'")
        return v

    @validator('businessName')
    def validate_business_name(cls, v, values):
        if 'role' in values and values['role'] == 'landlord' and not v:
            raise ValueError("Business name is required for landlords")
        return v

    class Config:
        orm_mode = True

class UserLoginModel(BaseModel):
    username: str = Field(..., description="Username")
    password: str = Field(..., description="Password")

    class Config:
        orm_mode = True

# Register route
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json

        # Debugging: Log received data
        print("Received Registration Data:", data)

        try:
            # Validate data using Pydantic model
            user_data = UserRegisterModel(**data)
        except ValueError as e:
            return jsonify({"success": False, "message": f"Validation error: {str(e)}"}), 400

        # Extract validated fields
        username = user_data.username
        email = user_data.email
        phone = user_data.phone
        password = user_data.password
        firstname = user_data.firstName
        lastname = user_data.lastName
        role = user_data.role
        business_name = user_data.businessName

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
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json

        try:
            # Validate data using Pydantic model
            login_data = UserLoginModel(**data)
        except ValueError as e:
            return jsonify({"success": False, "message": f"Validation error: {str(e)}"}), 400

        username = login_data.username
        password = login_data.password

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
@auth_bp.route("/logout", methods=["GET"])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "User logged out successfully"}), 200

# Get user profile
@auth_bp.route("/api/user/profile", methods=["GET"])
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
