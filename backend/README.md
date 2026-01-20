# Backend - Flask REST API

Flask-based REST API server for document tampering detection. Handles user authentication, document uploads, ML model inference, and provides RESTful endpoints for the frontend and browser extension.

## Overview

The backend serves as the core processing engine of the Proofly system, integrating deep learning models with a robust API to detect document forgeries and tampering.

## Features

- User authentication with JWT tokens
- Tiered access control (Free, Pro, Premium)
- Secure document upload and storage
- ML model inference using TensorFlow
- Image preprocessing and analysis
- Usage tracking and limits
- RESTful API endpoints
- CORS support for frontend integration

## Technology Stack

- Flask (Web framework)
- TensorFlow/Keras (Deep learning)
- SQLite (Database)
- JWT (Authentication)
- Werkzeug (Password hashing)
- Pillow (Image processing)
- NumPy (Array operations)

## Project Structure

```
backend/
├── app.py                 # Flask application factory
├── main.py                # Application entry point
├── config.py              # Configuration settings
├── database.py            # Database connection utilities
├── schema.sql             # Database schema definition
├── setup_db.py            # Database initialization script
├── requirements.txt       # Python dependencies
├── routes/                # API route handlers
│   ├── __init__.py
│   ├── auth_routes.py    # Authentication endpoints
│   ├── user_routes.py    # User management endpoints
│   ├── upload_routes.py  # File upload endpoints
│   └── image_routes.py   # Image analysis endpoints
├── utils/                 # Helper modules
│   ├── __init__.py
│   ├── auth.py           # JWT authentication utilities
│   ├── hashing.py        # Password hashing functions
│   ├── helpers.py        # General helper functions
│   ├── model_service.py  # ML model loading and inference
│   └── upload_limits.py  # Upload limit checking
└── uploads/               # Uploaded files storage
```

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Virtual environment (recommended)

### Setup Steps

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
```bash
# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Initialize database:
```bash
python setup_db.py
```

6. Place trained model file:
```bash
# Ensure resnet50_unet_tampering_detector.keras exists in backend/
```

## Configuration

Edit `config.py` to customize settings:

```python
# Server settings
HOST = '0.0.0.0'
PORT = 5000

# Upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

# JWT settings
SECRET_KEY = 'your-secret-key-here'
JWT_EXPIRATION_HOURS = 24

# Tier limits (uploads per month)
TIER_LIMITS = {
    'free': 10,
    'pro': 100,
    'premium': 1000
}
```

## Running the Server

### Development Mode

```bash
python main.py
```

Server will start at `http://localhost:5000`

### Production Mode

Use a production WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "name": "string",
  "password": "string",
  "tier": "free|pro|premium"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user_id": 1
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: 200 OK
{
  "token": "jwt-token-string",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "tier": "free"
  }
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

### Document Upload & Analysis

#### Upload Document
```
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: <image file>

Response: 200 OK
{
  "message": "Image analyzed successfully",
  "image_id": 1,
  "result": {
    "is_tampered": true,
    "confidence": 0.85,
    "tampered_regions": [...],
    "analysis_timestamp": "2026-01-18T10:30:00Z"
  }
}
```

#### Get Analysis History
```
GET /api/images
Authorization: Bearer <token>

Response: 200 OK
{
  "images": [
    {
      "id": 1,
      "filename": "document.jpg",
      "is_tampered": true,
      "confidence_score": 0.85,
      "uploaded_at": "2026-01-18T10:30:00Z"
    }
  ]
}
```

#### Get Specific Analysis
```
GET /api/images/<id>
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "filename": "document.jpg",
  "analysis_result": {...},
  "is_tampered": true,
  "confidence_score": 0.85,
  "uploaded_at": "2026-01-18T10:30:00Z"
}
```

### User Management

#### Get User Profile
```
GET /api/user/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "username": "string",
  "email": "string",
  "name": "string",
  "tier": "free",
  "created_at": "2026-01-01T00:00:00Z"
}
```

#### Update Profile
```
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "name": "New Name"
}

Response: 200 OK
{
  "message": "Profile updated successfully"
}
```

#### Get Usage Statistics
```
GET /api/user/usage
Authorization: Bearer <token>

Response: 200 OK
{
  "tier": "free",
  "limit": 10,
  "used": 5,
  "remaining": 5,
  "reset_date": "2026-02-01T00:00:00Z"
}
```

## Database Schema

### users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    name TEXT,
    password_hash TEXT NOT NULL,
    tier TEXT DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### images Table
```sql
CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    analysis_result TEXT,
    confidence_score REAL,
    is_tampered BOOLEAN,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Model Integration

The backend uses a pre-trained ResNet50 U-Net model for tampering detection:

### Model Loading
```python
from utils.model_service import load_model, predict

# Load model on startup
model = load_model('resnet50_unet_tampering_detector.keras')

# Run inference
result = predict(model, image_array)
```

### Preprocessing Pipeline
1. Load image using Pillow
2. Resize to 256x256 pixels
3. Normalize pixel values (0-1 range)
4. Convert to numpy array
5. Add batch dimension
6. Run model inference
7. Post-process segmentation mask

## Security Features

- Password hashing with Werkzeug
- JWT token-based authentication
- CORS configuration for frontend
- File type validation
- File size limits
- SQL injection prevention
- XSS protection

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 413: Payload Too Large
- 500: Internal Server Error

## Testing

Run tests using pytest:

```bash
# Install pytest
pip install pytest

# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=routes tests/
```

## Performance Considerations

- Model inference time: 2-3 seconds per image
- Concurrent request handling with Flask threading
- Database connection pooling
- Image optimization before processing
- Caching strategies for frequent requests

## Deployment

### Environment Variables

Set these in production:

```bash
export FLASK_ENV=production
export SECRET_KEY=your-secure-secret-key
export DATABASE_URL=path/to/database.db
```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## Troubleshooting

### Model Not Loading
- Verify model file exists in backend directory
- Check TensorFlow version compatibility
- Ensure sufficient RAM for model loading

### Database Errors
- Run setup_db.py to recreate tables
- Check file permissions on database file
- Verify SQLite3 installation

### CORS Issues
- Update CORS origins in app.py
- Check frontend URL configuration
- Verify headers in requests

### Upload Failures
- Check UPLOAD_FOLDER exists and is writable
- Verify file size limits
- Ensure allowed file extensions

## Maintenance

### Database Backup
```bash
sqlite3 database.db .dump > backup.sql
```

### Clear Old Uploads
```bash
find uploads/ -type f -mtime +30 -delete
```

### Monitor Logs
```bash
tail -f app.log
```

## Dependencies

Core dependencies (from requirements.txt):
- Flask==2.3.0
- tensorflow==2.14.0
- Pillow==10.0.0
- PyJWT==2.8.0
- flask-cors==4.0.0
- numpy==1.24.0
- werkzeug==2.3.0

## Contributing

When adding new endpoints:
1. Create route handler in appropriate blueprint
2. Add authentication decorator if needed
3. Implement input validation
4. Add error handling
5. Update API documentation
6. Write tests

## License

Educational and research purposes.
