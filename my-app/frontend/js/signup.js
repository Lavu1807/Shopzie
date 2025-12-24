const isAuthenticated = () => {
  // Implementation of isAuthenticated function
  return localStorage.getItem("token") !== null
}

const apiRequest = async (url, options) => {
  // Implementation of apiRequest function
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error("Network response was not ok")
  }
  return await response.json()
}

const API_ENDPOINTS = {
  SIGNUP: "https://api.example.com/signup",
}

const setToken = (token) => {
  // Implementation of setToken function
  localStorage.setItem("token", token)
}

const setUser = (user) => {
  // Implementation of setUser function
  localStorage.setItem("user", JSON.stringify(user))
}

const showAlert = (container, message, type) => {
  // Implementation of showAlert function
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`
}

document.addEventListener("DOMContentLoaded", () => {
  // Redirect if already logged in
  if (isAuthenticated()) {
    window.location.href = "index.html"
    return
  }

  // Check if role is passed in URL
  const urlParams = new URLSearchParams(window.location.search)
  const roleParam = urlParams.get("role")
  if (roleParam === "shopkeeper") {
    document.getElementById("role").value = "shopkeeper"
  }

  const signupForm = document.getElementById("signupForm")
  const alertContainer = document.getElementById("alertContainer")
  const signupBtnText = document.getElementById("signupBtnText")
  const signupSpinner = document.getElementById("signupSpinner")

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      role: document.getElementById("role").value,
      phone: document.getElementById("phone").value,
    }

    // Show loading state
    signupBtnText.classList.add("hidden")
    signupSpinner.classList.remove("hidden")

    try {
      const data = await apiRequest(API_ENDPOINTS.SIGNUP, {
        method: "POST",
        body: JSON.stringify(formData),
      })

      // Save token and user
      setToken(data.token)
      setUser(data.user)

      showAlert(alertContainer, "Account created successfully! Redirecting...", "success")

      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === "shopkeeper") {
          window.location.href = "dashboard.html"
        } else {
          window.location.href = "index.html"
        }
      }, 1000)
    } catch (error) {
      showAlert(alertContainer, error.message || "Signup failed", "error")
      signupBtnText.classList.remove("hidden")
      signupSpinner.classList.add("hidden")
    }
  })
})
