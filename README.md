# Proofly - AI-Powered Document Tampering Detection System

> 🏆 **Hackathon Project**: Advanced Document Authentication Platform using Deep Learning

[![Made with Python](https://img.shields.io/badge/Made%20with-Python-blue.svg)](https://www.python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.14-orange.svg)](https://www.tensorflow.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-Educational-green.svg)](LICENSE)

## 🎯 Executive Summary

**Proofly** is an end-to-end document authentication platform that leverages state-of-the-art deep learning to detect tampering and forgeries in digital documents. In an era where document fraud costs billions annually, Proofly provides an accessible, accurate, and automated solution for verifying document authenticity.

### The Problem
- Document fraud affects businesses, governments, and individuals worldwide
- Manual verification is time-consuming, expensive, and error-prone
- Sophisticated digital editing tools make forgeries increasingly difficult to detect
- No accessible tools for real-time document verification while browsing

### Our Solution
Proofly combines cutting-edge AI with practical usability through:
- **Web Application**: Detailed document analysis with visual tampering highlights
- **Browser Extension**: One-click verification for any image on the web
- **REST API**: Easy integration with existing business systems
- **Deep Learning Model**: ResNet50-based U-Net achieving 68%+ accuracy

### Key Achievements  
✅ Model with 68%+ accuracy.

✅ **2-3 second** analysis time per document  
✅ **Pixel-level precision** in identifying tampered regions  
✅ **Multi-platform deployment** (web, extension, API)  
✅ **Production-ready** architecture with JWT authentication  
✅ **Scalable design** supporting tiered access control  

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [System Architecture](#-system-architecture)
3. [Technology Stack](#-technology-stack)
4. [Features & Capabilities](#-features--capabilities)
5. [Installation Guide](#-installation-guide)
6. [Usage Instructions](#-usage-instructions)
7. [Machine Learning Model](#-machine-learning-model)
8. [API Documentation](#-api-documentation)
9. [Component Details](#-component-details)
10. [Performance Metrics](#-performance-metrics)
11. [Demo & Presentation](#-demo--presentation)
12. [Future Roadmap](#-future-roadmap)
13. [Team & Acknowledgments](#-team--acknowledgments)

---

## 🌟 Project Overview

Proofly is a comprehensive document authentication platform that uses advanced deep learning techniques to detect tampering and forgeries in digital documents. The system combines a ResNet50-based U-Net segmentation model with a user-friendly web interface and browser extension.

### Three Integrated Solutions

#### 1. 🌐 Web Application
- Professional dashboard for document analysis
- Drag-and-drop upload interface
- Real-time processing with visual feedback
- Analysis history and usage tracking
- Downloadable reports with confidence scores

#### 2. 🔌 Browser Extension
- Right-click any image to verify authenticity
- Instant analysis without leaving your browser
- Perfect for journalists, researchers, and fact-checkers
- Seamless integration with backend API

#### 3. 🔗 REST API
- Easy integration with existing workflows
- JWT-based authentication
- Comprehensive endpoint coverage
- Tiered access control for different user levels

### How It Works

```
User uploads image → Preprocessing (resize, normalize) → ResNet50 U-Net Model 
→ Segmentation mask generation → Post-processing → Confidence scoring 
→ Visual results with highlighted tampered regions
```

The system provides:
- **Binary classification**: Tampered vs Authentic
- **Pixel-level segmentation**: Exact location of manipulations
- **Confidence scores**: Reliability metrics for each analysis
- **Visual overlays**: Highlighted suspicious regions on original image

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACES                         │
├──────────────────┬───────────────────┬─────────────────────────┤
│  Web Application │ Browser Extension │    API Clients          │
│   (Next.js 14)   │   (Chrome V3)     │  (Third-party)          │
│   Port: 3000     │   Context Menu    │   REST Integration      │
└────────┬─────────┴─────────┬─────────┴──────────┬──────────────┘
         │                    │                     │
         └────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │    BACKEND API     │
                    │   Flask Server     │
                    │   Port: 5000       │
                    └─────────┬──────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    ┌────▼─────┐      ┌──────▼──────┐      ┌─────▼──────┐
    │   Auth   │      │   Model     │      │  Database  │
    │ Service  │      │  Inference  │      │  (SQLite)  │
    │  (JWT)   │      │ (TF/Keras)  │      │   Users    │
    └──────────┘      └──────┬──────┘      │   Images   │
                             │              └────────────┘
                    ┌────────▼─────────┐
                    │   ML MODEL       │
                    │ ResNet50 U-Net   │
                    │  256x256 Input   │
                    │ Tampering Detect │
                    └──────────────────┘
```

### Component Architecture

#### 🔴 Backend (Flask API) - `/backend`
**Purpose**: Core processing engine and business logic

**Responsibilities**:
- User authentication and authorization with JWT tokens
- Document upload, storage, and retrieval
- ML model loading and inference orchestration
- Tiered access control (Free: 10/month, Pro: 100/month, Premium: 1000/month)
- Image preprocessing and post-processing
- Database operations (users, images, analysis results)
- Error handling and logging

**Key Files**:
- `app.py` - Flask application factory with CORS configuration
- `main.py` - Application entry point
- `routes/` - Modular API endpoint handlers
- `utils/model_service.py` - TensorFlow model loading and prediction
- `database.py` - SQLite connection management

#### 🔵 Frontend (Next.js Web App) - `/frontend`
**Purpose**: Primary user interface for document analysis

**Responsibilities**:
- Intuitive drag-and-drop document upload
- Real-time analysis progress tracking
- Interactive results visualization with overlays
- User dashboard with usage statistics
- Analysis history with filtering/sorting
- Responsive design (mobile, tablet, desktop)
- User authentication and profile management
- Dark mode support

**Key Files**:
- `app/` - Next.js App Router pages (landing, analyze, dashboard, history)
- `components/` - Reusable React components (Navbar, ImageUploader, ResultCard)
- `public/` - Static assets and images

#### 🟢 Browser Extension - `/extension`
**Purpose**: Quick document verification while browsing

**Responsibilities**:
- Context menu integration ("Analyze with Proofly")
- Image capture from web pages
- Direct communication with backend API
- Results popup interface
- Authentication token management
- Cross-origin image handling

**Key Files**:
- `manifest.json` - Chrome Extension V3 configuration
- `background.js` - Service worker for API calls
- `content.js` - Content script for page interaction
- `popup.html/js` - Extension UI and logic

#### 🟡 ML Training Pipeline - `/ml-app`
**Purpose**: Model development and training infrastructure

**Responsibilities**:
- Dataset loading and preprocessing
- ResNet50 encoder with U-Net decoder architecture
- Training loop with custom loss functions
- Model evaluation and metric calculation
- Data augmentation pipeline
- Checkpoint management and model export
- Visualization of training progress

**Key Files**:
- `model-training/training3.ipynb` - Complete training pipeline
- `dataset/` - Training data (authentic, tampered, masks)
- `invoices_dataset/` - 9000+ invoice tampering samples
- `stamp_dataset/` - Stamp forgery detection dataset
- `utils.py` - Helper functions for data processing

### Data Flow

1. **User Upload** → Image sent to backend via HTTP POST
2. **Authentication** → JWT token validated
3. **Preprocessing** → Image resized to 256x256, normalized
4. **Model Inference** → ResNet50 U-Net generates segmentation mask
5. **Post-processing** → Mask thresholding, confidence calculation
6. **Storage** → Results saved to database
7. **Response** → JSON with tampering verdict, mask, confidence
8. **Visualization** → Frontend displays results with overlay

---

## 🛠️ Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.13 | Core programming language |
| **Flask** | 2.3.0 | Web framework for REST API |
| **TensorFlow/Keras** | 2.14.0 | Deep learning inference |
| **SQLite** | 3.x | Lightweight database |
| **JWT (PyJWT)** | 2.8.0 | Authentication tokens |
| **Werkzeug** | 2.3.0 | Password hashing |
| **Pillow** | 10.0.0 | Image processing |
| **NumPy** | 1.24.0 | Array operations |
| **Flask-CORS** | 4.0.0 | Cross-origin requests |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.x | React framework with App Router |
| **React** | 18.x | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Fetch API** | Native | HTTP client |

### Extension Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **JavaScript** | ES6+ | Core language (Vanilla JS) |
| **Chrome Extension API** | V3 | Browser integration |
| **HTML5/CSS3** | Latest | UI markup and styling |

### Machine Learning Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **TensorFlow** | 2.14.0 | Deep learning framework |
| **Keras** | Included | High-level neural network API |
| **ResNet50** | Pre-trained | Transfer learning encoder |
| **U-Net** | Custom | Segmentation decoder |
| **NumPy** | 1.24.0 | Numerical computations |
| **Matplotlib** | 3.7.0 | Visualization |
| **scikit-learn** | 1.3.0 | Data splitting and metrics |
| **Jupyter** | Latest | Interactive development |
| **Pillow** | 10.0.0 | Image manipulation |

### Development Tools

- **Git** - Version control
- **VS Code** - Primary IDE
- **Jupyter Notebook** - ML experimentation
- **Chrome DevTools** - Extension debugging
- **Postman** - API testing
- **pytest** - Backend testing
- **Jest** - Frontend testing

---

## ✨ Features & Capabilities

### Core Features

#### 🔍 Advanced Tampering Detection
- **Pixel-level segmentation** of manipulated regions
- **Multiple tampering types** supported:
  - Copy-paste forgery
  - Text manipulation
  - Region cloning
  - Splicing detection
  - Stamp forgery
- **Confidence scoring** for each analysis (0-100%)
- **Visual overlays** highlighting suspicious areas

#### 👤 User Management
- **Secure authentication** with JWT tokens
- **Tiered access control**:
  - **Free**: 10 analyses/month
  - **Pro**: 100 analyses/month
  - **Premium**: 1000 analyses/month
- **Profile management** (update email, name, password)
- **Usage tracking** with monthly quotas
- **Analysis history** with search and filtering

#### 📊 Analytics & Reporting
- **Detailed results** with:
  - Binary verdict (Tampered/Authentic)
  - Confidence percentage
  - Segmentation mask overlay
  - Analysis timestamp
  - Processing time
- **History dashboard** showing:
  - All previous analyses
  - Success rate statistics
  - Monthly usage charts
  - Recent activity timeline

#### 🚀 Performance Optimizations
- **Fast inference**: 2-3 seconds per image
- **Efficient preprocessing**: Automatic resizing and normalization
- **Batch processing capability**: Multiple images in queue
- **GPU acceleration**: CUDA support for model inference
- **Multi-core CPU**: Optimized for 10-core processing
- **Memory management**: Gradient accumulation for large models

#### 🔒 Security Features
- **Password hashing** with Werkzeug (PBKDF2)
- **JWT authentication** with expiration
- **SQL injection prevention** with parameterized queries
- **XSS protection** in web interface
- **File type validation** (only PNG, JPEG allowed)
- **File size limits** (16MB maximum)
- **CORS configuration** for secure cross-origin requests

#### 📱 Cross-Platform Support
- **Responsive web design**: Desktop, tablet, mobile
- **Browser extension**: Chrome, Edge, Brave
- **API access**: Language-agnostic REST endpoints
- **Mobile-friendly**: Touch-optimized interface

### Unique Selling Points

1. **Real-time Browser Integration**: Only solution with seamless browser extension
2. **Great Accuracy**: 68-76% detection rate on diverse datasets
3. **Explainable AI**: Pixel-level visualization of tampering locations
4. **Production-Ready**: Complete authentication, database, and API
5. **Scalable Architecture**: Tiered access and quota management
6. **Open Research**: Trained on public datasets (RealTextManipulation, Stamp)

---

## 📥 Installation Guide

### System Requirements

**Minimum Requirements**:
- OS: macOS, Linux, or Windows 10+
- RAM: 8GB (16GB recommended for training)
- Storage: 10GB free space (50GB for datasets)
- Python: 3.8 or higher
- Node.js: 16.0 or higher

**Recommended for ML Training**:
- GPU: NVIDIA GPU with CUDA support (8GB+ VRAM)
- CPU: Multi-core processor (8+ cores recommended)
- RAM: 16GB+
- Storage: SSD with 100GB+ free space

### Prerequisites Installation

#### 1. Install Python 3.8+
```bash
# macOS (using Homebrew)
brew install python@3.10

# Ubuntu/Debian
sudo apt update
sudo apt install python3.10 python3-pip python3-venv

# Windows
# Download from python.org
```

#### 2. Install Node.js 16+
```bash
# macOS (using Homebrew)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Windows
# Download from nodejs.org
```

#### 3. Install Git
```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt install git

# Windows
# Download from git-scm.com
```

### Complete Setup (All Components)

#### Step 1: Clone Repository

```bash
# Clone the project
git clone https://github.com/yourusername/hackathon.git
cd hackathon
```

#### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Initialize database
python setup_db.py

# Verify installation
python -c "import tensorflow as tf; print(f'TensorFlow version: {tf.__version__}')"
python -c "import flask; print(f'Flask version: {flask.__version__}')"

# Run backend server
python main.py
```

Expected output:
```
Database initialized successfully!
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

**Backend should now be running on `http://localhost:5000`**

#### Step 3: Frontend Setup

Open a **new terminal window**:

```bash
cd frontend

# Install dependencies
npm install
# or with yarn:
yarn install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Run development server
npm run dev
# or with yarn:
yarn dev
```

Expected output:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

**Frontend should now be running on `http://localhost:3000`**

#### Step 4: Browser Extension Setup

```bash
# No build required for extension (vanilla JavaScript)

# Chrome/Edge Installation:
1. Open Chrome and navigate to chrome://extensions/
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the /extension directory from your project
5. Proofly extension icon should appear in toolbar
```

#### Step 5: Verify Installation

1. **Test Backend API**:
```bash
curl http://localhost:5000/api/health
# Expected: {"status": "ok"}
```

2. **Test Frontend**:
- Open browser to `http://localhost:3000`
- You should see the Proofly landing page

3. **Test Extension**:
- Right-click any image on a webpage
- Look for "Analyze with Proofly" in context menu

### Optional: ML Training Setup

Only needed if you want to retrain the model:

```bash
cd ml-app

# Activate backend virtual environment (or create new one)
source ../backend/venv/bin/activate

# Install additional ML dependencies
pip install jupyter matplotlib scikit-learn opencv-python

# Start Jupyter Notebook
jupyter notebook

# Open: model-training/training3.ipynb
```

### Configuration

#### Backend Configuration (`backend/config.py`)

```python
# Server settings
HOST = '0.0.0.0'
PORT = 5000
DEBUG = True  # Set to False in production

# Upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

# JWT settings
SECRET_KEY = 'your-secret-key-here'  # Change in production!
JWT_EXPIRATION_HOURS = 24

# Tier limits (uploads per month)
TIER_LIMITS = {
    'free': 10,
    'pro': 100,
    'premium': 1000
}

# Model settings
MODEL_PATH = 'resnet50_unet_tampering_detector.keras'
IMG_SIZE = (256, 256)
```

#### Frontend Configuration (`.env.local`)

```env
# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Environment
NEXT_PUBLIC_ENV=development
```

#### Extension Configuration (`extension/background.js`)

```javascript
// Update API URL (line ~3)
const API_URL = 'http://localhost:5000/api';

// For production:
// const API_URL = 'https://api.proofly.com/api';
```

### Troubleshooting Installation

#### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'tensorflow'`
```bash
# Solution: Ensure virtual environment is activated
source venv/bin/activate
pip install tensorflow
```

**Problem**: `Port 5000 already in use`
```bash
# Solution: Change port in config.py or kill existing process
lsof -ti:5000 | xargs kill -9
```

**Problem**: `Model file not found`
```bash
# Solution: Ensure model file is in backend directory
ls backend/*.keras
# If missing, download from model training or cloud storage
```

#### Frontend Issues

**Problem**: `Error: Cannot find module 'next'`
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem**: `API Connection Failed`
```bash
# Solution: Check backend is running
curl http://localhost:5000/api/health

# Check CORS settings in backend/app.py
# Ensure frontend URL is allowed
```

#### Extension Issues

**Problem**: Context menu not appearing
```bash
# Solution: 
1. Reload extension in chrome://extensions/
2. Check background.js console for errors
3. Verify permissions in manifest.json
```

**Problem**: API requests failing
```bash
# Solution: Check host_permissions in manifest.json
# Ensure localhost:5000 is included
```

### Docker Setup (Alternative)

For containerized deployment:

#### Backend Dockerfile
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
EXPOSE 5000

CMD ["python", "main.py"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
    environment:
      - FLASK_ENV=development

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000/api
```

Run with Docker:
```bash
docker-compose up -d
```

---

## 📖 Usage Instructions

### Web Application Workflow

#### 1. Account Creation & Login

**Register New Account:**
```
1. Navigate to http://localhost:3000
2. Click "Sign Up" in navigation bar
3. Fill in registration form:
   - Username: unique identifier
   - Email: valid email address
   - Name: full name
   - Password: minimum 6 characters
   - Tier: Select Free/Pro/Premium
4. Click "Create Account"
5. Automatic login and redirect to dashboard
```

**Login to Existing Account:**
```
1. Navigate to http://localhost:3000
2. Click "Login" in navigation bar
3. Enter username/email and password
4. Click "Sign In"
5. JWT token stored securely in localStorage
```

#### 2. Document Analysis

**Upload Document for Analysis:**
```
1. Click "Analyze" in navigation menu
2. Upload image using one of two methods:
   
   Method A - Drag & Drop:
   - Drag image file into drop zone
   - File automatically validates (PNG/JPEG, <16MB)
   
   Method B - File Picker:
   - Click "Choose File" button
   - Select image from file system
   - Click "Open"

3. Click "Analyze Document" button
4. Progress indicator shows processing status
5. Results display in 2-3 seconds
```

**Understanding Results:**
```
Results Display Shows:
- ✅ Verdict: "Authentic" or "⚠️ Tampered"
- 📊 Confidence Score: 0-100% (higher = more certain)
- 🖼️ Original Image: Your uploaded document
- 🎯 Segmentation Mask: Red overlay showing tampered regions
- 📅 Analysis Date: Timestamp of analysis
- ⏱️ Processing Time: How long analysis took

Interpreting Confidence:
- 90-100%: Very high confidence
- 70-89%: High confidence  
- 50-69%: Moderate confidence
- Below 50%: Low confidence (manual review recommended)
```

#### 3. View Analysis History

```
1. Click "History" in navigation menu
2. View all previous analyses in table format:
   - Thumbnail preview
   - Filename
   - Verdict (Authentic/Tampered)
   - Confidence percentage
   - Upload date/time
   
3. Filter and sort:
   - Search by filename
   - Filter by verdict (All/Authentic/Tampered)
   - Sort by date, confidence, or name

4. Click any row to view detailed analysis
5. Download segmentation mask or report
6. Delete old analyses
```

#### 4. Dashboard & Usage

```
1. Click "Dashboard" in navigation menu
2. View statistics:
   - Current tier (Free/Pro/Premium)
   - Monthly quota (X/Y uploads used)
   - Success rate (% authentic vs tampered)
   - Recent activity timeline
   
3. Upgrade tier if needed
4. Update profile information
5. Change password
```

### Browser Extension Usage

#### Quick Analysis from Web

```
1. Browse any website with images
2. Right-click on any image
3. Select "Analyze with Proofly" from context menu
4. Extension captures image and sends to API
5. Notification shows initial result
6. Click extension icon for detailed view
7. Click "View Full Report" to open web app
```

#### Extension Popup Interface

```
1. Click Proofly icon in browser toolbar
2. Popup shows:
   - Login status
   - Recent analysis results
   - Quick stats (analyses used this month)
   - Quick analyze button
   
3. Click "Login" if not authenticated
4. View history of browser-analyzed images
5. Access settings and preferences
```

### API Usage (For Developers)

#### Authentication Flow

**1. Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "name": "Test User",
    "password": "securepass123",
    "tier": "free"
  }'
```

Response:
```json
{
  "message": "User registered successfully",
  "user_id": 1
}
```

**2. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "securepass123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "tier": "free"
  }
}
```

#### Upload & Analyze Document

```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/document.jpg"
```

Response:
```json
{
  "message": "Image analyzed successfully",
  "image_id": 42,
  "result": {
    "is_tampered": true,
    "confidence": 0.8532,
    "tampered_regions": [
      {"x": 120, "y": 80, "width": 200, "height": 150}
    ],
    "analysis_timestamp": "2026-01-18T10:30:00Z",
    "processing_time_ms": 2341
  }
}
```

#### Get Analysis History

```bash
curl -X GET http://localhost:5000/api/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Specific Analysis

```bash
curl -X GET http://localhost:5000/api/images/42 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Check Usage Stats

```bash
curl -X GET http://localhost:5000/api/user/usage \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "tier": "free",
  "limit": 10,
  "used": 5,
  "remaining": 5,
  "reset_date": "2026-02-01T00:00:00Z"
}
```

### Python SDK Example

```python
import requests

class ProoflyClient:
    def __init__(self, api_url="http://localhost:5000/api"):
        self.api_url = api_url
        self.token = None
    
    def login(self, username, password):
        response = requests.post(
            f"{self.api_url}/auth/login",
            json={"username": username, "password": password}
        )
        data = response.json()
        self.token = data['token']
        return data
    
    def analyze_image(self, image_path):
        with open(image_path, 'rb') as f:
            response = requests.post(
                f"{self.api_url}/upload",
                headers={"Authorization": f"Bearer {self.token}"},
                files={"file": f}
            )
        return response.json()
    
    def get_history(self):
        response = requests.get(
            f"{self.api_url}/images",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        return response.json()

# Usage
client = ProoflyClient()
client.login("testuser", "securepass123")
result = client.analyze_image("suspicious_document.jpg")
print(f"Tampered: {result['result']['is_tampered']}")
print(f"Confidence: {result['result']['confidence']:.2%}")
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class ProoflyClient {
  constructor(apiUrl = 'http://localhost:5000/api') {
    this.apiUrl = apiUrl;
    this.token = null;
  }

  async login(username, password) {
    const response = await axios.post(`${this.apiUrl}/auth/login`, {
      username,
      password
    });
    this.token = response.data.token;
    return response.data;
  }

  async analyzeImage(imagePath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));

    const response = await axios.post(
      `${this.apiUrl}/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.token}`
        }
      }
    );
    return response.data;
  }

  async getHistory() {
    const response = await axios.get(`${this.apiUrl}/images`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.data;
  }
}

// Usage
(async () => {
  const client = new ProoflyClient();
  await client.login('testuser', 'securepass123');
  const result = await client.analyzeImage('suspicious_document.jpg');
  console.log(`Tampered: ${result.result.is_tampered}`);
  console.log(`Confidence: ${(result.result.confidence * 100).toFixed(2)}%`);
})();
```

---

## Model Training

The system uses a ResNet50-based U-Net model trained on document tampering datasets:

### Training Process

```bash
cd ml-app/model-training

# Open training notebook
jupyter notebook training3.ipynb

# Follow notebook cells to:
# 1. Load invoice and stamp datasets
# 2. Preprocess and balance data
# 3. Train ResNet50 U-Net model
# 4. Evaluate performance
# 5. Save trained model
```

### Datasets Used

- **Invoice Dataset:** 9000+ manipulated invoice images with segmentation masks
- **Stamp Dataset:** Genuine stamp images with ground-truth tampering maps
- **Train/Val/Test Split:** 70% / 20% / 10%

### Model Architecture

- Encoder: Pre-trained ResNet50 (ImageNet weights)
- Decoder: U-Net with skip connections
- Output: Pixel-wise segmentation mask
- Loss: Combined Dice Loss + Binary Crossentropy
- Input: 256x256 RGB images
- Output: 256x256 binary mask

## Configuration

### Backend Configuration (`backend/config.py`)

```python
# Upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

# Tier limits
TIER_LIMITS = {
    'basic': 10,    # uploads per month
    'pro': 100,
    'premium': 1000
}
```

### Frontend Configuration

Update API endpoint in components as needed:
```javascript
const API_URL = 'http://localhost:5000/api'
```

## Database Schema

**users table:**
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- email (TEXT UNIQUE)
- password (TEXT - hashed)
- tier (TEXT - basic/pro/premium)
- created_at (TIMESTAMP)

**images table:**
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER FOREIGN KEY)
- filename (TEXT)
- analysis_result (TEXT)
- confidence_score (REAL)
- is_tampered (BOOLEAN)
- uploaded_at (TIMESTAMP)

## Development

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Code Structure

```
hackathon/
├── backend/           # Flask API server
│   ├── routes/       # API route handlers
│   ├── utils/        # Helper functions
│   └── uploads/      # Uploaded files
├── frontend/          # Next.js web app
│   ├── app/          # Next.js pages
│   ├── components/   # React components
│   └── public/       # Static assets
├── extension/         # Chrome extension
│   ├── background.js # Background service
│   ├── content.js    # Content script
│   └── popup.html    # Extension UI
└── ml-app/           # ML training
    ├── model-training/ # Training notebooks
    ├── dataset/       # Training data
    └── utils.py       # Data utilities
```

## Performance

- Model inference time: ~2-3 seconds per image
- Training time: ~4-5 hours for 15 epochs (with GPU)
- API response time: <5 seconds for analysis
- Supported image formats: JPEG, PNG
- Maximum image size: 16MB

## Troubleshooting

**Backend not starting:**
- Ensure Python virtual environment is activated
- Check if port 5000 is already in use
- Verify all dependencies are installed

**Frontend build errors:**
- Clear `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall: `npm install`
- Check Node.js version compatibility

**Model not loading:**
- Verify model file exists in backend directory
- Check TensorFlow version compatibility
- Ensure sufficient system memory

**Extension not working:**
- Reload extension in Chrome extensions page
- Check console for errors (right-click extension > Inspect)
- Verify backend API is running

## Future Enhancements

- Support for PDF document analysis
- Real-time video frame analysis
- Multi-language support
- Mobile application versions
- Advanced forgery detection techniques
- Batch processing capabilities
- Export detailed analysis reports

## License

This project is developed for educational and research purposes.

## Contributors

Developed as part of a hackathon project focusing on document security and authentication.

## Contact

For questions or support, please open an issue in the project repository.
