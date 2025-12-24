const express = require("express")
const { body } = require("express-validator")
const {
  signup,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController")
const { protect } = require("../middleware/auth")
const { authLimiter } = require("../middleware/rateLimiter")
const {
  handleValidationErrors,
  signupValidationRules,
  loginValidationRules,
  profileValidationRules,
  changePasswordValidationRules,
} = require("../middleware/validator")

const router = express.Router()

// =====================
// PUBLIC ROUTES (WITH RATE LIMITING)
// =====================

/**
 * Register new user
 * POST /api/auth/signup
 */
router.post("/signup", authLimiter, signupValidationRules(), handleValidationErrors, signup)

/**
 * Login user
 * POST /api/auth/login
 */
router.post("/login", authLimiter, loginValidationRules(), handleValidationErrors, login)

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh
 * Body: { "refreshToken": "your_refresh_token" }
 */
router.post("/refresh", authLimiter, refreshToken)

// =====================
// PROTECTED ROUTES
// =====================

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
router.get("/me", protect, getMe)

/**
 * Logout user (revoke refresh token)
 * POST /api/auth/logout
 */
router.post("/logout", protect, logout)

/**
 * Update user profile
 * PUT /api/auth/profile
 */
router.put("/profile", protect, profileValidationRules(), handleValidationErrors, updateProfile)

/**
 * Change password
 * PUT /api/auth/change-password
 */
router.put(
  "/change-password",
  protect,
  changePasswordValidationRules(),
  handleValidationErrors,
  changePassword
)

module.exports = router
