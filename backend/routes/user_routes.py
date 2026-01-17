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


@user_bp.route('/scans', methods=['GET'])
@token_required
def get_user_scans(user_id):
    """Get user's scan history with source info"""
    conn = get_db()
    c = conn.cursor()
    
    # Get pagination params
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    offset = (page - 1) * per_page
    
    # Get total count
    c.execute('SELECT COUNT(*) FROM scans WHERE user_id = ?', (user_id,))
    total = c.fetchone()[0]
    
    # Get scans with image info
    c.execute('''
        SELECT 
            s.id as scan_id,
            s.source_site,
            s.source_url,
            s.image_url,
            s.scanned_at,
            i.id as image_id,
            i.image_hash,
            i.filename,
            i.is_manipulated,
            i.confidence_score,
            i.analysis_result,
            i.scan_count as total_scans
        FROM scans s
        JOIN images i ON s.image_id = i.id
        WHERE s.user_id = ?
        ORDER BY s.scanned_at DESC
        LIMIT ? OFFSET ?
    ''', (user_id, per_page, offset))
    
    scans = []
    for row in c.fetchall():
        scans.append({
            'scan_id': row['scan_id'],
            'source_site': row['source_site'],
            'source_url': row['source_url'],
            'image_url': row['image_url'],
            'scanned_at': row['scanned_at'],
            'image': {
                'id': row['image_id'],
                'hash': row['image_hash'],
                'filename': row['filename'],
                'is_manipulated': row['is_manipulated'],
                'confidence_score': row['confidence_score'],
                'analysis_result': row['analysis_result'],
                'total_scans': row['total_scans']
            }
        })
    
    conn.close()
    
    return jsonify({
        'scans': scans,
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page
    })


@user_bp.route('/scan-stats', methods=['GET'])
@token_required
def get_scan_stats(user_id):
    """Get aggregated scan statistics for dashboard"""
    conn = get_db()
    c = conn.cursor()
    
    # Total scans
    c.execute('SELECT COUNT(*) FROM scans WHERE user_id = ?', (user_id,))
    total_scans = c.fetchone()[0]
    
    # Unique images scanned
    c.execute('SELECT COUNT(DISTINCT image_id) FROM scans WHERE user_id = ?', (user_id,))
    unique_images = c.fetchone()[0]
    
    # Sites scanned from
    c.execute('''
        SELECT source_site, COUNT(*) as count 
        FROM scans 
        WHERE user_id = ? AND source_site != ''
        GROUP BY source_site 
        ORDER BY count DESC 
        LIMIT 10
    ''', (user_id,))
    top_sites = [{'site': row[0], 'count': row[1]} for row in c.fetchall()]
    
    # Recent activity (last 7 days)
    c.execute('''
        SELECT DATE(scanned_at) as date, COUNT(*) as count
        FROM scans
        WHERE user_id = ? AND scanned_at >= date('now', '-7 days')
        GROUP BY DATE(scanned_at)
        ORDER BY date DESC
    ''', (user_id,))
    daily_activity = [{'date': row[0], 'count': row[1]} for row in c.fetchall()]
    
    # Manipulated images found
    c.execute('''
        SELECT COUNT(DISTINCT i.id)
        FROM scans s
        JOIN images i ON s.image_id = i.id
        WHERE s.user_id = ? AND i.is_manipulated = 1
    ''', (user_id,))
    manipulated_found = c.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'total_scans': total_scans,
        'unique_images': unique_images,
        'manipulated_found': manipulated_found,
        'top_sites': top_sites,
        'daily_activity': daily_activity
    })

