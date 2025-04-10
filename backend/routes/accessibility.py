from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import session, User, Preferences
from sqlalchemy.exc import SQLAlchemyError
import traceback
from pydantic import BaseModel, Field, validator
from typing import Optional

accessibility_bp = Blueprint("accessibility", __name__)

class PreferencesModel(BaseModel):
    size_sqft: float = Field(..., description="Size in square feet")
    price: float = Field(..., description="Price")
    bedrooms: int = Field(..., description="Number of bedrooms")
    bathrooms: int = Field(..., description="Number of bathrooms")

    class Config:
        orm_mode = True

@accessibility_bp.route('/api/user/accessibility', methods=['POST'])
@login_required
def create_preferences():
    try:
        data = request.form
        print(request.form)

        try:
            # Validate data using Pydantic model
            preferences_data = PreferencesModel(
                size_sqft=float(data.get('size_sqft', 0)),
                price=float(data.get('price', 0)),
                bedrooms=int(data.get('bedrooms', 0)),
                bathrooms=int(data.get('bathrooms', 0))
            )
        except ValueError as e:
            return jsonify({"success": False, "message": f"Validation error: {str(e)}"}), 400

        # Create new preferences object using validated data
        new_preferences = Preferences(
            size_sqft=preferences_data.size_sqft,
            price=preferences_data.price,
            bedrooms=preferences_data.bedrooms,
            bathrooms=preferences_data.bathrooms,
            user_id=current_user.id
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
