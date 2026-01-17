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
from utils.hashing import calculate_file_hash, calculate_image_hash
from utils.upload_limits import check_upload_limit, increment_upload_count, get_user_tier
from utils.model_service import analyze_image

upload_bp = Blueprint('upload', __name__)


def find_existing_image(conn, image_hash):
    """Check if an image with this hash already exists"""
    c = conn.cursor()
    c.execute('SELECT id, analysis_result, is_manipulated, confidence_score, scan_count FROM images WHERE image_hash = ?', (image_hash,))
    row = c.fetchone()
    if row:
        return {
            'id': row[0],
            'analysis_result': row[1],
            'is_manipulated': row[2],
            'confidence_score': row[3],
            'scan_count': row[4]
        }
    return None


def record_scan(conn, image_id, user_id, ip_address, source_site, source_url, image_url):
    """Record a new scan event for an image"""
    c = conn.cursor()
    c.execute('''
        INSERT INTO scans (image_id, user_id, ip_address, source_site, source_url, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (image_id, user_id, ip_address if not user_id else None, source_site, source_url, image_url))
    
    # Increment scan count on the image
    c.execute('UPDATE images SET scan_count = scan_count + 1 WHERE id = ?', (image_id,))
    
    return c.lastrowid


def process_upload(user_id, force=False):
    """Common upload processing logic"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Get source info from request
    source_site = request.form.get('source_site', '')
    source_url = request.form.get('source_url', '')
    image_url = request.form.get('image_url', '')
    
    conn = get_db()
    ip_address = get_client_ip()
    
    # Determine tier and check limits
    if user_id:
        tier = get_user_tier(conn, user_id)
        can_upload, limit_info = check_upload_limit(conn, user_id=user_id, tier=tier)
    else:
        tier = 'anonymous'
        can_upload, limit_info = check_upload_limit(conn, ip_address=ip_address)
    
    if not can_upload:
        conn.close()
        if not user_id:
            return jsonify({
                'error': 'Free upload limit reached',
                'tier': 'anonymous',
                'limit': limit_info['limit'],
                'current': limit_info['current'],
                'signup_bonus': limit_info.get('signup_bonus', 5),
                'upgrade_message': f"Sign up FREE to get {limit_info.get('signup_bonus', 5)} more uploads!"
            }), 429
        else:
            return jsonify({
                'error': 'Upload limit reached',
                'tier': limit_info['tier'],
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
    
    # Check if this image already exists (by perceptual hash)
    existing = find_existing_image(conn, image_hash)
    
    if existing:
        # Image already analyzed - just record this scan, don't count toward limit
        scan_id = record_scan(conn, existing['id'], user_id, ip_address, source_site, source_url, image_url)
        conn.commit()
        conn.close()
        
        remaining = limit_info.get('remaining', 'unlimited') if limit_info else 'unlimited'
        
        return jsonify({
            'message': 'Image already analyzed',
            'image_id': existing['id'],
            'image_hash': image_hash,
            'is_cached': True,
            'scan_id': scan_id,
            'scan_count': existing['scan_count'] + 1,
            'analysis_result': existing['analysis_result'],
            'is_manipulated': existing['is_manipulated'],
            'confidence_score': existing['confidence_score'],
            'tier': tier,
            'remaining_uploads': remaining,
            'source_recorded': bool(source_site or source_url)
        })
    
    # New image - needs analysis, counts toward limit
    original_filename = secure_filename(file.filename)
    ext = os.path.splitext(original_filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
    
    # Save file
    with open(filepath, 'wb') as f:
        f.write(file_data)
    
    # Insert new image
    c = conn.cursor()
    c.execute('''
        INSERT INTO images (image_hash, file_hash, file_size, filename, original_filename, scan_count)
        VALUES (?, ?, ?, ?, ?, 1)
    ''', (image_hash, file_hash, len(file_data), unique_filename, original_filename))
    image_id = c.lastrowid
    
    # Analyze image using the ML model
    analysis = analyze_image(file_data)
    
    # Update image with analysis results
    c.execute('''
        UPDATE images 
        SET analysis_result = ?, is_manipulated = ?, confidence_score = ?
        WHERE id = ?
    ''', (analysis['analysis_result'], analysis['is_manipulated'], analysis['confidence_score'], image_id))
    
    # Record this scan
    scan_id = record_scan(conn, image_id, user_id, ip_address, source_site, source_url, image_url)
    
    # Increment upload count (only for new images)
    increment_upload_count(conn, user_id, ip_address if not user_id else None)
    
    conn.commit()
    conn.close()
    
    remaining = limit_info.get('remaining', 'unlimited') if limit_info else 'unlimited'
    if isinstance(remaining, int):
        remaining -= 1  # Account for this upload
    
    return jsonify({
        'message': 'Image uploaded successfully',
        'image_id': image_id,
        'scan_id': scan_id,
        'filename': unique_filename,
        'original_filename': original_filename,
        'image_hash': image_hash,
        'is_cached': False,
        'tier': tier,
        'remaining_uploads': remaining,
        'source_recorded': bool(source_site or source_url),
        'analysis_result': analysis['analysis_result'],
        'is_manipulated': analysis['is_manipulated'],
        'confidence_score': analysis['confidence_score'],
        'prediction': analysis['prediction']
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


@upload_bp.route('/anonymous/stats', methods=['GET'])
def get_anonymous_stats():
    """Get upload stats for anonymous user by IP"""
    from config import ANONYMOUS_LIMIT
    from utils.upload_limits import get_upload_count
    
    conn = get_db()
    ip_address = get_client_ip()
    
    upload_count = get_upload_count(conn, ip_address=ip_address)
    remaining = max(0, ANONYMOUS_LIMIT - upload_count)
    
    conn.close()
    
    return jsonify({
        'upload_count': upload_count,
        'upload_limit': ANONYMOUS_LIMIT,
        'remaining': remaining,
        'tier': 'anonymous'
    })
