from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import session, User, Preferences
from sqlalchemy.exc import SQLAlchemyError
import traceback

accessibility_bp = Blueprint("accessibility", __name__)

@accessibility_bp.route('/api/user/accessibility', methods=['POST'])
@login_required
def create_preferences():
    try:
        data = request.form
        print(request.form)
        size_sqft = data.get('size_sqft')
        price = data.get('price')
        bedrooms = data.get('bedrooms')
        bathrooms = data.get('bathrooms')

        if not all([size_sqft, price, bedrooms, bathrooms]):
            return jsonify({"success": False, "message": "All preference fields are required"}), 400

        new_preferences = Preferences(
            size_sqft=float(size_sqft),
            price=float(price),
            bedrooms=int(bedrooms),
            bathrooms=int(bathrooms),
            user_id=current_user.id,
            
        )

        session.add(new_preferences)
        session.commit()

        return jsonify({"success": True, "message": "Preferences Updated Successfully"}), 201

    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"success": False, "message": "Database error", "error": str(e)}), 500

    except Exception as e:
        session.rollback()
        traceback.print_exc()
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500
