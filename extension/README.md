# Browser Extension - Chrome Extension

Lightweight Chrome extension for quick document tampering detection directly from your browser. Enables users to analyze images on any webpage with a simple right-click action.

## Overview

The Proofly browser extension provides seamless integration with the web platform, allowing users to verify image authenticity without leaving their browsing context. Perfect for quickly checking screenshots, documents, or any suspicious images encountered online.

## Features

- Right-click context menu integration
- Quick image analysis from any webpage
- Popup interface for results viewing
- Direct integration with backend API
- Minimal permissions required
- Lightweight and fast
- Cross-origin image handling
- Authentication support

## Technology Stack

- Vanilla JavaScript (No frameworks)
- Chrome Extension Manifest V3
- HTML5 & CSS3
- Chrome Storage API
- Chrome Context Menus API
- Fetch API for backend communication

## Project Structure

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (background script)
├── content.js             # Content script injected into pages
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic
├── styles.css             # Popup styling
├── icons/                 # Extension icons
│   ├── icon16.png        # 16x16 icon
│   ├── icon48.png        # 48x48 icon
│   └── icon128.png       # 128x128 icon
└── README.md             # This file
```

## Installation

### From Source (Development)

1. Clone the repository:
```bash
git clone <repository-url>
cd extension
```

2. Open Chrome and navigate to:
```
chrome://extensions/
```

3. Enable "Developer mode" (toggle in top-right corner)

4. Click "Load unpacked"

5. Select the `extension` directory

6. The Proofly extension icon will appear in your toolbar

### From Chrome Web Store (Production)

1. Visit Chrome Web Store
2. Search for "Proofly"
3. Click "Add to Chrome"
4. Confirm installation

## Configuration

### API Endpoint

Update the API URL in `background.js`:

```javascript
const API_URL = 'http://localhost:5000/api';
```

For production:
```javascript
const API_URL = 'https://api.proofly.com/api';
```

### Manifest Configuration

Edit `manifest.json` for permissions and settings:

```json
{
  "manifest_version": 3,
  "name": "Proofly",
  "version": "1.0.0",
  "description": "Detect image manipulation & verify authenticity with AI",
  "permissions": [
    "contextMenus",
    "activeTab",
    "storage",
    "scripting"
  ],
  "host_permissions": [
    "http://localhost:8081/*",
    "<all_urls>"
  ]
}
```

## Usage

### Analyzing Images

1. **Right-click on any image** on a webpage
2. Select **"Analyze with Proofly"** from context menu
3. Wait for analysis (2-3 seconds)
4. View results in notification or popup

### Viewing Results

1. Click the **Proofly icon** in toolbar
2. See recent analysis results
3. Click **"View Details"** for full report
4. Access history and settings

### Authentication

First-time setup:
1. Click extension icon
2. Click "Login" or "Sign Up"
3. Enter credentials
4. Token stored securely in Chrome storage

## Components

### Background Service Worker (background.js)

Handles:
- Context menu creation
- Image capture and processing
- API communication
- Authentication token management
- Cross-origin requests

Key functions:

```javascript
// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeImage',
    title: 'Analyze with Proofly',
    contexts: ['image']
  });
});

// Handle menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzeImage') {
    analyzeImage(info.srcUrl);
  }
});

// Analyze image
async function analyzeImage(imageUrl) {
  // Fetch image, convert to base64, send to API
}
```

### Content Script (content.js)

Injected into webpages to:
- Detect images on page
- Extract image data
- Communicate with background script
- Show analysis overlays (optional)

```javascript
// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getImageData') {
    sendResponse({ data: extractImageData() });
  }
});
```

### Popup Interface (popup.html/js)

Displays:
- Recent analysis results
- Authentication status
- Quick analysis button
- Settings and preferences
- Link to full web app

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Proofly</h1>
    <div id="status"></div>
    <div id="results"></div>
    <button id="analyze">Quick Analyze</button>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

## API Integration

### Authentication

Store token in Chrome storage:

```javascript
// Save token
chrome.storage.local.set({ token: 'jwt-token' });

