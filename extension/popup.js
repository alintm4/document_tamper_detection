// Popup script for Proofly extension

// DOM Elements
const loading = document.getElementById('loading');
const message = document.getElementById('message');
const anonymousView = document.getElementById('anonymousView');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const userDashboard = document.getElementById('userDashboard');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthStatus();
});

// Check authentication status
async function checkAuthStatus() {
  showLoading(true);
  
  try {
    const { authToken, userInfo } = await chrome.storage.local.get(['authToken', 'userInfo']);
    
    if (authToken && userInfo) {
      // User is logged in, try to refresh stats
      try {
        const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
        if (stats && !stats.error) {
          updateDashboard(stats);
          showView('dashboard');
        } else {
          // Token might be expired
          await chrome.storage.local.remove(['authToken', 'userInfo']);
          showView('anonymous');
        }
      } catch (e) {
        // Use cached info
        updateDashboard(userInfo);
        showView('dashboard');
      }
    } else {
      showView('anonymous');
    }
  } catch (error) {
    console.error('Auth check error:', error);
    showView('anonymous');
  }
  
  showLoading(false);
}

// Show specific view
function showView(view) {
  anonymousView.style.display = 'none';
  loginForm.style.display = 'none';
  registerForm.style.display = 'none';
  userDashboard.style.display = 'none';
  
  switch (view) {
    case 'anonymous':
      anonymousView.style.display = 'block';
      break;
    case 'login':
      loginForm.style.display = 'block';
      break;
    case 'register':
      registerForm.style.display = 'block';
      break;
    case 'dashboard':
      userDashboard.style.display = 'block';
      break;
  }
}

// Show loading state
function showLoading(show) {
  loading.style.display = show ? 'block' : 'none';
}

// Show message
function showMessage(text, type = 'error') {
  message.textContent = text;
  message.className = `message ${type}`;
  message.style.display = 'block';
  
  setTimeout(() => {
    message.style.display = 'none';
  }, 5000);
}

// Navigation functions
function showLogin() {
  showView('login');
}

function showRegister() {
  showView('register');
}

function showAnonymous() {
  showView('anonymous');
}

// Handle login
async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');
  
  btn.disabled = true;
  btn.textContent = 'Logging in...';
  
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'login',
      username,
      password
    });
    
    if (result.error) {
      showMessage(result.error);
    } else {
      showMessage('Login successful!', 'success');
      updateDashboard({
        username,
        tier: result.tier,
        upload_count: result.upload_count,
        upload_limit: result.upload_limit
      });
      showView('dashboard');
    }
  } catch (error) {
    showMessage('Login failed. Please try again.');
  }
  
  btn.disabled = false;
  btn.textContent = 'Login';
}

// Handle registration
async function handleRegister(event) {
  event.preventDefault();
  
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  const btn = document.getElementById('registerBtn');
  
  btn.disabled = true;
  btn.textContent = 'Creating account...';
  
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'register',
      username,
      password
    });
    
    if (result.error) {
      showMessage(result.error);
    } else {
      showMessage('Account created! Please login.', 'success');
      showView('login');
      document.getElementById('loginUsername').value = username;
    }
  } catch (error) {
    showMessage('Registration failed. Please try again.');
  }
  
  btn.disabled = false;
  btn.textContent = 'Create Account';
}

// Handle logout
async function handleLogout() {
  await chrome.runtime.sendMessage({ action: 'logout' });
  showView('anonymous');
  showMessage('Logged out successfully', 'success');
}

// Update dashboard with user info
function updateDashboard(info) {
  document.getElementById('userName').textContent = info.username || 'User';
  
  const tierBadge = document.getElementById('tierBadge');
  tierBadge.textContent = (info.tier || 'free').toUpperCase().replace('_', ' ');
  tierBadge.className = `tier-badge tier-${info.tier || 'free'}`;
  
  const uploadCount = info.upload_count || 0;
  const uploadLimit = info.upload_limit;
  const remaining = info.remaining !== undefined ? info.remaining : 
                    (uploadLimit ? uploadLimit - uploadCount : '∞');
  
  document.getElementById('uploadCount').textContent = uploadCount;
  document.getElementById('remainingCount').textContent = remaining;
  
  // Update progress bar
  const progressFill = document.getElementById('progressFill');
  if (uploadLimit) {
    const percentage = Math.min((uploadCount / uploadLimit) * 100, 100);
    progressFill.style.width = `${percentage}%`;
  } else {
    progressFill.style.width = '0%';
  }
}
