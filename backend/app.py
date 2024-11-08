from sqlalchemy.orm import sessionmaker


from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from werkzeug.security import generate_password_hash, check_password_hash



import pymysql
app = Flask(__name__)
app.secret_key = 'my backend secret_key'

# Configure the database URI for SQLAlchemy
username = 't3'  # Replace with actual username
password = 'Hav0nBDwD4uyvcZt'  # Replace with actual password

# Define the MariaDB engine using MariaDB Connector/Python
engine = sqlalchemy.create_engine( f"mysql+pymysql://{username}:{password}@34.125.69.91/f24_housing_db" , connect_args={'ssl': {'disabled': True}})

Base = declarative_base()

Session = sessionmaker(bind=engine)
session = Session()

# Update the User model to include a 'role' or 'tag' field
class User(UserMixin, Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(length=150), unique=True)
    password = Column(String(length=170))
    firstname = Column(String(length=100))
    lastname = Column(String(length=100))
    active = Column(Boolean, default=True)
    role = Column(String(length=50), default="tenant")  # New field to define role ('landlord' or 'tenant')
    
    # Relationship to manage user properties only if they are a landlord
    properties = relationship("Property", back_populates="user", cascade="all, delete-orphan")

# Adjust the Property model to check for user role
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
    return session.query(User).get(user_id)

# Register route
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    password = data['password']
    firstname = data['firstName']
    lastname = data['lastName']

    existing_user = session.query(User).filter_by(username=username).first()
    if existing_user:
        return jsonify({"success": False, "message": "Username already exists"})

    hashed_password = generate_password_hash(password, method='scrypt')
    new_user = User(username=username, password=hashed_password, firstname=firstname, lastname=lastname)
    
    session.add(new_user)
    session.commit()

    return jsonify({"success": True, "message": "User registered successfully"})

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    user = session.query(User).filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        login_user(user)
        return jsonify({"success": True, "message": "Login successful"})

    # Function to delete a user
@app.route('/user/delete/<int:user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):
    user = session.query(User).get(user_id)
    if user:
        session.delete(user)
        session.commit()
        return jsonify({"success": True, "message": "User deleted successfully"})
    return jsonify({"success": False, "message": "User not found"})

# Function to update user details
@app.route('/user/update/<int:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    data = request.json
    user = session.query(User).get(user_id)
    if user:
        user.username = data.get('username', user.username)
        user.firstname = data.get('firstname', user.firstname)
        user.lastname = data.get('lastname', user.lastname)
        if 'password' in data:
            user.password = generate_password_hash(data['password'], method='scrypt')
        session.commit()
        return jsonify({"success": True, "message": "User updated successfully"})
    return jsonify({"success": False, "message": "User not found"})
    
    return jsonify({"success": False, "message": "Invalid username or password"})

# Route to add a new property, accessible only to landlords
@app.route('/property/add', methods=['POST'])
@login_required
def add_property():
    if current_user.role != "landlord":
        return jsonify({"success": False, "message": "User must be a landlord to add properties"}), 403

    data = request.json
    new_property = Property(
        size_sqft=data['size_sqft'],
        price=data['price'],
        bedrooms=data['bedrooms'],
        bathrooms=data['bathrooms'],
        user_id=current_user.id
    )
    session.add(new_property)
    session.commit()
    return jsonify({"success": True, "message": "Property added successfully"})

# Route to update property, only accessible to landlords
@app.route('/property/update/<int:property_id>', methods=['PUT'])
@login_required
def update_property(property_id):
    if current_user.role != "landlord":
        return jsonify({"success": False, "message": "User must be a landlord to update properties"}), 403

    data = request.json
    property_ = session.query(Property).get(property_id)
    if property_ and property_.user_id == current_user.id:
        property_.size_sqft = data.get('size_sqft', property_.size_sqft)
        property_.price = data.get('price', property_.price)
        property_.bedrooms = data.get('bedrooms', property_.bedrooms)
        property_.bathrooms = data.get('bathrooms', property_.bathrooms)
        session.commit()
        return jsonify({"success": True, "message": "Property updated successfully"})
    return jsonify({"success": False, "message": "Property not found or unauthorized"})

# Route to delete property, only accessible to landlords
@app.route('/property/delete/<int:property_id>', methods=['DELETE'])
@login_required
def delete_property(property_id):
    if current_user.role != "landlord":
        return jsonify({"success": False, "message": "User must be a landlord to delete properties"}), 403

    property_ = session.query(Property).get(property_id)
    if property_ and property_.user_id == current_user.id:
        session.delete(property_)
        session.commit()
        return jsonify({"success": True, "message": "Property deleted successfully"})
    return jsonify({"success": False, "message": "Property not found or unauthorized"})

if __name__ == '__main__':
    app.run(debug=True)