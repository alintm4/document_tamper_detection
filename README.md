# Proofly - Document Tampering Detection System

A comprehensive document authentication platform that uses advanced deep learning techniques to detect tampering and forgeries in digital documents. The system combines a ResNet50-based U-Net segmentation model with a user-friendly web interface and browser extension.

## Project Overview

Proofly provides three integrated solutions for document verification:
- Web application for detailed document analysis
- Browser extension for quick verification while browsing
- RESTful API for integration with existing systems

The system analyzes uploaded documents using trained neural networks to identify manipulated regions, providing pixel-level segmentation masks highlighting suspected forgeries.

## Architecture

### Backend (Flask API)
Located in `/backend`, the Python-based REST API handles:
- User authentication and authorization with JWT tokens
- Document upload and storage management
- ML model inference using TensorFlow/Keras
- Tiered access control (Basic, Pro, Premium)
- Image processing and analysis

### Frontend (Next.js Web App)
Located in `/frontend`, the React-based web interface provides:
- Intuitive document upload interface
- Real-time analysis results visualization
- User dashboard with usage statistics
- Responsive design with Tailwind CSS
- User authentication and profile management

### Browser Extension
Located in `/extension`, the Chrome extension enables:
- Quick document verification from any webpage
- Direct image upload via right-click context menu
- Results displayed in popup interface
- Integration with backend API

### ML Model Training
Located in `/ml-app`, the model training pipeline includes:
- ResNet50 encoder with U-Net decoder architecture
- Training on invoice and stamp datasets
- Custom Dice + Binary Crossentropy loss function
- Data augmentation and preprocessing utilities
- Model evaluation and visualization tools

## Technology Stack

**Backend:**
- Flask (Python web framework)
- TensorFlow/Keras (Deep learning)
- SQLite (Database)
- JWT (Authentication)
- Pillow (Image processing)

**Frontend:**
- Next.js 14 (React framework)
- TypeScript (Type safety)
- Tailwind CSS (Styling)
- React Hooks (State management)

**ML/Training:**
- TensorFlow 2.x
- ResNet50 (Transfer learning)
- U-Net (Segmentation architecture)
- NumPy, Pandas (Data processing)
- Matplotlib (Visualization)

**Extension:**
- Vanilla JavaScript
- Chrome Extension APIs
- HTML/CSS

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- pip (Python package manager)
- npm or yarn (Node package manager)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python setup_db.py

# Run development server
python main.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The web app will be available at `http://localhost:3000`

### Browser Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked"
4. Select the `/extension` directory
5. The extension icon will appear in your browser toolbar

## Usage

### Web Application

1. Navigate to `http://localhost:3000`
2. Create an account or log in
3. Upload a document image (JPEG, PNG)
4. View analysis results with highlighted tampering regions
5. Access history of previous analyses in dashboard

### Browser Extension

1. Right-click on any image on a webpage
2. Select "Analyze with Proofly" from context menu
3. View results in the extension popup
4. Click for detailed analysis in web app

### API Endpoints

**Authentication:**
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

**Analysis:**
- `POST /api/upload` - Upload document for analysis
- `GET /api/images` - Get analysis history
- `GET /api/images/<id>` - Get specific analysis result

**User Management:**
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/usage` - Get usage statistics

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
