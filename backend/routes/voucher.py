from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import session, Voucher
from sqlalchemy.exc import SQLAlchemyError
import traceback
import os

# Blueprint for vouchers
voucher_bp = Blueprint("voucher", __name__)

# Create a new voucher (only logged-in users can create vouchers)
@voucher_bp.route('/api/voucher/create', methods=['POST'])
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

@voucher_bp.route('/api/voucher/user', methods=['GET'])
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

@voucher_bp.route('/api/voucher/delete/<int:voucher_id>', methods=['DELETE'])
@login_required
def delete_voucher(voucher_id):
    try:
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

@voucher_bp.route('/api/voucher/update/<int:voucher_id>', methods=['PUT'])
@login_required
def update_voucher(voucher_id):
    try:
        data = request.get_json()
        voucher = session.query(Voucher).filter_by(id=voucher_id, user_id=current_user.id).first()

        if not voucher:
            return jsonify({"success": False, "message": "Voucher not found"}), 404

        # Update fields if provided
        if "expiration_date" in data:
            voucher.expiration_date = data["expiration_date"]
        if "price_limit" in data:
            voucher.price_limit = data["price_limit"]
        if "housing_type" in data:
            voucher.housing_type = data["housing_type"]
        if "family_members" in data:
            voucher.family_members = data["family_members"]

        session.commit()
        return jsonify({"success": True, "message": "Voucher updated successfully"}), 200

    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"success": False, "message": "Database error", "error": str(e)}), 500

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500






