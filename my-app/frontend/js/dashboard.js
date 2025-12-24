let currentUser = null
let editingProductId = null

// Declare variables before using them
const requireAuth = () => true // Example implementation
const getUser = () => ({ role: "shopkeeper" }) // Example implementation
const isShopkeeper = () => currentUser.role === "shopkeeper" // Example implementation
const apiRequest = async (endpoint) => {
  // Example implementation
  return { products: [], orders: [] }
}
const API_ENDPOINTS = {
  MY_PRODUCTS: "/my-products",
  PRODUCTS: "/products",
  MY_ORDERS: "/my-orders",
  RECEIVED_ORDERS: "/received-orders",
}
const getImageUrl = (image) => (image ? image.url : "/diverse-products-still-life.png") // Example implementation
const formatPrice = (price) => `$${price.toFixed(2)}` // Example implementation
const apiRequestWithFiles = async (endpoint, formData) => {
  // Example implementation
}
const showAlert = (container, message, type) => {
  // Example implementation
}
const formatDate = (date) => new Date(date).toLocaleDateString() // Example implementation

// Initialize dashboard
async function initDashboard() {
  if (!requireAuth()) return

  currentUser = getUser()

  if (isShopkeeper()) {
    initShopkeeperDashboard()
  } else {
    initCustomerDashboard()
  }
}

// Shopkeeper dashboard
async function initShopkeeperDashboard() {
  document.getElementById("dashboardTitle").textContent = "Shopkeeper Dashboard"
  document.getElementById("addProductBtn").classList.remove("hidden")
  document.getElementById("statsSection").classList.remove("hidden")
  document.getElementById("productsSection").classList.remove("hidden")

  loadMyProducts()
  loadReceivedOrders()
}

// Customer dashboard
async function initCustomerDashboard() {
  document.getElementById("dashboardTitle").textContent = "My Orders"
  document.getElementById("ordersTitle").textContent = "Order History"
  loadMyOrders()
}

// Load shopkeeper's products
async function loadMyProducts() {
  try {
    const data = await apiRequest(API_ENDPOINTS.MY_PRODUCTS)

    if (data.products.length > 0) {
      document.getElementById("noProducts").classList.add("hidden")
      renderMyProducts(data.products)

      // Update stats
      renderStats(data.products)
    } else {
      document.getElementById("noProducts").classList.remove("hidden")
    }
  } catch (error) {
    console.error("Error loading products:", error)
  }
}

// Render stats
function renderStats(products) {
  const statsSection = document.getElementById("statsSection")
  const totalProducts = products.length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const activeProducts = products.filter((p) => p.isActive).length

  statsSection.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalProducts}</div>
            <div class="stat-label">Total Products</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${activeProducts}</div>
            <div class="stat-label">Active Products</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalStock}</div>
            <div class="stat-label">Total Stock</div>
        </div>
    `
}

// Render my products
function renderMyProducts(products) {
  const grid = document.getElementById("myProductsGrid")
  grid.innerHTML = ""

  products.forEach((product) => {
    const card = createMyProductCard(product)
    grid.appendChild(card)
  })
}

// Create product card for shopkeeper
function createMyProductCard(product) {
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
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">Stock: ${product.stock}</p>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-primary btn-small" onclick="editProduct('${product._id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteProduct('${product._id}')">Delete</button>
            </div>
        </div>
    `

  return card
}

