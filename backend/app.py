from flask_cors import CORS
from flask_login import LoginManager, current_user
from flask_openapi3 import OpenAPI, Info
from sqlalchemy import create_engine

from config import UPLOAD_FOLDER, DATABASE_CONFIG, SECRET_KEY, SESSION_COOKIE_NAME
from models import init_db, User, SessionLocal, session
from routes.accessibility import accessibility_api
from routes.auth import auth_api
from routes.matches import matches_api
from routes.properties import properties_api
from routes.uploads import uploads_api
from routes.users import users_api
from routes.voucher import voucher_api

# Initialize OpenAPI app
info = Info(title="Property Matching API", version="1.0.0")
app = OpenAPI(__name__, info=info)

# Load configurations
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.secret_key = SECRET_KEY
app.config["SESSION_COOKIE_NAME"] = SESSION_COOKIE_NAME

# Use DATABASE_CONFIG for database setup
db_config = DATABASE_CONFIG
engine = create_engine(
    f"mysql+pymysql://{db_config['username']}:{db_config['password']}@{db_config['db_host']}/{db_config['db_name']}",
    connect_args={'ssl': {'disabled': True}}
)

# Initialize the database tables
init_db()

# Register all routes from the routes package
app.register_api(properties_api)
app.register_api(uploads_api)
app.register_api(auth_api)
app.register_api(users_api)
app.register_api(matches_api)
app.register_api(voucher_api)
app.register_api(accessibility_api)

# Initialize CORS to allow credentials (cookies)
CORS(app, supports_credentials=True)

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "auth.login"


@login_manager.user_loader
def load_user(user_id):
    return session.query(User).get(int(user_id))


@app.before_request
def check_user():
    """ Logs if a user is not authenticated before processing a request """
    if not current_user.is_authenticated:
        print("User not authenticated")


@app.teardown_appcontext
def cleanup_session(exception=None):
    """ Close the database session after each request """
    db = SessionLocal()
    try:
        if exception:
            db.rollback()
        else:
            db.commit()
    except:
        db.rollback()
    finally:
        db.close()


# Main entry point
if __name__ == '__main__':
    app.run(debug=True)
