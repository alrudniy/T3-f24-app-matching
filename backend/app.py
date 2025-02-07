from flask import Flask, jsonify, request, redirect
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy import create_engine, Column, String, Boolean, Integer, Float, ForeignKey, func
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import CORS
from flask import send_from_directory
import os
from sqlalchemy.orm import relationship, backref
from sqlalchemy import Table
from datetime import timedelta
from models import init_db
from routes.properties import properties_bp 
from routes.uploads import uploads_bp
from routes.auth import auth_bp
from routes.users import users_bp
from routes.matches import matches_bp
 


app = Flask(__name__)


# Configure the app for sessions
app.secret_key = "your_secret_key"  # Change this to something secret
app.config["SESSION_COOKIE_NAME"] = "session_id"



# Initialize the database tables
init_db()

# Register all routes from the routes package
app.register_blueprint(properties_bp)
app.register_blueprint(uploads_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(matches_bp)
                       

# Initialize CORS to allow credentials (cookies)
CORS(app, supports_credentials=True)


# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

@login_manager.user_loader
def load_user(user_id):
    user = session.get(User, user_id)
    print(f"load_user called for user_id: {user_id}, Found: {user}")
    return user

@app.before_request
def check_user():
    if not current_user.is_authenticated:
        print("User not authenticated")

app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=4)


# Flask teardown to clean up sessions
@app.teardown_appcontext
def cleanup_session(exception=None):
    if exception:
        session.rollback()  # Rollback if there's an exception
    session.close()  # Always close the session

# Main entry point
if __name__ == '__main__':
    # Ensure tables are created before the application runs
    Base.metadata.create_all(engine)
    app.run(debug=True)
