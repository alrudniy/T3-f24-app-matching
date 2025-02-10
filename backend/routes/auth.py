from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models import session, User
import traceback
from sqlalchemy.exc import SQLAlchemyError

# Create Blueprint for authentication
auth_bp = Blueprint("auth", __name__)

# Register route
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json

        # Debugging: Log received data
        print("Received Registration Data:", data)

        # Extract fields from request
        username = data.get('username')
        email = data.get('email')
        phone = data.get('phone')
        password = data.get('password')
        firstname = data.get('firstName')
        lastname = data.get('lastName')
        role = data.get('role')
        business_name = data.get('businessName') if role == "landlord" else None

        # Validate required fields
        if not all([username, email, password, firstname, lastname, role]):
            return jsonify({"success": False, "message": "All fields are required"}), 400

        if role == "landlord" and not business_name:
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
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"success": False, "message": "Username and password are required"}), 400

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
