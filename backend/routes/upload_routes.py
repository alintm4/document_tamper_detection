"""
Image upload routes
"""
import os
import io
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from PIL import Image

from database import get_db
from utils.auth import token_optional
from utils.helpers import get_client_ip
from utils.hashing import calculate_file_hash, calculate_image_hash, check_duplicate_hash, check_exact_duplicate
from utils.upload_limits import check_upload_limit, increment_upload_count, get_user_tier

upload_bp = Blueprint('upload', __name__)


def process_upload(user_id, force=False):
    """Common upload processing logic"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    conn = get_db()
    ip_address = get_client_ip()
    
    # Determine tier and check limits
    if user_id:
        tier = get_user_tier(conn, user_id)
        can_upload, limit_info = check_upload_limit(conn, user_id=user_id, tier=tier)
    else:
        tier = 'free'
        can_upload, limit_info = check_upload_limit(conn, ip_address=ip_address, tier=tier)
    
    if not can_upload:
        conn.close()
        return jsonify({
            'error': 'Upload limit reached',
            'tier': tier,
            'limit': limit_info['limit'],
            'current': limit_info['current'],
            'upgrade_message': 'Upgrade to Pro for 500 uploads or Pro Max for unlimited uploads'
        }), 429
    
    # Read file data for hashing
    file_data = file.read()
    file.seek(0)
    
    # Calculate hashes
    file_hash = calculate_file_hash(file_data)
    try:
        image = Image.open(io.BytesIO(file_data))
        image_hash = calculate_image_hash(image)
    except Exception as e:
        conn.close()
        return jsonify({'error': f'Invalid image file: {str(e)}'}), 400
    
    # Check for duplicates
    if force:
        # Only check exact duplicates when forcing
        duplicate = check_exact_duplicate(conn, file_hash, user_id, ip_address if not user_id else None)
    else:
        duplicate = check_duplicate_hash(conn, file_hash, image_hash, user_id, ip_address if not user_id else None)
    
    if duplicate:
        conn.close()
        if duplicate['type'] == 'exact':
            return jsonify({
                'error': 'Duplicate image detected',
                'duplicate_type': 'exact',
                'existing_image_id': duplicate['image_id'],
                'message': 'This exact image has already been uploaded'
            }), 409
        else:
            return jsonify({
                'warning': 'Similar image detected',
                'duplicate_type': 'similar',
                'existing_image_id': duplicate['image_id'],
                'similarity_score': duplicate.get('similarity'),
                'message': 'A similar image already exists. Upload anyway?',
                'allow_override': True
            }), 409
    
    # Generate unique filename
    original_filename = secure_filename(file.filename)
    ext = os.path.splitext(original_filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
    
    # Save file
    with open(filepath, 'wb') as f:
        f.write(file_data)
    
    # Insert into database
    c = conn.cursor()
    c.execute('''
        INSERT INTO images (user_id, ip_address, filename, original_filename, image_hash, file_hash, file_size)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, ip_address if not user_id else None, unique_filename, original_filename, image_hash, file_hash, len(file_data)))
    image_id = c.lastrowid
    
    # Increment upload count
    increment_upload_count(conn, user_id, ip_address if not user_id else None)
    
    conn.commit()
    conn.close()
    
    remaining = limit_info.get('remaining', 'unlimited') if limit_info else 'unlimited'
    if isinstance(remaining, int):
        remaining -= 1  # Account for this upload
    
    return jsonify({
        'message': 'Image uploaded successfully' + (' (forced)' if force else ''),
        'image_id': image_id,
        'filename': unique_filename,
        'original_filename': original_filename,
        'image_hash': image_hash,
        'tier': tier,
        'remaining_uploads': remaining
    })


@upload_bp.route('/upload', methods=['POST'])
@token_optional
def upload_image(user_id):
    """Upload an image with duplicate detection"""
    return process_upload(user_id, force=False)


@upload_bp.route('/upload/force', methods=['POST'])
@token_optional
def force_upload_image(user_id):
    """Upload image even if similar one exists (bypasses similarity check)"""
    return process_upload(user_id, force=True)


@upload_bp.route('/check-hash', methods=['POST'])
@token_optional
def check_hash(user_id):
    """Pre-check if an image hash already exists"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    file_data = file.read()
    
    file_hash = calculate_file_hash(file_data)
    try:
        image = Image.open(io.BytesIO(file_data))
        image_hash = calculate_image_hash(image)
    except Exception as e:
        return jsonify({'error': f'Invalid image file: {str(e)}'}), 400
    
    conn = get_db()
    ip_address = get_client_ip()
    
    duplicate = check_duplicate_hash(conn, file_hash, image_hash, user_id, ip_address if not user_id else None)
    conn.close()
    
    if duplicate:
        return jsonify({
            'exists': True,
            'duplicate_type': duplicate['type'],
            'existing_image_id': duplicate['image_id'],
            'similarity_score': duplicate.get('similarity')
        })
    
    return jsonify({
        'exists': False,
        'image_hash': image_hash,
        'file_hash': file_hash
    })
