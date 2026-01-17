"""
Application configuration settings
"""
import os

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Database
DB_PATH = os.path.join(BASE_DIR, 'dq.sqlite')

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'your_secret_key_here')  # Use env var in production

# Upload settings
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  

# Tier upload limits
TIER_LIMITS = {
    'free': 10,      # Free tier (tracked by IP)
    'pro': 500,      # Pro tier
    'pro_max': None  # Unlimited
}


HASH_SIMILARITY_THRESHOLD = 10

# JWT settings
JWT_EXPIRATION_HOURS = 24
