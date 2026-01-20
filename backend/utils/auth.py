"""
Authentication utilities and decorators
"""
import jwt
from functools import wraps
from flask import request, jsonify
from config import SECRET_KEY


def token_required(f):
    """Decorator that requires a valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            token = auth_header.split(' ')[-1] if auth_header else None
        
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid!'}), 401
        
        return f(user_id, *args, **kwargs)
    return decorated


def token_optional(f):
    """Decorator that allows optional JWT token (for anonymous uploads)"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        user_id = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            token = auth_header.split(' ')[-1] if auth_header else None
        
        if token:
            try:
                data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                user_id = data['user_id']
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
                pass  # Invalid token, treat as anonymous
        
        return f(user_id, *args, **kwargs)
    return decorated
