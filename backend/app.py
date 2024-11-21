from sqlalchemy.orm import sessionmaker, relationship  # Consolidated imports
import flask_login
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, String, Boolean, Integer, Float, ForeignKey
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import CORS


# Flask app setup
app = Flask(__name__)
app.secret_key = 'my backend secret_key'  # Hardcoded secret key
CORS(app)

# Database configuration (hardcoded credentials)
username = 't3'  # Replace with actual username
password = 'Hav0nBDwD4uyvcZt'  # Replace with actual password
db_host = '34.125.69.91'
db_name = 'f24_housing_db'

# Database engine setup
engine = sqlalchemy.create_engine(
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

        if not username or not password or not firstname or not lastname:
            return jsonify({"success": False, "message": "All fields are required"})

        existing_user = session.query(User).filter_by(username=username).first()
        if existing_user:
            return jsonify({"success": False, "message": "Username already exists"})

        hashed_password = generate_password_hash(password, method='scrypt')
        new_user = User(username=username, password=hashed_password, firstname=firstname, lastname=lastname)

        session.add(new_user)
        session.commit()

        return jsonify({"success": True, "message": "User registered successfully"})
    except SQLAlchemyError as e:
        session.rollback()  # Rollback in case of error
        return jsonify({"success": False, "message": "Database error", "error": str(e)})
    finally:
        session.close()  # Close the session to prevent resource leaks


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
        session.close()  # Close the session


# Logout route
@app.route('/logout', methods=['GET'])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "User logged out successfully"})


# User update route
@app.route('/user/update/<int:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    try:
        data = request.json
        user = session.get(User, user_id)  # Updated for SQLAlchemy 2.0

        if not user:
            return jsonify({"success": False, "message": "User not found"})

        user.username = data.get('username', user.username)
        user.firstname = data.get('firstname', user.firstname)
        user.lastname = data.get('lastname', user.lastname)
        if 'password' in data:
            user.password = generate_password_hash(data['password'], method='scrypt')

        session.commit()
        return jsonify({"success": True, "message": "User updated successfully"})
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

if __name__ == '__main__':
    app.run(debug=True)
