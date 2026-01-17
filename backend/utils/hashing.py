"""
Image hashing utilities for duplicate detection
"""
import hashlib
import imagehash
from config import HASH_SIMILARITY_THRESHOLD


def calculate_file_hash(file_data: bytes) -> str:
    """Calculate MD5 hash of file data for exact duplicate detection"""
    return hashlib.md5(file_data).hexdigest()


def calculate_image_hash(image) -> str:
    """Calculate perceptual hash for similar image detection"""
    return str(imagehash.phash(image))


def check_duplicate_hash(conn, file_hash: str, image_hash: str, user_id=None, ip_address=None) -> dict | None:
    """
    Check if image already exists (exact or similar)
    
    Returns:
        dict with duplicate info if found, None otherwise
    """
    c = conn.cursor()
    
    # Check for exact duplicate (same file hash)
    if user_id:
        c.execute('SELECT id, filename FROM images WHERE file_hash=? AND user_id=?', (file_hash, user_id))
    else:
        c.execute('SELECT id, filename FROM images WHERE file_hash=? AND ip_address=?', (file_hash, ip_address))
    
    exact_match = c.fetchone()
    if exact_match:
        return {
            'type': 'exact',
            'image_id': exact_match['id'],
            'filename': exact_match['filename']
        }
    
    # Check for similar image (perceptual hash)
    if user_id:
        c.execute('SELECT id, filename, image_hash FROM images WHERE user_id=?', (user_id,))
    else:
        c.execute('SELECT id, filename, image_hash FROM images WHERE ip_address=?', (ip_address,))
    
    for row in c.fetchall():
        try:
            existing_hash = imagehash.hex_to_hash(row['image_hash'])
            new_hash = imagehash.hex_to_hash(image_hash)
            distance = existing_hash - new_hash
            
            # Hamming distance threshold (lower = more similar, 0 = identical)
            if distance < HASH_SIMILARITY_THRESHOLD:
                return {
                    'type': 'similar',
                    'image_id': row['id'],
                    'filename': row['filename'],
                    'similarity': HASH_SIMILARITY_THRESHOLD - distance
                }
        except Exception:
            continue
    
    return None


def check_exact_duplicate(conn, file_hash: str, user_id=None, ip_address=None) -> dict | None:
    """Check only for exact duplicates (same file hash)"""
    c = conn.cursor()
    
    if user_id:
        c.execute('SELECT id, filename FROM images WHERE file_hash=? AND user_id=?', (file_hash, user_id))
    else:
        c.execute('SELECT id, filename FROM images WHERE file_hash=? AND ip_address=?', (file_hash, ip_address))
    
    exact_match = c.fetchone()
    if exact_match:
        return {
            'type': 'exact',
            'image_id': exact_match['id'],
            'filename': exact_match['filename']
        }
    
    return None