// Retrieve token
chrome.storage.local.get(['token'], (result) => {
  const token = result.token;
});
```

### Upload Image

```javascript
async function uploadImage(imageBlob) {
  const formData = new FormData();
  formData.append('file', imageBlob);

  const token = await getToken();
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
}
```

### Handle Results

```javascript
function displayResults(result) {
  if (result.is_tampered) {
    showNotification('Tampering detected!', 'warning');
  } else {
    showNotification('Image appears authentic', 'success');
  }
}
```

## Permissions

Required permissions explained:

- **contextMenus**: Add right-click menu option
- **activeTab**: Access current tab for image analysis
- **storage**: Store authentication tokens and preferences
- **scripting**: Inject content scripts for image detection
- **host_permissions**: Connect to backend API

## Storage

Data stored in Chrome storage:

```javascript
{
  "token": "jwt-authentication-token",
  "user": {
    "id": 1,
    "username": "user",
    "tier": "free"
  },
  "recentAnalyses": [
    {
      "id": 1,
      "timestamp": "2026-01-18T10:30:00Z",
      "result": "tampered",
      "confidence": 0.85
    }
  ],
  "preferences": {
    "autoAnalyze": false,
    "showNotifications": true
  }
}
```

## Icons

Required icon sizes:
- 16x16: Toolbar and context menu
- 48x48: Extension management page
- 128x128: Chrome Web Store listing

Format: PNG with transparency

## Security Considerations

- Token stored in secure Chrome storage
- No sensitive data in content scripts
- HTTPS for API communication
- Cross-origin request handling
- Input validation for image URLs
- Rate limiting consideration

## Testing

### Manual Testing

1. Load extension in developer mode
2. Visit various websites with images
3. Test context menu functionality
4. Verify API communication
5. Check error handling

### Automated Testing

```javascript
// Example test with Chrome Extension Testing Library
describe('Proofly Extension', () => {
  test('creates context menu', async () => {
    // Test implementation
  });

  test('analyzes image successfully', async () => {
    // Test implementation
  });
});
```

## Building for Production

1. Update manifest version
2. Update API endpoint to production URL
3. Optimize icons and assets
4. Minimize JavaScript files
5. Remove console.log statements
6. Test thoroughly
7. Create ZIP file for Chrome Web Store

```bash
# Create production build
zip -r proofly-extension.zip . -x "*.git*" -x "*node_modules*"
```

## Publishing to Chrome Web Store

1. Create Chrome Web Store developer account
2. Pay one-time registration fee
3. Upload ZIP file
4. Fill in store listing details
5. Add screenshots and promotional images
6. Submit for review
7. Wait for approval (typically 1-3 days)

## Troubleshooting

### Extension Not Loading
- Check manifest.json for syntax errors
- Verify all files are in correct locations
- Check Chrome console for error messages
- Ensure permissions are properly declared

### API Connection Failed
- Verify backend is running
- Check API URL configuration
- Inspect network requests in DevTools
- Verify CORS settings on backend

### Context Menu Not Appearing
- Reload extension
- Check permissions in manifest
- Verify background script is running
- Check Chrome console for errors

### Authentication Issues
- Clear Chrome storage
- Re-login through popup
- Verify token format
- Check token expiration

## Development Tips

- Use Chrome DevTools for debugging
- Check background page console for errors
- Test on different websites
- Handle edge cases (blocked images, CORS)
- Implement proper error messages
- Add loading indicators
- Cache results when appropriate

## Performance

- Lightweight bundle size
- Minimal memory footprint
- Fast image processing
- Efficient API calls
- Background script optimization

## Browser Compatibility

Currently supports:
- Google Chrome (latest)
- Microsoft Edge (Chromium-based)
- Brave Browser
- Other Chromium-based browsers

Note: Firefox requires separate WebExtension adaptation.

## Updating the Extension

For users:
- Automatic updates through Chrome Web Store
- Manual update: Remove and reinstall

For developers:
1. Increment version in manifest.json
2. Make necessary changes
3. Test thoroughly
4. Upload new version to store
5. Users receive automatic update

## Privacy Policy

The extension:
- Only processes images user explicitly selects
- Does not track browsing history
- Stores minimal data locally
- Communicates only with Proofly API
- Does not share data with third parties

## Limitations

- Requires active internet connection
- Subject to backend API limits
- Large images may take longer to process
- Cannot analyze images behind authentication walls
- Cross-origin restrictions may apply

## Future Enhancements

- Batch image analysis
- Custom keyboard shortcuts
- Detailed confidence metrics
- Offline analysis capability
- Support for more image formats
- Integration with cloud storage
- Advanced result visualization

## Contributing

To contribute:
1. Fork repository
2. Create feature branch
3. Follow code style guidelines
4. Test thoroughly
5. Submit pull request

## Support

For issues or questions:
- Check troubleshooting section
- Review Chrome extension documentation
- Contact support team
- Report bugs in issue tracker

## License

Educational and research purposes.
