from flask import Flask, jsonify, request, render_template, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy import create_engine, Column, String, Boolean, Integer, Float, ForeignKey
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import CORS
import os

# Flask app setup
app = Flask(__name__)
app.secret_key = 'my backend secret_key'  # Hardcoded secret key
CORS(app)

# File upload configuration
UPLOAD_FOLDER = 'uploads/profile_pictures'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the upload directory exists

# Database configuration
username = 't3'  # Replace with actual username
password = 'Hav0nBDwD4uyvcZt'  # Replace with actual password
db_host = '34.125.69.91'
db_name = 'f24_housing_db'

engine = create_engine(
    f"mysql+pymysql://{username}:{password}@{db_host}/{db_name}",
    connect_args={'ssl': {'disabled': True}}
)

Base = declarative_base()
Session = sessionmaker(bind=engine)
session = Session()

# Models
class User(UserMixin, Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(length=150), unique=True)
    password = Column(String(length=170))
    firstname = Column(String(length=100))
    lastname = Column(String(length=100))
    active = Column(Boolean, default=True)
    role = Column(String(length=50), default="tenant")  # Role: 'tenant' or 'landlord'
    businessName = Column(String(length=200), nullable=True)  # Only for landlords
    profile_picture = Column(String(length=255), nullable=True)  # Profile picture path
    properties = relationship("Property", back_populates="user", cascade="all, delete-orphan")

class Property(Base):
    __tablename__ = 'property'
    id = Column(Integer, primary_key=True, autoincrement=True)
    size_sqft = Column(Float)
    price = Column(Float)
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    user_id = Column(Integer, ForeignKey('user.id'))
    user = relationship("User", back_populates="properties")

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return session.get(User, user_id)  # Updated for SQLAlchemy 2.0

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Routes

# Register route
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        firstname = data.get('firstName')
        lastname = data.get('lastName')
        role = data.get('role')
        business_name = data.get('businessName')  # Optional field

        if not username or not password or not firstname or not lastname or not role:
            return jsonify({"success": False, "message": "All fields are required"})

        if role == "landlord" and not business_name:
            return jsonify({"success": False, "message": "Business name is required for landlords"})

        existing_user = session.query(User).filter_by(username=username).first()
        if existing_user:
            return jsonify({"success": False, "message": "Username already exists"})

        hashed_password = generate_password_hash(password, method='scrypt')
        new_user = User(
            username=username,
            password=hashed_password,
            firstname=firstname,
            lastname=lastname,
            role=role,
            businessName=business_name if role == "landlord" else None
        )

        session.add(new_user)
        session.commit()

        return jsonify({"success": True, "message": "User registered successfully"})
    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"success": False, "message": "Database error", "error": str(e)})
    finally:
        session.close()

# Login route
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"success": False, "message": "Username and password are required"})

        user = session.query(User).filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            login_user(user)
            return jsonify({"success": True, "message": "Login successful"})

        return jsonify({"success": False, "message": "Invalid username or password"})
    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": "Database error", "error": str(e)})
    finally:
        session.close()

# Logout route
@app.route('/logout', methods=['GET'])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "User logged out successfully"})

# Get user profile
@app.route('/api/user/profile', methods=['GET'])
@login_required
def get_user_profile():
    try:
        user = {
            "id": current_user.id,
            "username": current_user.username,
            "firstname": current_user.firstname,
            "lastname": current_user.lastname,
            "role": current_user.role,
            "businessName": current_user.businessName,
            "profile_picture": current_user.profile_picture
        }
        return jsonify({"success": True, "profile": user})
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to fetch profile", "error": str(e)})

# Update user profile
@app.route('/api/user/update-profile', methods=['PUT'])
@login_required
def update_user_profile():
    try:
        data = request.form
        firstname = data.get('firstname')
        lastname = data.get('lastname')
        businessName = data.get('businessName') if current_user.role == "landlord" else None
        profile_picture = request.files.get('profile_picture')

        user = session.query(User).filter_by(id=current_user.id).first()
        if not user:
            return jsonify({"success": False, "message": "User not found"})

        if firstname:
            user.firstname = firstname
        if lastname:
            user.lastname = lastname
        if businessName:
            user.businessName = businessName

        if profile_picture and allowed_file(profile_picture.filename):
            filename = secure_filename(profile_picture.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{current_user.id}_{filename}")
            profile_picture.save(filepath)
            user.profile_picture = filepath

        session.commit()
        return jsonify({"success": True, "message": "Profile updated successfully"})
    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"success": False, "message": "Database error", "error": str(e)})
    finally:
        session.close()

if __name__ == '__main__':
    app.run(debug=True)
