from flask import Flask, jsonify, request, redirect
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy import create_engine, Column, String, Boolean, Integer, Float, ForeignKey, func
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import CORS
import os

# Flask app setup
app = Flask(__name__)
app.secret_key = 'my backend secret_key'
CORS(app)

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


class Match(Base):
    __tablename__ = 'match'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    property_id = Column(Integer, ForeignKey('property.id'))
    timestamp = Column(String, default=func.now())

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return session.get(User, user_id)


# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Routes

#Register route
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        firstname = data.get('firstName')
        lastname = data.get('lastName')
        role = data.get('role')
        business_name = data.get('businessName')

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

#login route
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

#Logout route
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

# Property creation route
@app.route('/property/create', methods=['POST'])
@login_required
def create_property():
    try:
        # Ensure only landlords can create properties
        if current_user.role != "landlord":
            return jsonify({"success": False, "message": "Only landlords can create properties"})

        data = request.json

        # Validate input data
        size_sqft = data.get('size_sqft')
        price = data.get('price')
        bedrooms = data.get('bedrooms')
        bathrooms = data.get('bathrooms')

        if not size_sqft or not price or not bedrooms or not bathrooms:
            return jsonify({"success": False, "message": "All property fields are required"})

        # Create the property
        new_property = Property(
            size_sqft=size_sqft,
            price=price,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            user_id=current_user.id  # Link property to the current logged-in user
        )

        session.add(new_property)
        session.commit()
        return jsonify({"success": True, "message": "Property created successfully"})
    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"success": False, "message": "Database error", "error": str(e)})
    finally:
        session.close()

# User delete route
@app.route('/user/delete/<int:user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):
    try:
        user = session.get(User, user_id)  # Updated for SQLAlchemy 2.0

        if not user:
            return jsonify({"success": False, "message": "User not found"})

        session.delete(user)
        session.commit()
        return jsonify({"success": True, "message": "User deleted successfully"})
    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"success": False, "message": "Database error", "error": str(e)})
    finally:
        session.close()

#Get all properties listings
@app.route('/api/properties', methods=['GET'])
@login_required
def get_properties():
    if current_user.role != "tenant":
        return jsonify({"success": False, "message": "This page is only available to tenants"})
    try:
        properties = session.query(Property).all()
        property_list = [
            {
                "id": property.id,
                "size_sqft": property.size_sqft,
                "price": property.price,
                "bedrooms": property.bedrooms,
                "bathrooms": property.bathrooms,
                "user_id": property.user_id
            }
            for property in properties
        ]

        return jsonify({"success": True, "properties": property_list})
    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": "Database error", "error": str(e)})
    finally:
        session.close()
        
#Set property as a match route
@app.route('/api/match', methods=['POST'])
@login_required
def match_property():
    if current_user.role != "tenant":
        return jsonify({"success": False, "message": "Only tenants can match properties"}), 403

    try:
        data = request.json
        property_id = data.get('property_id')

        if not property_id:
            return jsonify({"success": False, "message": "Property ID is required"}), 400

        property = session.query(Property).filter_by(id=property_id).first()
        if not property:
            return jsonify({"success": False, "message": "Property not found"}), 404

        existing_match = session.query(Match).filter_by(user_id=current_user.id, property_id=property_id).first()
        if existing_match:
            return jsonify({"success": False, "message": "You already matched with this property"}), 400

        new_match = Match(user_id=current_user.id, property_id=property_id)
        session.add(new_match)
        session.commit()

        return jsonify({"success": True, "message": "Property matched successfully"})
    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"success": False, "message": "Database error", "error": str(e)})
    finally:
        session.close()

# Main entry point
if __name__ == '__main__':
    Base.metadata.create_all(engine)  # Ensure tables are created
    app.run(debug=True)