// Product modal
document.addEventListener("DOMContentLoaded", () => {
  initDashboard()

  const addProductBtn = document.getElementById("addProductBtn")
  const productModal = document.getElementById("productModal")
  const closeModal = document.getElementById("closeModal")
  const productForm = document.getElementById("productForm")
  const alertContainer = document.getElementById("alertContainer")

  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      editingProductId = null
      document.getElementById("modalTitle").textContent = "Add New Product"
      document.getElementById("submitBtnText").textContent = "Add Product"
      productForm.reset()
      productModal.classList.add("active")
    })
  }

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      productModal.classList.remove("active")
    })
  }

  if (productModal) {
    productModal.addEventListener("click", (e) => {
      if (e.target === productModal) {
        productModal.classList.remove("active")
      }
    })
  }

  if (productForm) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = new FormData()
      formData.append("name", document.getElementById("productName").value)
      formData.append("description", document.getElementById("productDescription").value)
      formData.append("price", document.getElementById("productPrice").value)
      formData.append("stock", document.getElementById("productStock").value)
      formData.append("category", document.getElementById("productCategory").value)

      const images = document.getElementById("productImages").files
      for (let i = 0; i < images.length && i < 5; i++) {
        formData.append("images", images[i])
      }

      try {
        if (editingProductId) {
          // Update product
          await apiRequestWithFiles(`${API_ENDPOINTS.PRODUCTS}/${editingProductId}`, formData)
          showAlert(alertContainer, "Product updated successfully!", "success")
        } else {
          // Create product
          await apiRequestWithFiles(API_ENDPOINTS.PRODUCTS, formData)
          showAlert(alertContainer, "Product added successfully!", "success")
        }

        productModal.classList.remove("active")
        loadMyProducts()
      } catch (error) {
        showAlert(alertContainer, error.message || "Failed to save product", "error")
      }
    })
  }
})

// Edit product
async function editProduct(productId) {
  editingProductId = productId

  try {
    const data = await apiRequest(`${API_ENDPOINTS.PRODUCTS}/${productId}`)
    const product = data.product

    document.getElementById("modalTitle").textContent = "Edit Product"
    document.getElementById("submitBtnText").textContent = "Update Product"
    document.getElementById("productName").value = product.name
    document.getElementById("productDescription").value = product.description
    document.getElementById("productPrice").value = product.price
    document.getElementById("productStock").value = product.stock
    document.getElementById("productCategory").value = product.category

    document.getElementById("productModal").classList.add("active")
  } catch (error) {
    alert(error.message || "Failed to load product")
  }
}

// Delete product
async function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return

  try {
    await apiRequest(`${API_ENDPOINTS.PRODUCTS}/${productId}`, {
      method: "DELETE",
    })

    const alertContainer = document.getElementById("alertContainer")
    showAlert(alertContainer, "Product deleted successfully!", "success")
    loadMyProducts()
  } catch (error) {
    alert(error.message || "Failed to delete product")
  }
}

// Load customer orders
async function loadMyOrders() {
  try {
    const data = await apiRequest(API_ENDPOINTS.MY_ORDERS)

    if (data.orders.length > 0) {
      document.getElementById("noOrders").classList.add("hidden")
      renderOrders(data.orders)
    } else {
      document.getElementById("noOrders").classList.remove("hidden")
    }
  } catch (error) {
    console.error("Error loading orders:", error)
  }
}

// Load received orders (shopkeeper)
async function loadReceivedOrders() {
  try {
    const data = await apiRequest(API_ENDPOINTS.RECEIVED_ORDERS)

    if (data.orders.length > 0) {
      document.getElementById("noOrders").classList.add("hidden")
      renderOrders(data.orders)
    } else {
      document.getElementById("noOrders").classList.remove("hidden")
    }
  } catch (error) {
    console.error("Error loading orders:", error)
  }
}

// Render orders
function renderOrders(orders) {
  const container = document.getElementById("ordersContainer")
  container.innerHTML = ""

  orders.forEach((order) => {
    const orderCard = createOrderCard(order)
    container.appendChild(orderCard)
  })
}

// Create order card
function createOrderCard(order) {
  const card = document.createElement("div")
  card.style.cssText = "background-color: var(--surface); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;"

  const statusColor =
    order.orderStatus === "Delivered"
      ? "var(--success)"
      : order.orderStatus === "Cancelled"
        ? "var(--error)"
        : "var(--accent)"

  card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <div>
                <h3 style="margin-bottom: 0.5rem;">Order #${order.orderNumber}</h3>
                <p style="color: var(--text-secondary); font-size: 0.875rem;">${formatDate(order.createdAt)}</p>
            </div>
            <span style="background-color: ${statusColor}; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">
                ${order.orderStatus}
            </span>
        </div>
        <div style="border-top: 1px solid var(--border); padding-top: 1rem;">
            <p style="font-weight: 600; margin-bottom: 0.5rem;">Items: ${order.totalItems}</p>
            <p style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">Total: ${formatPrice(order.totalAmount)}</p>
        </div>
    `

  return card
}
