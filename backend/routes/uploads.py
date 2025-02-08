from flask import Blueprint, request, jsonify, send_from_directory, current_app, abort
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import os
from sqlalchemy.exc import SQLAlchemyError
from models import session, Property, PropertyImage
from config import UPLOAD_FOLDER
from models import session, Property, PropertyImage



uploads_bp = Blueprint("uploads", __name__)

# Serve uploaded images
@uploads_bp.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    """ Serve uploaded images """
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        abort(404)  # Return a 404 if file doesn't exist

    return send_from_directory(UPLOAD_FOLDER, filename)

# Upload property images
@uploads_bp.route('/property/<int:property_id>/upload-images', methods=['POST'])
@login_required
def upload_property_images(property_id):
    if current_user.role != "landlord":
        return jsonify({"success": False, "message": "Only landlords can upload property images"}), 403

    try:
        property = session.query(Property).filter_by(id=property_id, user_id=current_user.id).first()
        if not property:
            return jsonify({"success": False, "message": "Property not found"}), 404

        if 'images' not in request.files:
            return jsonify({"success": False, "message": "No images provided"}), 400

        images = request.files.getlist('images')
        if len(images) < 1 or len(images) > 5:
            return jsonify({"success": False, "message": "You must upload between 1 and 5 images"}), 400

        uploaded_images = []
        for image in images:
            if not allowed_file(image.filename):
                return jsonify({"success": False, "message": f"Invalid file type: {image.filename}"}), 400

            filename = secure_filename(f"{property_id}_{image.filename}")
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            image.save(filepath)

            property_image = PropertyImage(property_id=property.id, image_url=filename)
            session.add(property_image)
            uploaded_images.append(f"http://localhost:5000/uploads/{filename}")

        session.commit()
        return jsonify({"success": True, "message": "Images uploaded successfully", "images": uploaded_images}), 200
    except SQLAlchemyError as e:
        session.rollback()
        print("Database error:", str(e))
        return jsonify({"success": False, "message": "Database error", "error": str(e)}), 500
    except Exception as e:
        print("Unexpected error:", str(e))
        return jsonify({"success": False, "message": "An unexpected error occurred", "error": str(e)}), 500
