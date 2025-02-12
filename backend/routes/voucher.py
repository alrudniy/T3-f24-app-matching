from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import session, Voucher
from sqlalchemy.exc import SQLAlchemyError
import traceback
import os

# Blueprint for vouchers
voucher_bp = Blueprint("voucher", __name__)

# Create a new voucher (only logged-in users can create vouchers)
@voucher_bp.route('/voucher/create', methods=['POST'])
@login_required
def create_voucher():
    try:
        data = request.get_json()

        new_voucher = Voucher(
            user_id=current_user.id,  # Assign the logged-in user
            expiration_date=data.get('expiration_date'),
            price_limit=data.get('price_limit'),
            housing_type=data.get('housing_type'),
            family_members=data.get('family_members')
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



