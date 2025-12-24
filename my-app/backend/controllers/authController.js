const User = require("../models/User")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")

// =====================
// TOKEN GENERATION
// =====================

/**
 * Generate short-lived access token (15 minutes)
 * Used for API authentication
 */
const generateAccessToken = (id) => {
  return jwt.sign({ id, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
  })
}

/**
 * Generate long-lived refresh token (7 days)
 * Used to obtain new access tokens
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id, type: "refresh" }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  })
}

/**
 * Generate both access and refresh tokens
 * Returns token pair with expiration info
 */
const generateTokenPair = (userId) => {
  const accessToken = generateAccessToken(userId)
  const refreshToken = generateRefreshToken(userId)

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
  }
}

// =====================
// REGISTER (SIGNUP)
// =====================

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
exports.signup = async (req, res, next) => {
  try {
    // Validation check
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { name, email, password, role, phone, address } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
      phone,
      address,
    })

    // Generate token pair
    const { accessToken, refreshToken, expiresIn } = generateTokenPair(user._id)

    // Store refresh token in database
    user.refreshToken = refreshToken
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await user.save()

    // Set secure refresh token cookie (optional)
    if (process.env.NODE_ENV === "production") {
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // HTTPS only
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

// =====================
// LOGIN
// =====================

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      })
    }

    // Check if user exists (include password field)
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      })
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password)

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Generate token pair
    const { accessToken, refreshToken, expiresIn } = generateTokenPair(user._id)

    // Store refresh token in database
    user.refreshToken = refreshToken
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await user.save()

    // Set secure refresh token cookie (optional, for production)
    if (process.env.NODE_ENV === "production") {
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

// =====================
// REFRESH TOKEN
// =====================

/**
 * @desc    Refresh access token using refresh token
 * @route   POST /api/auth/refresh
 * @access  Public
 * 
 * Request body:
 * {
 *   "refreshToken": "your_refresh_token_here"
 * }
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      })
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      )

      // Check token type
      if (decoded.type !== "refresh") {
        return res.status(401).json({
          success: false,
          message: "Invalid token type",
        })
      }

      // Get user
      const user = await User.findById(decoded.id)

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        })
      }

      // Verify refresh token matches stored token
      if (user.refreshToken !== refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token is invalid or has been revoked",
        })
      }

      // Check if refresh token is expired
      if (user.refreshTokenExpiry < new Date()) {
        user.refreshToken = null
        user.refreshTokenExpiry = null
        await user.save()

        return res.status(401).json({
          success: false,
          message: "Refresh token has expired",
        })
      }

      // Generate new token pair
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } = generateTokenPair(user._id)

      // Update refresh token in database (token rotation)
      user.refreshToken = newRefreshToken
      user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      await user.save()

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      })
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        // Refresh token is expired, user must login again
        const user = await User.findOne({ refreshToken })
        if (user) {
          user.refreshToken = null
          user.refreshTokenExpiry = null
          await user.save()
        }

        return res.status(401).json({
          success: false,
          message: "Refresh token has expired. Please login again.",
        })
      }

      throw error
    }
  } catch (error) {
    next(error)
  }
}

// =====================
// LOGOUT
// =====================

/**
 * @desc    Logout user (revoke refresh token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    // Revoke refresh token
    await User.findByIdAndUpdate(req.user.id, {
      refreshToken: null,
      refreshTokenExpiry: null,
    })

    // Clear refresh token cookie (if using cookies)
    res.clearCookie("refreshToken")

    res.status(200).json({
      success: true,
      message: "Logout successful",
    })
  } catch (error) {
    next(error)
  }
}

// =====================
// GET CURRENT USER
// =====================

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshToken")

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    next(error)
  }
}

// =====================
// UPDATE PROFILE
// =====================

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, role } = req.body

    const fieldsToUpdate = {}
    if (name) fieldsToUpdate.name = name
    if (phone) fieldsToUpdate.phone = phone
    if (address) fieldsToUpdate.address = address
    if (role && ["customer", "shopkeeper"].includes(role)) fieldsToUpdate.role = role

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    })
  } catch (error) {
    next(error)
  }
}

// =====================
// CHANGE PASSWORD
// =====================

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      })
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password")

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    // Update password (this also invalidates refresh tokens)
    user.password = newPassword
    user.refreshToken = null // Force re-login
    user.refreshTokenExpiry = null
    await user.save()

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
    })
  } catch (error) {
    next(error)
  }
}
