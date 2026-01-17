"""
Upload limit tracking and enforcement
"""
from config import TIER_LIMITS


def get_upload_count(conn, user_id=None, ip_address=None) -> int:
    """Get current upload count for user or IP"""
    c = conn.cursor()
    
    if user_id:
        c.execute('SELECT upload_count FROM users WHERE id=?', (user_id,))
        row = c.fetchone()
        return row['upload_count'] if row else 0
    else:
        c.execute('SELECT upload_count FROM ip_uploads WHERE ip_address=?', (ip_address,))
        row = c.fetchone()
        return row['upload_count'] if row else 0


def increment_upload_count(conn, user_id=None, ip_address=None) -> None:
    """Increment upload count for user or IP"""
    c = conn.cursor()
    
    if user_id:
        c.execute('UPDATE users SET upload_count = upload_count + 1 WHERE id=?', (user_id,))
    else:
        c.execute('''
            INSERT INTO ip_uploads (ip_address, upload_count) VALUES (?, 1)
            ON CONFLICT(ip_address) DO UPDATE SET 
                upload_count = upload_count + 1, 
                last_upload = CURRENT_TIMESTAMP
        ''', (ip_address,))
    
    conn.commit()


def check_upload_limit(conn, user_id=None, ip_address=None, tier='free') -> tuple[bool, dict | None]:
    """
    Check if user/IP has reached upload limit
    
    Returns:
        tuple: (can_upload: bool, limit_info: dict or None)
    """
    limit = TIER_LIMITS.get(tier)
    
    if limit is None:  # Unlimited (pro_max)
        return True, {'tier': tier, 'limit': None, 'remaining': 'unlimited'}
    
    current_count = get_upload_count(conn, user_id, ip_address)
    
    if current_count >= limit:
        return False, {
            'current': current_count,
            'limit': limit,
            'tier': tier
        }
    
    return True, {
        'current': current_count,
        'limit': limit,
        'remaining': limit - current_count,
        'tier': tier
    }


def get_user_tier(conn, user_id: int) -> str:
    """Get user's tier from database"""
    c = conn.cursor()
    c.execute('SELECT tier FROM users WHERE id=?', (user_id,))
    user = c.fetchone()
    return user['tier'] if user else 'free'
