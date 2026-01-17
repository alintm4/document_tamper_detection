// Content script for Image Analyzer extension

// Track overlays by image URL
const overlays = new Map();

// Listen for messages from background script
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
  }
});

// Find the image element by URL
function findImageByUrl(url) {
  const images = document.querySelectorAll('img');
  for (const img of images) {
    if (img.src === url || img.currentSrc === url) {
      return img;
    }
  }
  return null;
}

// Create overlay container for an image
function createOverlayContainer(img) {
  // Remove existing overlay if any
  const existingOverlay = overlays.get(img.src);
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  // Create container
  const container = document.createElement('div');
  container.className = 'img-analyzer-overlay';
  
  // Position relative to image
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

// Show loading overlay
function showLoadingOverlay(imageUrl) {
  const img = findImageByUrl(imageUrl);
  if (!img) return;
  
  const container = createOverlayContainer(img);
  container.innerHTML = `
    <div class="img-analyzer-loading">
      <div class="img-analyzer-spinner"></div>
      <span>Analyzing...</span>
    </div>
  `;
}

// Show result overlay
function showResultOverlay(imageUrl, result) {
  const img = findImageByUrl(imageUrl);
  if (!img) {
    showNotification(result);
    return;
  }
  
  const container = createOverlayContainer(img);
  container.style.pointerEvents = 'auto';
  
  let statusClass = 'success';
  let statusIcon = '✓';
  let statusText = 'Analyzed';
  
  if (result.status === 'duplicate') {
    statusClass = 'warning';
    statusIcon = '⚠';
    statusText = 'Duplicate';
  } else if (result.status === 'similar') {
    statusClass = 'info';
    statusIcon = '≈';
    statusText = 'Similar Found';
  } else if (result.status === 'manipulated') {
    statusClass = 'danger';
    statusIcon = '✗';
    statusText = 'Manipulated';
  }
  
  container.innerHTML = `
    <div class="img-analyzer-result ${statusClass}">
      <div class="img-analyzer-badge">
        <span class="img-analyzer-icon">${statusIcon}</span>
        <span class="img-analyzer-status">${statusText}</span>
      </div>
      <div class="img-analyzer-details">
        <p>${result.message}</p>
        ${result.image_hash ? `<small>Hash: ${result.image_hash.substring(0, 12)}...</small>` : ''}
        ${result.similarity_score ? `<small>Similarity: ${result.similarity_score}/10</small>` : ''}
        ${result.remaining_uploads !== undefined ? `<small>Uploads left: ${result.remaining_uploads}</small>` : ''}
      </div>
      <button class="img-analyzer-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (container.parentElement) {
      container.classList.add('fade-out');
      setTimeout(() => container.remove(), 300);
    }
  }, 10000);
}

// Show error overlay
function showErrorOverlay(imageUrl, error) {
  const img = findImageByUrl(imageUrl);
  if (!img) {
    showNotification({ status: 'error', message: error });
    return;
  }
  
  const container = createOverlayContainer(img);
  container.style.pointerEvents = 'auto';
  
  container.innerHTML = `
    <div class="img-analyzer-result error">
      <div class="img-analyzer-badge">
        <span class="img-analyzer-icon">✗</span>
        <span class="img-analyzer-status">Error</span>
      </div>
      <div class="img-analyzer-details">
        <p>${error}</p>
      </div>
      <button class="img-analyzer-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (container.parentElement) {
      container.classList.add('fade-out');
      setTimeout(() => container.remove(), 300);
    }
  }, 5000);
}

// Show notification toast
function showNotification(result) {
  // Remove existing notification
  const existing = document.querySelector('.img-analyzer-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'img-analyzer-toast';
  
  let statusClass = 'success';
  if (result.status === 'duplicate' || result.status === 'similar') {
    statusClass = 'warning';
  } else if (result.status === 'error') {
    statusClass = 'error';
  }
  
  toast.innerHTML = `
    <div class="img-analyzer-toast-content ${statusClass}">
      <strong>Image Analyzer</strong>
      <p>${result.message}</p>
      ${result.remaining_uploads !== undefined ? `<small>Uploads remaining: ${result.remaining_uploads}</small>` : ''}
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Update overlay positions on scroll/resize
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

window.addEventListener('scroll', updateOverlayPositions);
window.addEventListener('resize', updateOverlayPositions);
