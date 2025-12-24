const API_ENDPOINTS = {
  PRODUCTS: "/api/products",
  CART_ADD: "/api/cart/add",
  CART: "/api/cart",
}

const apiRequest = async (url, options = {}) => {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

const getImageUrl = (image) => {
  return image ? image.url : "/diverse-products-still-life.png"
}

const formatPrice = (price) => {
  return `$${price.toFixed(2)}`
}

const isAuthenticated = () => {
  return localStorage.getItem("token") !== null
}

const currentPage = 1
let currentFilters = {}

// Load products
async function loadProducts() {
  const loadingSpinner = document.getElementById("loadingSpinner")
  const productsGrid = document.getElementById("productsGrid")
  const emptyState = document.getElementById("emptyState")

  try {
    loadingSpinner.classList.remove("hidden")
    productsGrid.classList.add("hidden")
    emptyState.classList.add("hidden")

    // Build query string
    const queryParams = new URLSearchParams(currentFilters)
    const url = `${API_ENDPOINTS.PRODUCTS}?${queryParams}`

    const data = await apiRequest(url)

    loadingSpinner.classList.add("hidden")

    if (data.products && data.products.length > 0) {
      productsGrid.classList.remove("hidden")
      renderProducts(data.products)
    } else {
      emptyState.classList.remove("hidden")
    }
  } catch (error) {
    loadingSpinner.classList.add("hidden")
    emptyState.classList.remove("hidden")
    console.error("Error loading products:", error)
  }
}

// Render products
function renderProducts(products) {
  const productsGrid = document.getElementById("productsGrid")
  productsGrid.innerHTML = ""

  products.forEach((product) => {
    const productCard = createProductCard(product)
    productsGrid.appendChild(productCard)
  })
}

// Create product card
function createProductCard(product) {
  const card = document.createElement("div")
  card.className = "product-card"

  const imageUrl = product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : getImageUrl(null)

  card.innerHTML = `
        <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='/diverse-products-still-life.png'">
        <div class="product-info">
            <span class="product-category">${product.category}</span>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">${formatPrice(product.price)}</div>
            <button class="btn btn-primary" onclick="addToCart('${product._id}', ${product.price})">
                Add to Cart
            </button>
        </div>
    `

  return card
}

// Add to cart
async function addToCart(productId, price) {
  if (!isAuthenticated()) {
    window.location.href = "login.html"
    return
  }

  try {
    const data = await apiRequest(API_ENDPOINTS.CART_ADD, {
      method: "POST",
      body: JSON.stringify({ productId, quantity: 1 }),
    })

    // Update cart badge
    updateCartBadge(data.cart.totalItems)

    // Show success message
    alert("Product added to cart!")
  } catch (error) {
    alert(error.message || "Failed to add product to cart")
  }
}

// Update cart badge
function updateCartBadge(count) {
  const cartBadge = document.getElementById("cartBadge")
  if (cartBadge) {
    if (count > 0) {
      cartBadge.textContent = count
      cartBadge.classList.remove("hidden")
    } else {
      cartBadge.classList.add("hidden")
    }
  }
}

// Load cart count
async function loadCartCount() {
  if (!isAuthenticated()) return

  try {
    const data = await apiRequest(API_ENDPOINTS.CART)
    updateCartBadge(data.cart.totalItems)
  } catch (error) {
    console.error("Error loading cart count:", error)
  }
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadProducts()
  loadCartCount()

  // Search and filter
  const searchInput = document.getElementById("searchInput")
  const categoryFilter = document.getElementById("categoryFilter")
  const filterBtn = document.getElementById("filterBtn")

  filterBtn.addEventListener("click", () => {
    currentFilters = {}

    if (searchInput.value.trim()) {
      currentFilters.search = searchInput.value.trim()
    }

    if (categoryFilter.value) {
      currentFilters.category = categoryFilter.value
    }

    loadProducts()
  })

  // Enter key on search
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      filterBtn.click()
    }
  })
})
