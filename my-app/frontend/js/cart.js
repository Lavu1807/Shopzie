let currentCart = null

// Declare required variables and functions
const API_ENDPOINTS = {
  CART: "/api/cart",
  CART_UPDATE: "/api/cart/update",
  CART_REMOVE: "/api/cart/remove",
  ORDERS: "/api/orders",
}

function requireAuth() {
  // Placeholder for authentication check
  return true
}

async function apiRequest(url, options = {}) {
  // Placeholder for API request logic
  const response = await fetch(url, options)
  return response.json()
}

function updateCartBadge(totalItems) {
  // Placeholder for updating cart badge logic
  document.getElementById("cartBadge").textContent = totalItems
}

function getImageUrl(image) {
  // Placeholder for getting image URL logic
  return image ? image.url : "/diverse-products-still-life.png"
}

function formatPrice(price) {
  // Placeholder for formatting price logic
  return `$${price.toFixed(2)}`
}

function showAlert(container, message, type) {
  // Placeholder for showing alert logic
  const alertEl = document.createElement("div")
  alertEl.className = `alert ${type}`
  alertEl.textContent = message
  container.appendChild(alertEl)

  setTimeout(() => {
    container.removeChild(alertEl)
  }, 3000)
}

// Load cart
async function loadCart() {
  if (!requireAuth()) return

  const loadingSpinner = document.getElementById("loadingSpinner")
  const cartContent = document.getElementById("cartContent")
  const cartItems = document.getElementById("cartItems")
  const emptyCart = document.getElementById("emptyCart")
  const orderSummary = document.getElementById("orderSummary")

  try {
    loadingSpinner.classList.remove("hidden")

    const data = await apiRequest(API_ENDPOINTS.CART)
    currentCart = data.cart

    loadingSpinner.classList.add("hidden")
    cartContent.classList.remove("hidden")

    if (currentCart.items.length === 0) {
      cartItems.innerHTML = ""
      emptyCart.classList.remove("hidden")
      orderSummary.classList.add("hidden")
    } else {
      emptyCart.classList.add("hidden")
      orderSummary.classList.remove("hidden")
      renderCartItems()
      updateOrderSummary()
    }

    updateCartBadge(currentCart.totalItems)
  } catch (error) {
    console.error("Error loading cart:", error)
    loadingSpinner.classList.add("hidden")
  }
}

// Render cart items
function renderCartItems() {
  const cartItemsContainer = document.getElementById("cartItems")
  cartItemsContainer.innerHTML = ""

  currentCart.items.forEach((item) => {
    const cartItemEl = createCartItem(item)
    cartItemsContainer.appendChild(cartItemEl)
  })
}

// Create cart item element
function createCartItem(item) {
  const div = document.createElement("div")
  div.className = "cart-item"

  const imageUrl =
    item.product.images && item.product.images.length > 0 ? getImageUrl(item.product.images[0]) : getImageUrl(null)

  div.innerHTML = `
        <img src="${imageUrl}" alt="${item.product.name}" class="cart-item-image" onerror="this.src='/diverse-products-still-life.png'">
        <div class="cart-item-info">
            <h3 class="cart-item-name">${item.product.name}</h3>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        <div class="cart-item-actions">
            <div class="quantity-control">
                <button class="quantity-btn" onclick="updateQuantity('${item.product._id}', ${item.quantity - 1})">-</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.product._id}', ${item.quantity + 1})">+</button>
            </div>
            <button class="btn btn-danger btn-small" onclick="removeFromCart('${item.product._id}')">Remove</button>
        </div>
    `

  return div
}

// Update quantity
async function updateQuantity(productId, newQuantity) {
  if (newQuantity < 1) return

  try {
    const data = await apiRequest(API_ENDPOINTS.CART_UPDATE, {
      method: "PUT",
      body: JSON.stringify({ productId, quantity: newQuantity }),
    })

    currentCart = data.cart
    renderCartItems()
    updateOrderSummary()
    updateCartBadge(currentCart.totalItems)
  } catch (error) {
    alert(error.message || "Failed to update quantity")
  }
}

// Remove from cart
async function removeFromCart(productId) {
  try {
    const data = await apiRequest(`${API_ENDPOINTS.CART_REMOVE}/${productId}`, {
      method: "DELETE",
    })

    currentCart = data.cart
    loadCart() // Reload cart to update UI
  } catch (error) {
    alert(error.message || "Failed to remove item")
  }
}

// Update order summary
function updateOrderSummary() {
  document.getElementById("totalItems").textContent = currentCart.totalItems
  document.getElementById("totalPrice").textContent = formatPrice(currentCart.totalPrice)
}

// Checkout modal
document.addEventListener("DOMContentLoaded", () => {
  loadCart()

  const checkoutBtn = document.getElementById("checkoutBtn")
  const checkoutModal = document.getElementById("checkoutModal")
  const closeModal = document.getElementById("closeModal")
  const checkoutForm = document.getElementById("checkoutForm")
  const alertContainer = document.getElementById("alertContainer")

  checkoutBtn.addEventListener("click", () => {
    checkoutModal.classList.add("active")
  })

  closeModal.addEventListener("click", () => {
    checkoutModal.classList.remove("active")
  })

  checkoutModal.addEventListener("click", (e) => {
    if (e.target === checkoutModal) {
      checkoutModal.classList.remove("active")
    }
  })

  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const formData = new FormData(checkoutForm)
    const orderData = {
      shippingAddress: {
        street: formData.get("street"),
        city: formData.get("city"),
        state: formData.get("state"),
        zipCode: formData.get("zipCode"),
        country: formData.get("country"),
      },
      paymentMethod: formData.get("paymentMethod"),
      notes: formData.get("notes"),
    }

    try {
      await apiRequest(API_ENDPOINTS.ORDERS, {
        method: "POST",
        body: JSON.stringify(orderData),
      })

      showAlert(alertContainer, "Order placed successfully!", "success")
      checkoutModal.classList.remove("active")

      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 2000)
    } catch (error) {
      showAlert(alertContainer, error.message || "Failed to place order", "error")
    }
  })
})
