import traceback
from typing import Optional, List

from flask import jsonify
from flask_login import login_required, current_user
from flask_openapi3 import APIBlueprint, Tag
from pydantic import BaseModel, Field
from sqlalchemy.exc import SQLAlchemyError

from models import session, Voucher

# APIBlueprint for vouchers
voucher_tag = Tag(name="voucher", description="Voucher management operations")
voucher_api = APIBlueprint("voucher", __name__, abp_tags=[voucher_tag])


# Pydantic models for validation
class VoucherCreateModel(BaseModel):
    expiration_date: Optional[str] = Field(None, description="Expiration date of the voucher")
    price_limit: Optional[int] = Field(None, description="Price limit for the voucher")
    housing_type: Optional[str] = Field(None, description="Type of housing")
    family_members: Optional[int] = Field(None, description="Number of family members")

    class Config:
        orm_mode = True


class VoucherUpdateModel(BaseModel):
    expiration_date: Optional[str] = Field(None, description="Expiration date of the voucher")
    price_limit: Optional[int] = Field(None, description="Price limit for the voucher")
    housing_type: Optional[str] = Field(None, description="Type of housing")
    family_members: Optional[int] = Field(None, description="Number of family members")

    class Config:
        orm_mode = True


# Response models
class SuccessResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    message: str = Field(..., description="Success message")


class ErrorResponse(BaseModel):
    success: bool = Field(False, description="Error status")
    message: str = Field(..., description="Error message")
    error: Optional[str] = Field(None, description="Detailed error information")


class VoucherCreateSuccessResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    message: str = Field(..., description="Success message")
    voucher_id: int = Field(..., description="ID of the created voucher")


class VoucherData(BaseModel):
    id: int = Field(..., description="Voucher ID")
    expiration_date: Optional[str] = Field(None, description="Expiration date of the voucher")
    price_limit: Optional[int] = Field(None, description="Price limit for the voucher")
    housing_type: Optional[str] = Field(None, description="Type of housing")
    family_members: Optional[int] = Field(None, description="Number of family members")


class VoucherListResponse(BaseModel):
    success: bool = Field(True, description="Success status")
    vouchers: List[VoucherData] = Field(..., description="List of vouchers")


# Create a new voucher (only logged-in users can create vouchers)
@voucher_api.post(
    '/api/voucher/create',
    summary="Create a voucher",
    description="Create a new voucher for the logged-in user",
    responses={
        201: VoucherCreateSuccessResponse,
        400: ErrorResponse,
        500: ErrorResponse
    },
)
@login_required
def create_voucher(body: VoucherCreateModel):
    try:
        # Data is already validated by Pydantic
        voucher_data = body

        # Create new voucher using validated data
        new_voucher = Voucher(
            user_id=current_user.id,  # Assign the logged-in user
            expiration_date=voucher_data.expiration_date,
            price_limit=voucher_data.price_limit,
            housing_type=voucher_data.housing_type,
            family_members=voucher_data.family_members
        )

        session.add(new_voucher)
        session.commit()
        return jsonify({"success": True, "message": "Voucher created successfully", "voucher_id": new_voucher.id}), 201
    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"success": False, "message": "Database error", "error": str(e)}), 500
    except Exception as e:
        session.rollback()
        traceback.print_exc()
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500
    finally:
        session.close()


@voucher_api.get(
    '/api/voucher/user',
    summary="Get user vouchers",
    description="Get all vouchers for the logged-in user",
    responses={
        200: VoucherListResponse,
        500: ErrorResponse
    }
)
@login_required
def get_user_vouchers():
    try:
        print(f"Current user ID: {current_user.id}")  # Debugging log

        vouchers = session.query(Voucher).filter_by(user_id=current_user.id).all()
        print(f"Vouchers found: {vouchers}")  # Debugging log

        voucher_list = [
            {
                "id": v.id,
                "expiration_date": v.expiration_date,
                "price_limit": v.price_limit,
                "housing_type": v.housing_type,
                "family_members": v.family_members,
            }
            for v in vouchers
        ]
        return jsonify({"success": True, "vouchers": voucher_list}), 200

    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": "Database error", "error": str(e)}), 500
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500


class DeleteVoucherPath(BaseModel):
    voucher_id: int = Field(..., description="ID of the voucher to delete")


@voucher_api.delete(
    '/api/voucher/delete/<int:voucher_id>',
    summary="Delete a voucher",
    description="Delete a voucher belonging to the logged-in user",
    responses={
        200: SuccessResponse,
        404: ErrorResponse,
        500: ErrorResponse
    }
)
@login_required
def delete_voucher(path: DeleteVoucherPath):
    try:
        voucher_id = path.voucher_id
        voucher = session.query(Voucher).filter_by(id=voucher_id, user_id=current_user.id).first()

        if not voucher:
            return jsonify({"success": False, "message": "Voucher not found"}), 404

        session.delete(voucher)
        session.commit()
        return jsonify({"success": True, "message": "Voucher deleted successfully"}), 200

    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"success": False, "message": "Database error", "error": str(e)}), 500

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500

    finally:
        session.close()


class UpdateVoucherPath(BaseModel):
    voucher_id: int = Field(..., description="ID of the voucher to update")


@voucher_api.put(
    '/api/voucher/update/<int:voucher_id>',
    summary="Update a voucher",
    description="Update a voucher belonging to the logged-in user",
    responses={
        200: SuccessResponse,
        400: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse
    },
)
@login_required
def update_voucher(path: UpdateVoucherPath, body: VoucherUpdateModel):
    try:
        voucher_id = path["voucher_id"]
        voucher = session.query(Voucher).filter_by(id=voucher_id, user_id=current_user.id).first()

        if not voucher:
            return jsonify({"success": False, "message": "Voucher not found"}), 404

        # Data is already validated by Pydantic
        voucher_data = body

        # Update voucher with validated data
        if voucher_data.expiration_date is not None:
            voucher.expiration_date = voucher_data.expiration_date
        if voucher_data.price_limit is not None:
            voucher.price_limit = voucher_data.price_limit
        if voucher_data.housing_type is not None:
            voucher.housing_type = voucher_data.housing_type
        if voucher_data.family_members is not None:
            voucher.family_members = voucher_data.family_members

        session.commit()
        return jsonify({"success": True, "message": "Voucher updated successfully"}), 200

    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"success": False, "message": "Database error", "error": str(e)}), 500

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500
