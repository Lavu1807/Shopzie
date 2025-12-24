// ===========================
// API UTILITIES
// ===========================

const API_BASE_URL = localStorage.getItem('apiUrl') || 'http://localhost:5000/api';

/**
 * Make authenticated API requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    // Handle token expiration
    if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
      handleTokenExpired();
      return { success: false, error: 'Token expired' };
    }
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Request failed' };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * GET request
 */
async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
async function apiPost(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * PUT request
 */
async function apiPut(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request
 */
async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

/**
 * Handle token expiration
 */
function handleTokenExpired() {
  localStorage.clear();
  window.location.href = '/login.html';
}

// ===========================
// AUTH UTILITIES
// ===========================

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Get current token
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return !!getToken() && !!getCurrentUser();
}

/**
 * Get user role
 */
function getUserRole() {
  const user = getCurrentUser();
  return user?.role || null;
}

/**
 * Check if user is customer
 */
function isCustomer() {
  return getUserRole() === 'customer';
}

/**
 * Check if user is shopkeeper
 */
function isShopkeeper() {
  return getUserRole() === 'shopkeeper';
}

/**
 * Check if user is admin
 */
function isAdmin() {
  return getUserRole() === 'admin';
}

/**
 * Check if user has access to page
 */
function canAccessPage(requiredRole) {
  if (!isLoggedIn()) return false;
  if (requiredRole === 'any') return true;
  return getUserRole() === requiredRole;
}

/**
 * Redirect to login if not authenticated
 */
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
  }
}

/**
 * Redirect if not authorized
 */
function requireRole(role) {
  if (!canAccessPage(role)) {
    window.location.href = '/';
  }
}

// ===========================
// DOM UTILITIES
// ===========================

/**
 * Safe querySelector wrapper
 */
function el(selector) {
  return document.querySelector(selector);
}

/**
 * Safe querySelectorAll wrapper
 */
function elAll(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Get element by ID
 */
function byId(id) {
  return document.getElementById(id);
}

/**
 * Create element with attributes
 */
function createElement(tag, className = '', attributes = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

/**
 * Add event listener with delegation
 */
function on(selector, event, callback) {
  const element = typeof selector === 'string' ? el(selector) : selector;
  if (element) {
    element.addEventListener(event, callback);
  }
}

/**
 * Add click listener
 */
function onClick(selector, callback) {
  on(selector, 'click', callback);
}

/**
 * Show element
 */
function show(selector) {
  const element = typeof selector === 'string' ? el(selector) : selector;
  if (element) element.classList.remove('hidden');
}

/**
 * Hide element
 */
function hide(selector) {
  const element = typeof selector === 'string' ? el(selector) : selector;
  if (element) element.classList.add('hidden');
}

/**
 * Toggle visibility
 */
function toggle(selector) {
  const element = typeof selector === 'string' ? el(selector) : selector;
  if (element) element.classList.toggle('hidden');
}

/**
 * Add CSS class
 */
function addClass(selector, className) {
  const element = typeof selector === 'string' ? el(selector) : selector;
  if (element) element.classList.add(className);
}

/**
 * Remove CSS class
 */
function removeClass(selector, className) {
  const element = typeof selector === 'string' ? el(selector) : selector;
  if (element) element.classList.remove(className);
}

/**
 * Set text content
 */
function setText(selector, text) {
  const element = typeof selector === 'string' ? el(selector) : selector;
  if (element) element.textContent = text;
}

/**
 * Set HTML content
 */
function setHTML(selector, html) {
  const element = typeof selector === 'string' ? el(selector) : selector;
  if (element) element.innerHTML = html;
}

/**
 * Get form data as object
 */
function getFormData(formSelector) {
  const form = typeof formSelector === 'string' ? el(formSelector) : formSelector;
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  return data;
}

/**
 * Set form data from object
 */
function setFormData(formSelector, data) {
  const form = typeof formSelector === 'string' ? el(formSelector) : formSelector;
  Object.entries(data).forEach(([key, value]) => {
    const field = form.elements[key];
    if (field) field.value = value;
  });
}

/**
 * Clear form
 */
function clearForm(formSelector) {
  const form = typeof formSelector === 'string' ? el(formSelector) : formSelector;
  form.reset();
}

/**
 * Show loading spinner
 */
function showLoading(selector) {
  const element = typeof selector === 'string' ? el(selector) : selector;
  if (element) {
    element.innerHTML = '<div class="spinner"></div>';
    show(element);
  }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
  const alertId = `alert-${Date.now()}`;
  const alertHTML = `
    <div class="alert alert-${type}" id="${alertId}">
      <span>${message}</span>
      <button class="alert-close" onclick="this.parentElement.remove();">&times;</button>
    </div>
  `;
  
  const alertContainer = el('.alerts-container');
  if (alertContainer) {
    alertContainer.insertAdjacentHTML('beforeend', alertHTML);
    setTimeout(() => {
      const alert = byId(alertId);
      if (alert) alert.remove();
    }, 5000);
  }
}

/**
 * Confirm dialog
 */
function confirm(message) {
  return window.confirm(message);
}

// ===========================
// FORMATTING UTILITIES
// ===========================

/**
 * Format price
 */
function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Format date
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time
 */
function formatDateTime(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text
 */
function truncate(text, length = 100) {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Slugify text
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ===========================
// STORAGE UTILITIES
// ===========================

/**
 * Storage management object
 */
const Storage = {
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  
  get: (key) => {
    const value = localStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value;
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  },
};
