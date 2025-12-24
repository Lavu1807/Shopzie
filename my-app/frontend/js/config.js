const API_BASE_URL = "http://localhost:5000/api"

// API Endpoints
const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  ME: `${API_BASE_URL}/auth/me`,
  PROFILE: `${API_BASE_URL}/auth/profile`,

  // Products
  PRODUCTS: `${API_BASE_URL}/products`,
  MY_PRODUCTS: `${API_BASE_URL}/products/my-products`,

  // Cart
  CART: `${API_BASE_URL}/cart`,
  CART_ADD: `${API_BASE_URL}/cart/add`,
  CART_UPDATE: `${API_BASE_URL}/cart/update`,
  CART_REMOVE: `${API_BASE_URL}/cart/remove`,
  CART_CLEAR: `${API_BASE_URL}/cart/clear`,

  // Orders
  ORDERS: `${API_BASE_URL}/orders`,
  MY_ORDERS: `${API_BASE_URL}/orders/my-orders`,
  RECEIVED_ORDERS: `${API_BASE_URL}/orders/received`,
}

// Local Storage Keys
const STORAGE_KEYS = {
  TOKEN: "me_shopz_token",
  USER: "me_shopz_user",
}
