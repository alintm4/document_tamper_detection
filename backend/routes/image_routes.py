"""
Image retrieval and manipulation routes
"""
import os
from flask import Blueprint, request, jsonify, send_file, current_app
from werkzeug.utils import secure_filename
from PIL import Image

from database import get_db
from utils.auth import token_required, token_optional
from utils.helpers import get_client_ip
from utils.model_service import analyze_image

image_bp = Blueprint('images', __name__)


@image_bp.route('/images/<int:image_id>', methods=['GET'])
@token_optional
def get_image(user_id, image_id):
    """Get image metadata by ID"""
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM images WHERE id=?', (image_id,))
    row = c.fetchone()
    conn.close()
    
    if not row:
        return jsonify({'error': 'Image not found'}), 404
    
    # Check authorization
    ip_address = get_client_ip()
    if row['user_id'] and row['user_id'] != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    if row['ip_address'] and row['ip_address'] != ip_address and not user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify({
        'id': row['id'],
        'filename': row['filename'],
        'original_filename': row['original_filename'],
        'image_hash': row['image_hash'],
        'file_size': row['file_size'],
        'uploaded_at': row['uploaded_at'],
        'has_mask': row['mask_filename'] is not None,
        'has_result': row['result_filename'] is not None
    })


@image_bp.route('/uploads/<filename>', methods=['GET'])
def serve_upload(filename):
    """Serve uploaded image files"""
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    return send_file(filepath)


@image_bp.route('/upload_mask', methods=['POST'])
@token_required
def upload_mask(user_id):
    """Upload mask and generate result image"""
    if 'mask' not in request.files or 'image_id' not in request.form:
        return jsonify({'error': 'Missing mask or image_id'}), 400
    
    mask_file = request.files['mask']
    image_id = request.form.get('image_id')
    
    # Get original image and verify ownership
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT filename, user_id FROM images WHERE id=?', (image_id,))
    row = c.fetchone()
    
    if not row or row['user_id'] != user_id:
        conn.close()
        return jsonify({'error': 'Image not found or unauthorized'}), 404
    
    # Save mask
    mask_filename = secure_filename(mask_file.filename)
    mask_path = os.path.join(current_app.config['UPLOAD_FOLDER'], mask_filename)
    mask_file.save(mask_path)
    
    orig_filename = row['filename']
    orig_path = os.path.join(current_app.config['UPLOAD_FOLDER'], orig_filename)
    
    # Combine mask and image (highlight mask area in red)
    try:
        orig_img = Image.open(orig_path).convert('RGBA')
        mask_img = Image.open(mask_path).convert('L')
        
        # Resize mask if needed
        if mask_img.size != orig_img.size:
            mask_img = mask_img.resize(orig_img.size)
        
        highlight = Image.new('RGBA', orig_img.size, (255, 0, 0, 0))
        
        for y in range(orig_img.height):
            for x in range(orig_img.width):
                if mask_img.getpixel((x, y)) > 128:
                    highlight.putpixel((x, y), (255, 0, 0, 128))
        
        result_img = Image.alpha_composite(orig_img, highlight)
        result_filename = f'result_{orig_filename}'
        result_path = os.path.join(current_app.config['UPLOAD_FOLDER'], result_filename)
        result_img.save(result_path)
        
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500
    
    # Update database
    c.execute(
        'UPDATE images SET mask_filename=?, result_filename=? WHERE id=?',
        (mask_filename, result_filename, image_id)
    )
    conn.commit()
    conn.close()
    
    return jsonify({
        'message': 'Mask uploaded and result generated',
        'mask_filename': mask_filename,
        'result_filename': result_filename
    })


@image_bp.route('/images/<int:image_id>', methods=['DELETE'])
@token_required
def delete_image(user_id, image_id):
    """Delete an image"""
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT filename, mask_filename, result_filename, user_id FROM images WHERE id=?', (image_id,))
    row = c.fetchone()
    
    if not row:
        conn.close()
        return jsonify({'error': 'Image not found'}), 404
    
    if row['user_id'] != user_id:
        conn.close()
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Delete files
    upload_folder = current_app.config['UPLOAD_FOLDER']
    for filename in [row['filename'], row['mask_filename'], row['result_filename']]:
        if filename:
            filepath = os.path.join(upload_folder, filename)
            if os.path.exists(filepath):
                os.remove(filepath)
    
    # Delete from database
    c.execute('DELETE FROM images WHERE id=?', (image_id,))
    
    # Decrement upload count
    c.execute('UPDATE users SET upload_count = upload_count - 1 WHERE id=? AND upload_count > 0', (user_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Image deleted successfully'})


@image_bp.route('/analyze', methods=['POST'])
@token_optional
def analyze_uploaded_image(user_id):
    """Analyze an image for forgery detection without saving it"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        # Read file data
        file_data = file.read()
        
        # Analyze using the ML model
        analysis = analyze_image(file_data)
        
        if 'error' in analysis:
            return jsonify({
                'error': 'Analysis failed',
                'details': analysis['error']
            }), 500
        
        return jsonify({
            'success': True,
            'filename': file.filename,
            'is_manipulated': analysis['is_manipulated'],
            'confidence_score': analysis['confidence_score'],
            'prediction': analysis['prediction'],
            'analysis_result': analysis['analysis_result'],
            'raw_scores': analysis.get('raw_scores')
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Analysis failed',
            'details': str(e)
        }), 500


@image_bp.route('/analyze/<int:image_id>', methods=['POST'])
@token_optional
def reanalyze_image(user_id, image_id):
    """Re-analyze an existing image"""
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT filename, user_id FROM images WHERE id=?', (image_id,))
    row = c.fetchone()
    
    if not row:
        conn.close()
        return jsonify({'error': 'Image not found'}), 404
    
    # Check authorization
    ip_address = get_client_ip()
    if row['user_id'] and row['user_id'] != user_id:
        conn.close()
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Load and analyze the image
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], row['filename'])
    if not os.path.exists(filepath):
        conn.close()
        return jsonify({'error': 'Image file not found'}), 404
    
    try:
        analysis = analyze_image(filepath)
        
        if 'error' in analysis:
            conn.close()
            return jsonify({
                'error': 'Analysis failed',
                'details': analysis['error']
            }), 500
        
        # Update database with new analysis
        c.execute('''
            UPDATE images 
            SET analysis_result = ?, is_manipulated = ?, confidence_score = ?
            WHERE id = ?
        ''', (analysis['analysis_result'], analysis['is_manipulated'], analysis['confidence_score'], image_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'image_id': image_id,
            'is_manipulated': analysis['is_manipulated'],
            'confidence_score': analysis['confidence_score'],
            'prediction': analysis['prediction'],
            'analysis_result': analysis['analysis_result'],
            'raw_scores': analysis.get('raw_scores')
        })
        
    except Exception as e:
        conn.close()
        return jsonify({
            'error': 'Analysis failed',
            'details': str(e)
        }), 500
