from sqlalchemy.orm import sessionmaker


from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)
app.secret_key = 'my backend secret_key'

# Configure the database URI for SQLAlchemy
username = 't3'  # Replace with actual username
password = 'Hav0nBDwD4uyvcZt'  # Replace with actual password
engine = sqlalchemy.create_engine(f"mariadb+mariadbconnector://{username}:{password}@34.125.69.91/f24_housing_db")


Base = declarative_base()

Session = sessionmaker(bind=engine)
session = Session()

# Define the User model
class User(UserMixin, Base):  # Inherit from UserMixin for Flask-Login
    __tablename__ = 'user'
    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    username = sqlalchemy.Column(sqlalchemy.String(length=150), unique=True)
    password = sqlalchemy.Column(sqlalchemy.String(length=170))
    firstname = sqlalchemy.Column(sqlalchemy.String(length=100))
    lastname = sqlalchemy.Column(sqlalchemy.String(length=100))
    active = sqlalchemy.Column(sqlalchemy.Boolean, default=True)

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

if __name__ == '__main__':
    app.run(debug=True)
