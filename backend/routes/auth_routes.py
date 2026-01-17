"""
Authentication routes (register, login)
"""
import jwt
import datetime
import sqlite3
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from config import SECRET_KEY, TIER_LIMITS, JWT_EXPIRATION_HOURS
from database import get_db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    username = data.get('username')
    email = data.get('email')
    name = data.get('name')
    password = data.get('password')
    tier = data.get('tier', 'free')
    
    # Validate tier
    if tier not in TIER_LIMITS:
        tier = 'free'
    
    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    password_hash = generate_password_hash(password)
    conn = get_db()
    
    try:
        conn.execute(
            'INSERT INTO users (username, email, name, password_hash, tier) VALUES (?, ?, ?, ?, ?)',
            (username, email, name, password_hash, tier)
        )
        conn.commit()
    except sqlite3.IntegrityError as e:
        error_msg = str(e)
        if 'email' in error_msg:
            return jsonify({'error': 'Email already exists'}), 409
        return jsonify({'error': 'Username already exists'}), 409
    finally:
        conn.close()
    
    return jsonify({
        'message': 'User registered successfully',
        'username': username,
        'tier': tier,
        'upload_limit': TIER_LIMITS.get(tier)
    })


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login and get JWT token - accepts username or email"""
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not password or (not username and not email):
        return jsonify({'error': 'Missing credentials'}), 400
    
    conn = get_db()
    c = conn.cursor()
    
    # Try to find user by username or email
    if username:
        c.execute('SELECT * FROM users WHERE username=?', (username,))
    else:
        c.execute('SELECT * FROM users WHERE email=?', (email,))
    
    user = c.fetchone()
    conn.close()
    
    if user and check_password_hash(user['password_hash'], password):
        token = jwt.encode({
            'user_id': user['id'],
            'tier': user['tier'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
        }, SECRET_KEY, algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user_id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'name': user['name'],
            'tier': user['tier'],
            'upload_count': user['upload_count'],
            'upload_limit': TIER_LIMITS.get(user['tier'])
        })
    else:
        return jsonify({'error': 'Invalid credentials'}), 401
