from flask import Flask
from flask_login import LoginManager, current_user
from flask_cors import CORS
from datetime import timedelta
from models import init_db, session, User
from routes.properties import properties_bp
from routes.uploads import uploads_bp
from routes.auth import auth_bp
from routes.users import users_bp
from routes.matches import matches_bp


# Initialize Flask app
app = Flask(__name__)

# Configure the app for sessions
app.secret_key = "your_secret_key"  # Should change this to something secure
app.config["SESSION_COOKIE_NAME"] = "session_id"
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=4)

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
    """Logs if a user is not authenticated before processing a request."""
    if not current_user.is_authenticated:
        print("User not authenticated")

# Flask teardown to clean up sessions
@app.teardown_appcontext
def cleanup_session(exception=None):
    """Ensures the session is properly closed to prevent issues."""
    if exception:
        session.rollback()  # Rollback if there's an exception
    session.close()  # Always close the session

# Main entry point
if __name__ == '__main__':
    app.run(debug=True)
