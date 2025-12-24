function getToken() {
  // Placeholder implementation for demonstration purposes
  return localStorage.getItem("authToken")
}

// Make API request with authentication
async function apiRequest(url, options = {}) {
  const token = getToken()

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong")
    }

    return data
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// Make API request with FormData (for file uploads)
async function apiRequestWithFiles(url, formData) {
  const token = getToken()

  const headers = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong")
    }

    return data
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// Format price
function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

// Format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" }
  return new Date(dateString).toLocaleDateString("en-US", options)
}

// Get image URL
function getImageUrl(imagePath) {
  if (!imagePath) return "/diverse-products-still-life.png"
  if (imagePath.startsWith("http")) return imagePath
  return `http://localhost:5000${imagePath}`
}
