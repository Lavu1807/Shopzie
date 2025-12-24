const isAuthenticated = () => localStorage.getItem("token") !== null
const apiRequest = async (endpoint, options) => {
  const response = await fetch(endpoint, options)
  if (!response.ok) {
    throw new Error("Network response was not ok")
  }
  return response.json()
}
const API_ENDPOINTS = {
  LOGIN: "/api/login",
}
const setToken = (token) => localStorage.setItem("token", token)
const setUser = (user) => localStorage.setItem("user", JSON.stringify(user))
const showAlert = (container, message, type) => {
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`
}

document.addEventListener("DOMContentLoaded", () => {
  // Redirect if already logged in
  if (isAuthenticated()) {
    window.location.href = "index.html"
    return
  }

  const loginForm = document.getElementById("loginForm")
  const alertContainer = document.getElementById("alertContainer")
  const loginBtnText = document.getElementById("loginBtnText")
  const loginSpinner = document.getElementById("loginSpinner")

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    // Show loading state
    loginBtnText.classList.add("hidden")
    loginSpinner.classList.remove("hidden")

    try {
      const data = await apiRequest(API_ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      // Save token and user
      setToken(data.token)
      setUser(data.user)

      showAlert(alertContainer, "Login successful! Redirecting...", "success")

      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === "shopkeeper") {
          window.location.href = "dashboard.html"
        } else {
          window.location.href = "index.html"
        }
      }, 1000)
    } catch (error) {
      showAlert(alertContainer, error.message || "Login failed", "error")
      loginBtnText.classList.remove("hidden")
      loginSpinner.classList.add("hidden")
    }
  })
})
