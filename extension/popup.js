// Popup script for Proofly extension

// DOM Elements
const loading = document.getElementById('loading');
const message = document.getElementById('message');
const anonymousView = document.getElementById('anonymousView');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const userDashboard = document.getElementById('userDashboard');
const limitAlert = document.getElementById('limitAlert');
const statusDot = document.getElementById('statusDot');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Set up event listeners for navigation
  setupEventListeners();
  
  await checkBackendStatus();
  await checkAuthStatus();
});

// Set up all event listeners
function setupEventListeners() {
  // Navigation buttons
  document.getElementById('btnShowRegister')?.addEventListener('click', () => showView('register'));
  document.getElementById('btnShowLogin')?.addEventListener('click', () => showView('login'));
  document.getElementById('btnShowAnonymous')?.addEventListener('click', () => showView('anonymous'));
  document.getElementById('linkToRegister')?.addEventListener('click', (e) => { e.preventDefault(); showView('register'); });
  document.getElementById('linkToLogin')?.addEventListener('click', (e) => { e.preventDefault(); showView('login'); });
  document.getElementById('btnLogout')?.addEventListener('click', handleLogout);
  
  // Form submissions
  document.getElementById('loginFormElement')?.addEventListener('submit', handleLogin);
  document.getElementById('registerFormElement')?.addEventListener('submit', handleRegister);
}

// Check if backend is running
async function checkBackendStatus() {
  try {
    const response = await fetch('http://localhost:5000/health', { 
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    if (response.ok) {
      statusDot.classList.remove('offline');
      statusDot.title = 'Connected';
    } else {
      throw new Error('Backend not responding');
    }
  } catch (error) {
    statusDot.classList.add('offline');
    statusDot.title = 'Disconnected - Backend not running';
    console.log('Backend status check failed:', error.message);
  }
}

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
          
          // Check if limit reached
          if (stats.remaining !== null && stats.remaining <= 0) {
            showLimitAlert(true);
          }
        } else {
          // Token might be expired
          await chrome.storage.local.remove(['authToken', 'userInfo']);
          showView('anonymous');
          await checkAnonymousStats();
        }
      } catch (e) {
        // Use cached info
        updateDashboard(userInfo);
        showView('dashboard');
      }
    } else {
      // Anonymous user - get stats from backend
      showView('anonymous');
      await checkAnonymousStats();
    }
  } catch (error) {
    console.error('Auth check error:', error);
    showView('anonymous');
  }
  
  showLoading(false);
}

// Check anonymous usage stats from backend
async function checkAnonymousStats() {
  try {
    const response = await fetch('http://127.0.0.1:5000/anonymous/stats', {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    
    if (response.ok) {
      const data = await response.json();
      const remaining = data.remaining || (3 - (data.upload_count || 0));
      updateAnonymousView(remaining);
      
      if (remaining <= 0) {
        showLimitAlert(true);
      }
    } else {
      // Fallback to local storage
      const { anonymousUploads } = await chrome.storage.local.get('anonymousUploads');
      updateAnonymousView(3 - (anonymousUploads || 0));
    }
  } catch (e) {
    // Fallback to local storage if backend is down
    const { anonymousUploads } = await chrome.storage.local.get('anonymousUploads');
    updateAnonymousView(3 - (anonymousUploads || 0));
  }
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

// Show limit alert
function showLimitAlert(show) {
  limitAlert.classList.toggle('show', show);
}

// Show message
function showMessage(text, type = 'error') {
  const icon = type === 'error' 
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
  
  message.innerHTML = `${icon}<span>${text}</span>`;
  message.className = `message ${type}`;
  message.style.display = 'flex';
  
  setTimeout(() => {
    message.style.display = 'none';
  }, 5000);
}

// Update anonymous view
function updateAnonymousView(remaining) {
  const total = 3;
  document.getElementById('anonRemaining').textContent = Math.max(0, remaining);
  
  const progressFill = document.getElementById('anonProgress');
  const percentage = Math.max(0, (remaining / total) * 100);
  progressFill.style.width = `${percentage}%`;
  
  // Update progress color based on remaining
  progressFill.classList.remove('low', 'empty');
  if (remaining <= 0) {
    progressFill.classList.add('empty');
  } else if (remaining === 1) {
    progressFill.classList.add('low');
  }
}

// Handle login
async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');
  
  if (!username || !password) {
    showMessage('Please enter username and password');
    return;
  }
  
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;margin:0;"></div> Signing in...';
  
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
      showLimitAlert(false);
      updateDashboard({
        username,
        tier: result.tier,
        upload_count: result.upload_count,
        upload_limit: result.upload_limit,
        remaining: result.upload_limit - result.upload_count
      });
      showView('dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage('Connection failed. Is the server running?');
  }
  
  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Sign In';
}

// Handle registration
async function handleRegister(event) {
  event.preventDefault();
  
  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const btn = document.getElementById('registerBtn');
  
  if (!username || !email || !password) {
    showMessage('Please fill in all fields');
    return;
  }
  
  if (password.length < 6) {
    showMessage('Password must be at least 6 characters');
    return;
  }
  
  // Basic email validation
  if (!email.includes('@') || !email.includes('.')) {
    showMessage('Please enter a valid email');
    return;
  }
  
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;margin:0;"></div> Creating...';
  
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'register',
      username,
      email,
      password
    });
    
    if (result.error) {
      showMessage(result.error);
    } else {
      showMessage('Account created! Please sign in.', 'success');
      showView('login');
      document.getElementById('loginUsername').value = username;
      document.getElementById('loginPassword').focus();
    }
  } catch (error) {
    console.error('Register error:', error);
    showMessage('Connection failed. Is the server running?');
  }
  
  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg> Create Account';
}

// Handle logout
async function handleLogout() {
  await chrome.runtime.sendMessage({ action: 'logout' });
  showView('anonymous');
  showMessage('Signed out successfully', 'success');
  
  // Reset anonymous view
  updateAnonymousView(3);
}

// Update dashboard with user info
function updateDashboard(info) {
  document.getElementById('userName').textContent = info.username || 'User';
  
  const tier = info.tier || 'free';
  document.getElementById('userTier').textContent = tier.charAt(0).toUpperCase() + tier.slice(1).replace('_', ' ') + ' Account';
  
  const tierBadge = document.getElementById('tierBadge');
  tierBadge.textContent = tier.toUpperCase().replace('_', ' ');
  tierBadge.classList.toggle('pro', tier !== 'free');
  
  const uploadLimit = info.upload_limit || 8;
  const uploadCount = info.upload_count || 0;
  const remaining = info.remaining !== undefined ? info.remaining : (uploadLimit - uploadCount);
  
  document.getElementById('remainingCount').textContent = remaining;
  document.getElementById('totalLimit').textContent = uploadLimit;
  
  // Update progress bar
  const progressFill = document.getElementById('progressFill');
  const percentage = Math.max(0, (remaining / uploadLimit) * 100);
  progressFill.style.width = `${percentage}%`;
  
  // Update progress color based on remaining
  progressFill.classList.remove('low', 'empty');
  if (remaining <= 0) {
    progressFill.classList.add('empty');
  } else if (remaining <= 2) {
    progressFill.classList.add('low');
  }
  
  // Show limit alert if needed
  if (remaining <= 0) {
    showLimitAlert(true);
    document.querySelector('#limitAlert .limit-alert-text p').textContent = 'Upgrade your account to get more scans!';
  }
}
