"""
Main Flask Application Entry Point
"""
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

from config import UPLOAD_FOLDER, SECRET_KEY, TIER_LIMITS, MAX_CONTENT_LENGTH
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.upload_routes import upload_bp
from routes.image_routes import image_bp


def create_app():
    """Application factory"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
    
    # Ensure upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    # Enable CORS for frontend - allow localhost:3000 specifically
    CORS(app, 
         resources={
             r"/*": {
                 "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8081"],
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                 "allow_headers": ["Content-Type", "Authorization"],
                 "supports_credentials": True,
                 "expose_headers": ["Content-Type", "Authorization"]
             }
         })
    
    # Handle preflight requests
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = app.make_default_options_response()
            origin = request.headers.get('Origin')
            if origin in ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8081']:
                response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Max-Age'] = '3600'
            return response
    
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin in ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8081']:
            response.headers['Access-Control-Allow-Origin'] = origin
        else:
            response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response
    
    # Register blueprints
    app.register_blueprint(auth_bp)      
    app.register_blueprint(user_bp)      
    app.register_blueprint(upload_bp)    
    app.register_blueprint(image_bp)    
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'tiers': list(TIER_LIMITS.keys()),
            'tier_limits': TIER_LIMITS
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal server error'}), 500
    
    @app.errorhandler(413)
    def file_too_large(e):
        return jsonify({'error': 'File too large. Maximum size is 16MB'}), 413
    
    return app



app = create_app()


if __name__ == '__main__':
    app.run(debug=True, port=8081)
