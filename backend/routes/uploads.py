import os

from flask import request, send_from_directory, current_app, abort
from flask_login import login_required, current_user
from flask_openapi3 import Tag, APIBlueprint
from pydantic import BaseModel, Field
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.utils import secure_filename

from config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS
from models import session, Property, PropertyImage

uploads_tag = Tag(name="uploads", description="File upload operations")
uploads_api = APIBlueprint("uploads", __name__, abp_tags=[uploads_tag])


def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


class ServeUploadFilePath(BaseModel):
    filename: str = Field(..., description="Filename of the uploaded file")


# Serve uploaded images
@uploads_api.get('/uploads/<filename>')
def serve_uploaded_file(path: ServeUploadFilePath):
    filename = path.filename

    """ Serve uploaded images """
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        abort(404)  # Return a 404 if file doesn't exist

    return send_from_directory(UPLOAD_FOLDER, filename)


# Pydantic Model for uploading property image paths
class UploadPropertyImagePath(BaseModel):
    property_id: int = Field(..., description="ID of the property")


# Pydantic Model for response on successful image upload
class ImageUploadResponse(BaseModel):
    success: bool
    message: str
    images: list[str] = []


# Pydantic Model for error response
class ErrorResponse(BaseModel):
    success: bool
    message: str
    error: str = ""


# Upload property images
@uploads_api.post('/property/{property_id}/upload-images', summary="Upload property images")
@login_required
def upload_property_images(path: UploadPropertyImagePath):
    """
    Upload property images for a given property.

    Only landlords are allowed to upload images.
    """
    if current_user.role != "landlord":
        return ErrorResponse(success=False, message="Only landlords can upload property images"), 403

    property_id = path.property_id

    try:
        property = session.query(Property).filter_by(id=property_id, user_id=current_user.id).first()
        if not property:
            return ErrorResponse(success=False, message="Property not found"), 404

        if 'images' not in request.files:
            return ErrorResponse(success=False, message="No images provided"), 400

        images = request.files.getlist('images')
        if len(images) < 1 or len(images) > 5:
            return ErrorResponse(success=False, message="You must upload between 1 and 5 images"), 400

        uploaded_images = []
        for image in images:
            if not allowed_file(image.filename):
                return ErrorResponse(success=False, message=f"Invalid file type: {image.filename}"), 400

            filename = secure_filename(f"{property_id}_{image.filename}")
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            image.save(filepath)

            property_image = PropertyImage(property_id=property.id, image_url=filename)
            session.add(property_image)
            uploaded_images.append(f"http://localhost:5000/uploads/{filename}")

        session.commit()

        return ImageUploadResponse(success=True, message="Images uploaded successfully", images=uploaded_images), 200

    except SQLAlchemyError as e:
        session.rollback()
        print("Database error:", str(e))
        return ErrorResponse(success=False, message="Database error", error=str(e)), 500
    except Exception as e:
        print("Unexpected error:", str(e))
        return ErrorResponse(success=False, message="An unexpected error occurred", error=str(e)), 500
