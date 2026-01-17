// Background service worker for Image Analyzer extension

const API_BASE_URL = 'http://localhost:5000';

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeImage',
    title: 'Analyze Image for Manipulation',
    contexts: ['image']
  });
  
  chrome.contextMenus.create({
    id: 'analyzeImageQuick',
    title: 'Quick Analyze (No Overlay)',
    contexts: ['image']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'analyzeImage' || info.menuItemId === 'analyzeImageQuick') {
    const showOverlay = info.menuItemId === 'analyzeImage';
    
    try {
      // Send message to content script to show loading state
      await chrome.tabs.sendMessage(tab.id, {
        action: 'showLoading',
        imageUrl: info.srcUrl
      });
      
      // Fetch the image
      const imageBlob = await fetchImage(info.srcUrl);
      
      // Get auth token from storage
      const { authToken } = await chrome.storage.local.get('authToken');
      
      // Upload and analyze
      const result = await analyzeImage(imageBlob, authToken);
      
      // Send result to content script
      await chrome.tabs.sendMessage(tab.id, {
        action: showOverlay ? 'showResult' : 'showNotification',
        imageUrl: info.srcUrl,
        result: result
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      await chrome.tabs.sendMessage(tab.id, {
        action: 'showError',
        imageUrl: info.srcUrl,
        error: error.message
      });
    }
  }
});

// Fetch image from URL and convert to blob
async function fetchImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch image');
  }
  return await response.blob();
}

// Upload image to backend for analysis
async function analyzeImage(imageBlob, authToken) {
  const formData = new FormData();
  formData.append('file', imageBlob, 'image.jpg');
  
  const headers = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  // First upload the image
  const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: headers,
    body: formData
  });
  
  const uploadData = await uploadResponse.json();
  
  if (!uploadResponse.ok) {
    // Handle duplicate detection
    if (uploadResponse.status === 409) {
      if (uploadData.duplicate_type === 'exact') {
        return {
          status: 'duplicate',
          message: 'This exact image was already analyzed',
          existing_image_id: uploadData.existing_image_id
        };
      } else if (uploadData.duplicate_type === 'similar') {
        return {
          status: 'similar',
          message: 'A similar image was found',
          similarity_score: uploadData.similarity_score,
          existing_image_id: uploadData.existing_image_id
        };
      }
    }
    throw new Error(uploadData.error || 'Upload failed');
  }
  
  return {
    status: 'success',
    message: 'Image analyzed successfully',
    image_id: uploadData.image_id,
    image_hash: uploadData.image_hash,
    filename: uploadData.filename,
    tier: uploadData.tier,
    remaining_uploads: uploadData.remaining_uploads
  };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'login') {
    handleLogin(message.username, message.password)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep channel open for async response
  }
  
  if (message.action === 'register') {
    handleRegister(message.username, message.password)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
  
  if (message.action === 'logout') {
    chrome.storage.local.remove(['authToken', 'userInfo']);
    sendResponse({ success: true });
  }
  
  if (message.action === 'getStats') {
    getStats()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

// Handle login
async function handleLogin(username, password) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  
  // Store token and user info
  await chrome.storage.local.set({
    authToken: data.token,
    userInfo: {
      username: username,
      tier: data.tier,
      upload_count: data.upload_count,
      upload_limit: data.upload_limit
    }
  });
  
  return data;
}

// Handle registration
async function handleRegister(username, password) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  
  return data;
}

// Get user stats
async function getStats() {
  const { authToken } = await chrome.storage.local.get('authToken');
  
  if (!authToken) {
    throw new Error('Not logged in');
  }
  
  const response = await fetch(`${API_BASE_URL}/user/stats`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get stats');
  }
  
  return data;
}
