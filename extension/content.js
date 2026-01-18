// Content script for Proofly extension

// Track overlays and buttons
const overlays = new Map();
const hoverButtons = new Map();
let selectionMode = false;
let selectionOverlay = null;

// Minimum image size to show check button
const MIN_IMAGE_SIZE = 50;

// Listen for auth messages from the web app (localhost:3000)
window.addEventListener('message', async (event) => {
  // Only accept messages from Proofly web app
  if (event.origin !== 'http://localhost:3000' && event.origin !== 'https://proofly.xyz') {
    return;
  }
  
  if (event.data && event.data.type === 'PROOFLY_AUTH') {
    // Forward auth event to background script
    try {
      chrome.runtime.sendMessage({
        action: 'syncAuth',
        authAction: event.data.action,
        token: event.data.token,
        userInfo: event.data.userInfo
      });
    } catch (e) {
      console.log('Proofly: Extension context invalidated');
    }
  }
});

// Check for existing session when content script loads on Proofly site
if (window.location.hostname === 'localhost' && window.location.port === '3000' || 
    window.location.hostname === 'proofly.xyz') {
  // Try to read token from localStorage and sync to extension
  setTimeout(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const userInfo = JSON.parse(userStr);
        chrome.runtime.sendMessage({
          action: 'syncAuth',
          authAction: 'login',
          token: token,
          userInfo: userInfo
        }, () => {
          if (chrome.runtime.lastError) {
            console.log('Proofly: Extension context invalidated');
          }
        });
      } catch (e) {
        console.log('Proofly: Could not sync session', e);
      }
    }
  }, 500);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Add hover buttons to existing images
  addHoverButtonsToImages();
  
  // Watch for new images
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'IMG') {
          addHoverButton(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll('img').forEach(addHoverButton);
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}


function addHoverButtonsToImages() {
  document.querySelectorAll('img').forEach(addHoverButton);
}

function addHoverButton(img) {
 
  if (hoverButtons.has(img) || img.width < MIN_IMAGE_SIZE || img.height < MIN_IMAGE_SIZE) {
    return;
  }
  

  if (!img.complete) {
    img.addEventListener('load', () => addHoverButton(img));
    return;
  }
  
  
  const btnContainer = document.createElement('div');
  btnContainer.className = 'proofly-hover-container';
  
  btnContainer.innerHTML = `
    <button class="proofly-check-btn" title="Check with Proofly">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
      <span>Check</span>
    </button>
  `;
  
  
  const updatePosition = () => {
    const rect = img.getBoundingClientRect();
    if (rect.width < MIN_IMAGE_SIZE || rect.height < MIN_IMAGE_SIZE) {
      btnContainer.style.display = 'none';
      return;
    }
    btnContainer.style.display = '';
    btnContainer.style.top = `${rect.top + window.scrollY + 8}px`;
    btnContainer.style.left = `${rect.right + window.scrollX - 85}px`;
  };
  
 
  img.addEventListener('mouseenter', () => {
    updatePosition();
    btnContainer.classList.add('visible');
  });
  
  img.addEventListener('mouseleave', (e) => {
    if (!btnContainer.contains(e.relatedTarget)) {
      btnContainer.classList.remove('visible');
    }
  });
  
  btnContainer.addEventListener('mouseleave', (e) => {
    if (e.relatedTarget !== img) {
      btnContainer.classList.remove('visible');
    }
  });
  

  btnContainer.querySelector('.proofly-check-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const btn = btnContainer.querySelector('.proofly-check-btn');
    btn.classList.add('loading');
    btn.innerHTML = `
      <div class="proofly-btn-spinner"></div>
      <span>Checking...</span>
    `;
    
    try {
      chrome.runtime.sendMessage({
        action: 'analyzeFromContent',
        imageUrl: img.src
      }, (result) => {
        if (chrome.runtime.lastError) {
          console.log('Proofly: Extension context invalidated, please refresh the page');
          btn.classList.remove('loading');
          btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span>Check</span>
          `;
          return;
        }
        btn.classList.remove('loading');
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span>Check</span>
        `;
        
        if (result) {
          showResultOverlay(img.src, result);
        }
      });
    } catch (error) {
      console.log('Proofly: Extension context invalidated, please refresh the page');
      btn.classList.remove('loading');
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <span>Check</span>
      `;
    }
  });
  
  document.body.appendChild(btnContainer);
  hoverButtons.set(img, btnContainer);
  
  window.addEventListener('scroll', updatePosition, { passive: true });
  window.addEventListener('resize', updatePosition, { passive: true });
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'showLoading':
      showLoadingOverlay(message.imageUrl);
      break;
    case 'showResult':
      showResultOverlay(message.imageUrl, message.result);
      break;
    case 'showNotification':
      showNotification(message.result);
      break;
    case 'showError':
      showErrorOverlay(message.imageUrl, message.error);
      break;
    case 'startSelection':
      startRegionSelection();
      break;
    case 'clearWebsiteSession':
   
      if (window.location.hostname === 'localhost' || window.location.hostname === 'proofly.xyz') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
       
        if (window.location.pathname.includes('/dashboard') || window.location.pathname.includes('/history')) {
          window.location.href = '/login';
        }
      }
      break;
  }
});

// Start region selection mode
function startRegionSelection() {
  if (selectionMode) return;
  selectionMode = true;
  
  selectionOverlay = document.createElement('div');
  selectionOverlay.className = 'proofly-selection-overlay';
  selectionOverlay.innerHTML = `
    <div class="proofly-selection-hint">
      <div class="proofly-hint-icon">🎯</div>
      <span>Click and drag to select an area</span>
      <button class="proofly-cancel-btn">Cancel</button>
    </div>
    <div class="proofly-selection-box"></div>
  `;
  document.body.appendChild(selectionOverlay);
  
  const selectionBox = selectionOverlay.querySelector('.proofly-selection-box');
  let startX, startY, isSelecting = false;
  
  selectionOverlay.querySelector('.proofly-cancel-btn').addEventListener('click', cancelSelection);
  
  const escHandler = (e) => {
    if (e.key === 'Escape') cancelSelection();
  };
  document.addEventListener('keydown', escHandler);
  
  selectionOverlay.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('proofly-cancel-btn')) return;
    
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = '0';
    selectionBox.style.height = '0';
    selectionBox.style.display = 'block';
  });
  
  selectionOverlay.addEventListener('mousemove', (e) => {
    if (!isSelecting) return;
    
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    
    selectionBox.style.width = `${Math.abs(width)}px`;
    selectionBox.style.height = `${Math.abs(height)}px`;
    selectionBox.style.left = `${width < 0 ? e.clientX : startX}px`;
    selectionBox.style.top = `${height < 0 ? e.clientY : startY}px`;
  });
  
  selectionOverlay.addEventListener('mouseup', async (e) => {
    if (!isSelecting) return;
    isSelecting = false;
    
    const rect = selectionBox.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 20) {
      cancelSelection();
      return;
    }
    
    const imagesInSelection = [];
    document.querySelectorAll('img').forEach(img => {
      const imgRect = img.getBoundingClientRect();
      if (rectsOverlap(rect, imgRect) && img.width >= MIN_IMAGE_SIZE && img.height >= MIN_IMAGE_SIZE) {
        imagesInSelection.push(img);
      }
    });
    
    cancelSelection();
    
    if (imagesInSelection.length === 0) {
      showNotification({ status: 'error', message: 'No images found in selected area' });
    } else if (imagesInSelection.length === 1) {
      analyzeImage(imagesInSelection[0].src);
    } else {
      showNotification({ 
        status: 'info', 
        message: `Found ${imagesInSelection.length} images. Analyzing the largest one.`
      });
      const largest = imagesInSelection.reduce((a, b) => 
        (a.width * a.height) > (b.width * b.height) ? a : b
      );
      analyzeImage(largest.src);
    }
  });
  
  function cancelSelection() {
    selectionMode = false;
    document.removeEventListener('keydown', escHandler);
    if (selectionOverlay) {
      selectionOverlay.remove();
      selectionOverlay = null;
    }
  }
}

function rectsOverlap(rect1, rect2) {
  return !(rect1.right < rect2.left || 
           rect1.left > rect2.right || 
           rect1.bottom < rect2.top || 
           rect1.top > rect2.bottom);
}

function analyzeImage(imageUrl) {
  showLoadingOverlay(imageUrl);
  
  try {
    chrome.runtime.sendMessage({
      action: 'analyzeFromContent',
      imageUrl: imageUrl
    }, (result) => {
      if (chrome.runtime.lastError) {
        console.log('Proofly: Extension context invalidated, please refresh the page');
        return;
      }
      if (result) {
        showResultOverlay(imageUrl, result);
      }
    });
  } catch (e) {
    console.log('Proofly: Extension context invalidated, please refresh the page');
  }
}

function findImageByUrl(url) {
  const images = document.querySelectorAll('img');
  for (const img of images) {
    if (img.src === url || img.currentSrc === url) {
      return img;
    }
  }
  return null;
}

function createOverlayContainer(img) {
  const existingOverlay = overlays.get(img.src);
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  const container = document.createElement('div');
  container.className = 'proofly-overlay';
  
  const rect = img.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  container.style.cssText = `
    position: absolute;
    top: ${rect.top + scrollTop}px;
    left: ${rect.left + scrollLeft}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    pointer-events: none;
    z-index: 999999;
  `;
  
  document.body.appendChild(container);
  overlays.set(img.src, container);
  
  return container;
}

function showLoadingOverlay(imageUrl) {
  const img = findImageByUrl(imageUrl);
  if (!img) return;
  
  const container = createOverlayContainer(img);
  container.innerHTML = `
    <div class="proofly-loading">
      <div class="proofly-spinner"></div>
      <span>Analyzing...</span>
    </div>
  `;
}

function showResultOverlay(imageUrl, result) {
  const img = findImageByUrl(imageUrl);
  if (!img) {
    showNotification(result);
    return;
  }
  
  const container = createOverlayContainer(img);
  container.style.pointerEvents = 'auto';
  
  const ICONS = {
    authentic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>',
    fake: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>',
    gift: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="14" rx="2"/><path d="M12 8v14M3 12h18"/></svg>'
  };
  
  let statusClass = 'success';
  let statusIcon = ICONS.authentic;
  let statusText = 'Authentic';
  let statusMessage = 'This image appears to be genuine.';
  
  // Debug logging
  console.log('[Proofly] Result received:', result);
  console.log('[Proofly] is_manipulated:', result.is_manipulated, 'type:', typeof result.is_manipulated);
  
  // Check if image is manipulated (fake) - use truthy check to handle 0/1 or true/false
  const isManipulated = result.status === 'manipulated' || result.is_manipulated === true || result.is_manipulated === 1;
  
  if (isManipulated) {
    statusClass = 'danger';
    statusIcon = ICONS.fake;
    statusText = 'Potentially Fake';
    statusMessage = 'This image may have been manipulated.';
  } else if (result.status === 'success' && (result.is_manipulated === false || result.is_manipulated === 0)) {
    statusClass = 'success';
    statusIcon = ICONS.authentic;
    statusText = 'Authentic';
    statusMessage = 'This image appears to be genuine.';
  } else if (result.status === 'duplicate') {
    statusClass = 'warning';
    statusIcon = ICONS.warning;
    statusText = 'Duplicate';
    statusMessage = result.message || 'This image was found before.';
  } else if (result.status === 'similar') {
    statusClass = 'info';
    statusIcon = ICONS.info;
    statusText = 'Similar Found';
    statusMessage = result.message || 'A similar image was found.';
  } else if (result.status === 'limit_reached') {
    statusClass = 'warning';
    statusIcon = ICONS.gift;
    statusText = 'Limit Reached';
    statusMessage = result.message || 'You have reached your scan limit.';
    
    // Try to open the extension popup
    try {
      chrome.runtime.sendMessage({ action: 'openPopup' });
    } catch (e) {
      console.log('Could not open popup');
    }
  } else if (result.status === 'error') {
    statusClass = 'error';
    statusIcon = ICONS.error;
    statusText = 'Error';
    statusMessage = result.message || 'An error occurred.';
  }
  
  // If manipulated and has heatmap, show heatmap as image overlay
  const showHeatmapOverlay = isManipulated && result.heatmap_url;
  
  container.innerHTML = `
    <div class="proofly-result ${statusClass}">
      <div class="proofly-result-header">
        <div class="proofly-badge">
          <span class="proofly-icon">${statusIcon}</span>
          <span class="proofly-status">${statusText}</span>
        </div>
        <button class="proofly-close-btn" onclick="this.closest('.proofly-overlay').remove()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="proofly-result-body">
        <p class="proofly-result-message">${statusMessage}</p>
        ${result.remaining_uploads !== undefined && result.remaining_uploads !== 'unlimited' ? `<div class="proofly-meta proofly-remaining"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> <strong>${result.remaining_uploads}</strong> scans remaining</div>` : ''}
        ${result.status === 'limit_reached' ? `<button class="proofly-cta-btn" onclick="window.open('http://localhost:3000/signup', '_blank')">Get More Scans →</button>` : ''}
      </div>
    </div>
    ${showHeatmapOverlay ? `
      <div class="proofly-heatmap-overlay">
        <img src="${result.heatmap_url}" alt="Heatmap showing tampered regions" class="proofly-heatmap-full" />
        <div class="proofly-heatmap-badge">Tampering Detected</div>
      </div>
    ` : ''}
  `;
  
  setTimeout(() => {
    if (container.parentElement) {
      container.classList.add('fade-out');
      setTimeout(() => container.remove(), 300);
    }
  }, 8000);
}

function showErrorOverlay(imageUrl, error) {
  const img = findImageByUrl(imageUrl);
  if (!img) {
    showNotification({ status: 'error', message: error });
    return;
  }
  
  const container = createOverlayContainer(img);
  container.style.pointerEvents = 'auto';
  
  const errorIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>';
  container.innerHTML = `
    <div class="proofly-result error">
      <div class="proofly-result-header">
        <div class="proofly-badge">
          <span class="proofly-icon">${errorIcon}</span>
          <span class="proofly-status">Error</span>
        </div>
        <button class="proofly-close-btn" onclick="this.closest('.proofly-overlay').remove()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="proofly-result-body">
        <p>${error}</p>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    if (container.parentElement) {
      container.classList.add('fade-out');
      setTimeout(() => container.remove(), 300);
    }
  }, 5000);
}

function showNotification(result) {
  const existing = document.querySelector('.proofly-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'proofly-toast';
  
  const TOAST_ICONS = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>'
  };
  
  let statusClass = 'success';
  let icon = TOAST_ICONS.success;
  
  if (result.status === 'duplicate' || result.status === 'similar' || result.status === 'limit_reached') {
    statusClass = 'warning';
    icon = TOAST_ICONS.warning;
  } else if (result.status === 'error') {
    statusClass = 'error';
    icon = TOAST_ICONS.error;
  } else if (result.status === 'info') {
    statusClass = 'info';
    icon = TOAST_ICONS.info;
  }
  
  toast.innerHTML = `
    <div class="proofly-toast-content ${statusClass}">
      <div class="proofly-toast-icon">${icon}</div>
      <div class="proofly-toast-body">
        <strong>Proofly</strong>
        <p>${result.message}</p>
        ${result.signup_bonus ? `<small class="proofly-bonus"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="14" rx="2"/><path d="M12 8v14M3 12h18"/></svg> Sign up for +${result.signup_bonus} more!</small>` : ''}
      </div>
      <button class="proofly-toast-close" onclick="this.closest('.proofly-toast').remove()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

let updateTimeout;
function updateOverlayPositions() {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    overlays.forEach((container, url) => {
      const img = findImageByUrl(url);
      if (img) {
        const rect = img.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        container.style.top = `${rect.top + scrollTop}px`;
        container.style.left = `${rect.left + scrollLeft}px`;
        container.style.width = `${rect.width}px`;
        container.style.height = `${rect.height}px`;
      } else {
        container.remove();
        overlays.delete(url);
      }
    });
  }, 100);
}

window.addEventListener('scroll', updateOverlayPositions, { passive: true });
window.addEventListener('resize', updateOverlayPositions);
