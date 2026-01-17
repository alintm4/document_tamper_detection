// Background service worker for Proofly extension

const API_BASE_URL = 'http://localhost:5000';

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeImage',
    title: ' Check with Proofly',
    contexts: ['image']
  });
  
  chrome.contextMenus.create({
    id: 'selectRegion',
    title: ' Select Region to Check',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'selectRegion') {
    // Start region selection mode
    await chrome.tabs.sendMessage(tab.id, { action: 'startSelection' });
    return;
  }
  
  if (info.menuItemId === 'analyzeImage') {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'showLoading',
        imageUrl: info.srcUrl
      });
      
      const imageBlob = await fetchImage(info.srcUrl);
      const { authToken } = await chrome.storage.local.get('authToken');
      const result = await analyzeImage(imageBlob, authToken);
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'showResult',
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
    // Handle upload limit reached
    if (uploadResponse.status === 429) {
      const isAnonymous = uploadData.tier === 'anonymous';
      return {
        status: 'limit_reached',
        message: isAnonymous 
          ? `Free limit reached! Sign up to get ${uploadData.signup_bonus || 5} more uploads!`
          : uploadData.upgrade_message || 'Upload limit reached',
        tier: uploadData.tier,
        limit: uploadData.limit,
        current: uploadData.current,
        signup_bonus: uploadData.signup_bonus
      };
    }
    
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

// Listen for messages from popup and content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle analyze request from content script (hover button)
  if (message.action === 'analyzeFromContent') {
    (async () => {
      try {
        const imageBlob = await fetchImage(message.imageUrl);
        const { authToken } = await chrome.storage.local.get('authToken');
        const result = await analyzeImage(imageBlob, authToken);
        sendResponse(result);
      } catch (error) {
        sendResponse({ status: 'error', message: error.message });
      }
    })();
    return true;
  }
  
  if (message.action === 'login') {
    handleLogin(message.username, message.password)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true;
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
