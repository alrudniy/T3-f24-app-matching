from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import Column, Integer, String, Date
from app import session, Base  # Assuming you're using session and Base from app.py

# Voucher Model
class Voucher(Base):
    __tablename__ = 'voucher'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=True)
    expiration_date = Column(Date, nullable=True)
    price_limit = Column(Integer, nullable=True)
    housing_type = Column(String(50), nullable=True)
    family_members = Column(Integer, nullable=True)

    def __repr__(self):
        return f"<Voucher(id={self.id}, user_id={self.user_id}, expiration_date={self.expiration_date})>"

# Blueprint for voucher routes
voucher_bp = Blueprint('voucher', __name__)

# Voucher submission route
@voucher_bp.route('/submit-voucher', methods=['POST'])
@login_required
def submit_voucher():
    data = request.json
    user_id = data.get('user_id')
    expiration_date = data.get('expiration_date')
    price_limit = data.get('price_limit')
    housing_type = data.get('housing_type')
    family_members = data.get('family_members')
    
    # Ensure the logged-in user is the one submitting the voucher (use current_user)
    if user_id != current_user.id:
        return jsonify({'error': 'User not authorized to submit voucher for this user ID'}), 403

    # Basic validation
    if not expiration_date or not price_limit or not housing_type or not family_members:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Insert the voucher into the database
        voucher = Voucher(
            user_id=current_user.id,  # Use the logged-in user's ID
            expiration_date=expiration_date,
            price_limit=price_limit,
            housing_type=housing_type,
            family_members=family_members
        )

        session.add(voucher)
        session.commit()

        return jsonify({'message': 'Voucher submitted successfully'}), 200
    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({'error': 'Database error', 'message': str(e)}), 500
