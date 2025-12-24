/**
 * Add to Cart Helper
 * Used across all product pages to add items to cart
 */

async function addToCart(productId, quantity = 1, product = {}) {
  // Get product data if not provided
  if (!product.name) {
    try {
      const response = await fetch(`${window.API_BASE_URL || 'http://localhost:5000/api'}/products/${productId}`)
      const data = await response.json()
      if (data.success) {
        product = data.product
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    }
  }

  // Add to cart
  if (window.cartService) {
    const result = await cartService.addToBackendCart(productId, quantity, product)
    
    if (result.success || result.local) {
      showNotification(`${product.name || 'Product'} added to cart!`, 'success')
      
      // Update navbar
      if (window.navbarInstance && window.navbarInstance.updateCartCount) {
        window.navbarInstance.updateCartCount()
      }
      
      return true
    } else {
      showNotification(result.error || 'Failed to add to cart', 'danger')
      return false
    }
  }
}

/**
 * Show toast notification
 */
function showNotification(message, type = 'info') {
  const colors = {
    success: '#27ae60',
    danger: '#e74c3c',
    info: '#3498db',
    warning: '#f39c12'
  }
  
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${colors[type] || colors.info};
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
  `
  notification.textContent = message
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// Add animations
if (!document.querySelector('style[data-toast]')) {
  const style = document.createElement('style')
  style.setAttribute('data-toast', 'true')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
}
