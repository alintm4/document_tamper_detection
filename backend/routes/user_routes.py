"""
User management routes (stats, upgrade)
"""
from flask import Blueprint, request, jsonify

from config import TIER_LIMITS
from database import get_db
from utils.auth import token_required

user_bp = Blueprint('user', __name__, url_prefix='/user')


@user_bp.route('/stats', methods=['GET'])
@token_required
def get_user_stats(user_id):
    """Get user's tier and upload statistics"""
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT username, tier, upload_count, created_at FROM users WHERE id=?', (user_id,))
    user = c.fetchone()
    conn.close()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    tier = user['tier']
    limit = TIER_LIMITS.get(tier)
    
    return jsonify({
        'username': user['username'],
        'tier': tier,
        'upload_count': user['upload_count'],
        'upload_limit': limit,
        'remaining': None if limit is None else max(0, limit - user['upload_count']),
        'member_since': user['created_at']
    })


@user_bp.route('/upgrade', methods=['POST'])
@token_required
def upgrade_tier(user_id):
    """Upgrade user's subscription tier"""
    data = request.json
    new_tier = data.get('tier')
    
    if new_tier not in ['pro', 'pro_max']:
        return jsonify({'error': 'Invalid tier. Choose pro or pro_max'}), 400
    
    conn = get_db()
    c = conn.cursor()
    
    # Check current tier
    c.execute('SELECT tier FROM users WHERE id=?', (user_id,))
    user = c.fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
    if user['tier'] == new_tier:
        conn.close()
        return jsonify({'error': f'Already on {new_tier} tier'}), 400
    
    # Upgrade tier
    c.execute('UPDATE users SET tier=? WHERE id=?', (new_tier, user_id))
    conn.commit()
    conn.close()
    
    return jsonify({
        'message': f'Successfully upgraded to {new_tier}',
        'tier': new_tier,
        'upload_limit': TIER_LIMITS.get(new_tier)
    })


@user_bp.route('/images', methods=['GET'])
@token_required
def get_user_images(user_id):
    """Get all images uploaded by the user"""
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        SELECT id, filename, original_filename, image_hash, file_size, uploaded_at 
        FROM images 
        WHERE user_id=? 
        ORDER BY uploaded_at DESC
    ''', (user_id,))
    
    images = []
    for row in c.fetchall():
        images.append({
            'id': row['id'],
            'filename': row['filename'],
            'original_filename': row['original_filename'],
            'image_hash': row['image_hash'],
            'file_size': row['file_size'],
            'uploaded_at': row['uploaded_at']
        })
    
    conn.close()
    return jsonify({'images': images, 'count': len(images)})
