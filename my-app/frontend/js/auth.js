const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
}

// Get token from localStorage
function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

// Set token in localStorage
function setToken(token) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)
}

// Remove token from localStorage
function removeToken() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
}

// Get user from localStorage
function getUser() {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER)
  return userStr ? JSON.parse(userStr) : null
}

// Set user in localStorage
function setUser(user) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getToken()
}

// Check if user is shopkeeper
function isShopkeeper() {
  const user = getUser()
  return user && user.role === "shopkeeper"
}

// Redirect if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "login.html"
    return false
  }
  return true
}

// Redirect if not shopkeeper
function requireShopkeeper() {
  if (!isAuthenticated() || !isShopkeeper()) {
    window.location.href = "index.html"
    return false
  }
  return true
}

// Update navbar based on auth status
function updateNavbar() {
  const authLinks = document.getElementById("authLinks")
  const userLinks = document.getElementById("userLinks")
  const dashboardLink = document.getElementById("dashboardLink")
  const logoutBtn = document.getElementById("logoutBtn")

  if (isAuthenticated()) {
    if (authLinks) authLinks.classList.add("hidden")
    if (userLinks) userLinks.classList.remove("hidden")

    if (isShopkeeper() && dashboardLink) {
      dashboardLink.classList.remove("hidden")
    }

    // Logout handler
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault()
        removeToken()
        window.location.href = "index.html"
      })
    }
  } else {
    if (authLinks) authLinks.classList.remove("hidden")
    if (userLinks) userLinks.classList.add("hidden")
    if (dashboardLink) dashboardLink.classList.add("hidden")
  }
}

// Show alert message
function showAlert(container, message, type = "success") {
  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${type}`
  alertDiv.textContent = message
  container.innerHTML = ""
  container.appendChild(alertDiv)

  // Auto remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove()
  }, 5000)
}

// Initialize navbar on page load
document.addEventListener("DOMContentLoaded", () => {
  updateNavbar()
})
