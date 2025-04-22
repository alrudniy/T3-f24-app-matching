import traceback
from typing import Optional

from flask import jsonify
from flask_login import login_required, current_user
from flask_openapi3 import APIBlueprint, Tag
from pydantic import BaseModel, Field
from sqlalchemy.exc import SQLAlchemyError

from models import session, Preferences

accessibility_tag = Tag(name="accessibility", description="Accessibility and preferences operations")
accessibility_api = APIBlueprint("accessibility", __name__, abp_tags=[accessibility_tag])


class PreferencesModel(BaseModel):
    size_sqft: float = Field(..., description="Size in square feet")
    price: float = Field(..., description="Price")
    bedrooms: int = Field(..., description="Number of bedrooms")
    bathrooms: int = Field(..., description="Number of bathrooms")

    class Config:
        orm_mode = True


class PreferencesFormData(BaseModel):
    size_sqft: str = Field(..., description="Size in square feet")
    price: str = Field(..., description="Price")
    bedrooms: str = Field(..., description="Number of bedrooms")
    bathrooms: str = Field(..., description="Number of bathrooms")


class SuccessResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    message: str = Field(..., description="Success message")


class ErrorResponse(BaseModel):
    success: bool = Field(False, description="Error status")
    message: str = Field(..., description="Error message")
    error: Optional[str] = Field(None, description="Detailed error information")


@accessibility_api.post(
    "/api/user/accessibility",
    summary="Create user preferences",
    description="Create or update user accessibility preferences",
    responses={
        201: SuccessResponse,
        400: ErrorResponse,
        500: ErrorResponse
    },
)
@login_required
def create_preferences(form: PreferencesFormData):
    try:
        try:
            # Validate data using Pydantic model
            preferences_data = PreferencesModel(
                size_sqft=float(form.size_sqft),
                price=float(form.price),
                bedrooms=int(form.bedrooms),
                bathrooms=int(form.bathrooms)
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
