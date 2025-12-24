/**
 * Cart Service - Manages shopping cart operations
 * Syncs between localStorage and backend API
 */

class CartService {
  constructor() {
    this.API_URL = window.API_BASE_URL || 'http://localhost:5000/api'
    this.CART_KEY = 'cart'
    this.SYNC_INTERVAL = 5000 // Auto-sync every 5 seconds
    this.initAutoSync()
  }

  /**
   * Initialize auto-sync between localStorage and backend
   */
  initAutoSync() {
    if (typeof window !== 'undefined') {
      // Auto-sync when page becomes visible
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.syncWithBackend()
        }
      })
    }
  }

  // ============ LOCAL STORAGE OPERATIONS ============

  /**
   * Get cart from localStorage
   * @returns {Array} Cart items array
   */
  getLocalCart() {
    const cart = localStorage.getItem(this.CART_KEY)
    return cart ? JSON.parse(cart) : []
  }

  /**
   * Save cart to localStorage
   * @param {Array} items - Cart items to save
   */
  saveLocalCart(items) {
    localStorage.setItem(this.CART_KEY, JSON.stringify(items))
    this.notifyCartChange()
  }

  /**
   * Clear local cart
   */
  clearLocalCart() {
    localStorage.removeItem(this.CART_KEY)
    this.notifyCartChange()
  }

  /**
   * Get cart count from localStorage
   * @returns {number} Total items in cart
   */
  getLocalCartCount() {
    const items = this.getLocalCart()
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  }

  /**
   * Get cart total from localStorage
   * @returns {number} Total price
   */
  getLocalCartTotal() {
    const items = this.getLocalCart()
    return items.reduce((sum, item) => {
      const price = item.discountPrice || item.price || 0
      return sum + (price * item.quantity)
    }, 0)
  }

  // ============ API OPERATIONS ============

  /**
   * Get cart from backend
   * @returns {Promise<Object>} Cart data with items
   */
  async getBackendCart() {
    try {
      const response = await fetch(`${this.API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.log('User not authenticated, using local cart')
          return { success: false, cart: null }
        }
        throw new Error('Failed to fetch cart')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching cart from backend:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Add item to cart via backend API
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add
   * @param {Object} product - Product data (name, price, etc)
   * @returns {Promise<Object>} Updated cart
   */
  async addToBackendCart(productId, quantity, product) {
    try {
      const token = localStorage.getItem('token')
      
      // If not authenticated, add to local cart only
      if (!token) {
        this.addToLocalCart(productId, quantity, product)
        return { success: true, local: true }
      }

      const response = await fetch(`${this.API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity: parseInt(quantity) || 1
        })
      })

      const data = await response.json()

      if (data.success) {
        // Sync backend cart to localStorage
        this.syncBackendToLocal(data.cart)
      } else {
        // Fall back to local cart if API fails
        this.addToLocalCart(productId, quantity, product)
      }

      return data
    } catch (error) {
      console.error('Error adding to backend cart:', error)
      // Fall back to local storage
      this.addToLocalCart(productId, quantity, product)
      return { success: false, local: true, error: error.message }
    }
  }

  /**
   * Update cart item quantity via backend
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart
   */
  async updateBackendCartItem(productId, quantity) {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        this.updateLocalCartItem(productId, quantity)
        return { success: true, local: true }
      }

      const response = await fetch(`${this.API_URL}/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity: parseInt(quantity)
        })
      })

      const data = await response.json()

      if (data.success) {
        this.syncBackendToLocal(data.cart)
      } else {
        this.updateLocalCartItem(productId, quantity)
      }

      return data
    } catch (error) {
      console.error('Error updating backend cart:', error)
      this.updateLocalCartItem(productId, quantity)
      return { success: false, local: true, error: error.message }
    }
  }

  /**
   * Remove item from cart via backend
   * @param {string} productId - Product ID to remove
   * @returns {Promise<Object>} Updated cart
   */
  async removeFromBackendCart(productId) {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        this.removeFromLocalCart(productId)
        return { success: true, local: true }
      }

      const response = await fetch(`${this.API_URL}/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        this.syncBackendToLocal(data.cart)
      } else {
        this.removeFromLocalCart(productId)
      }

      return data
    } catch (error) {
      console.error('Error removing from backend cart:', error)
      this.removeFromLocalCart(productId)
      return { success: false, local: true, error: error.message }
    }
  }

  /**
   * Clear cart via backend
   * @returns {Promise<Object>} Cleared cart
   */
  async clearBackendCart() {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        this.clearLocalCart()
        return { success: true, local: true }
      }

      const response = await fetch(`${this.API_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        this.clearLocalCart()
      }

      return data
    } catch (error) {
      console.error('Error clearing backend cart:', error)
      this.clearLocalCart()
      return { success: false, local: true, error: error.message }
    }
  }

  // ============ LOCAL CART OPERATIONS ============

  /**
   * Add item to local cart
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity
   * @param {Object} product - Product data
   */
  addToLocalCart(productId, quantity = 1, product = {}) {
    const items = this.getLocalCart()
    const existingIndex = items.findIndex(item => item.id === productId)

    if (existingIndex > -1) {
      // Update quantity if exists
      items[existingIndex].quantity += parseInt(quantity)
    } else {
      // Add new item
      items.push({
        id: productId,
        name: product.name || 'Unknown Product',
        price: product.price || 0,
        discountPrice: product.discountPrice || product.price || 0,
        image: product.image || product.images?.[0] || '📦',
        seller: product.seller || 'Unknown Seller',
        quantity: parseInt(quantity),
        stock: product.stock || 999,
        addedAt: new Date().toISOString()
      })
    }

    this.saveLocalCart(items)
  }

  /**
   * Update item quantity in local cart
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   */
  updateLocalCartItem(productId, quantity) {
    const items = this.getLocalCart()
    const item = items.find(item => item.id === productId)

    if (item) {
      item.quantity = Math.max(1, parseInt(quantity))
      this.saveLocalCart(items)
    }
  }

  /**
   * Remove item from local cart
   * @param {string} productId - Product ID
   */
  removeFromLocalCart(productId) {
    let items = this.getLocalCart()
    items = items.filter(item => item.id !== productId)
    this.saveLocalCart(items)
  }

  // ============ SYNC OPERATIONS ============

  /**
   * Sync backend cart to localStorage
   * @param {Object} backendCart - Cart from backend
   */
  syncBackendToLocal(backendCart) {
    if (!backendCart || !backendCart.items) return

    const localItems = backendCart.items.map(item => ({
      id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      discountPrice: item.product.price,
      image: item.product.images?.[0] || '📦',
      quantity: item.quantity,
      stock: item.product.stock,
      addedAt: new Date().toISOString()
    }))

    this.saveLocalCart(localItems)
  }

  /**
   * Sync local cart to backend
   * (Called on page load or when logging in)
   */
  async syncWithBackend() {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const localCart = this.getLocalCart()
      if (localCart.length === 0) return

      // Get backend cart
      const result = await this.getBackendCart()
      if (!result.success || !result.cart) return

      // Merge: Local cart items that aren't in backend
      for (const localItem of localCart) {
        const exists = result.cart.items.some(
          item => item.product._id === localItem.id
        )
        if (!exists) {
          await this.addToBackendCart(localItem.id, localItem.quantity, localItem)
        }
      }
    } catch (error) {
      console.error('Error syncing with backend:', error)
    }
  }

  /**
   * Notify app of cart changes (for updating navbar, etc)
   */
  notifyCartChange() {
    const event = new CustomEvent('cartUpdated', {
      detail: {
        count: this.getLocalCartCount(),
        total: this.getLocalCartTotal(),
        items: this.getLocalCart()
      }
    })
    window.dispatchEvent(event)

    // Update navbar if available
    if (window.navbarInstance && window.navbarInstance.updateCartCount) {
      window.navbarInstance.updateCartCount()
    }
  }

  // ============ CART CALCULATIONS ============

  /**
   * Calculate cart summary
   * @returns {Object} Summary with subtotal, tax, shipping, total
   */
  calculateSummary() {
    const items = this.getLocalCart()
    const subtotal = items.reduce((sum, item) => {
      const price = item.discountPrice || item.price
      return sum + (price * item.quantity)
    }, 0)

    // Calculate tax (10%)
    const tax = subtotal * 0.1

    // Free shipping for orders > $100
    const shipping = subtotal > 100 ? 0 : 10

    // Total
    const total = subtotal + tax + shipping

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    }
  }

  /**
   * Calculate savings (difference between original and discount prices)
   * @returns {number} Total savings
   */
  calculateSavings() {
    const items = this.getLocalCart()
    return items.reduce((sum, item) => {
      const savings = (item.price - item.discountPrice) * item.quantity
      return sum + savings
    }, 0)
  }

  /**
   * Validate cart (check stock, prices, etc)
   * @returns {Object} Validation result
   */
  async validateCart() {
    const items = this.getLocalCart()
    const errors = []
    const warnings = []

    for (const item of items) {
      // Check if quantity exceeds stock
      if (item.quantity > item.stock) {
        errors.push(`${item.name}: Only ${item.stock} in stock`)
      }

      // Check if item still exists in backend
      try {
        const response = await fetch(`${this.API_URL}/products/${item.id}`)
        const data = await response.json()
        
        if (!data.success || !data.product.isActive) {
          errors.push(`${item.name}: No longer available`)
        }
      } catch (error) {
        console.error(`Error validating ${item.name}:`, error)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Get cart as order data (for checkout)
   * @returns {Object} Order-ready cart data
   */
  getOrderData() {
    const items = this.getLocalCart()
    const summary = this.calculateSummary()

    return {
      items: items.map(item => ({
        product: item.id,
        quantity: item.quantity,
        price: item.discountPrice || item.price
      })),
      subtotal: summary.subtotal,
      tax: summary.tax,
      shipping: summary.shipping,
      totalAmount: summary.total,
      itemCount: summary.itemCount
    }
  }
}

// Initialize and export
const cartService = new CartService()
if (typeof module !== 'undefined' && module.exports) {
  module.exports = cartService
}
