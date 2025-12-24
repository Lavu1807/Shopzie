const rateLimit = require("express-rate-limit")

/**
 * Rate Limiting Configuration
 * Protects API from abuse, brute force attacks, and resource exhaustion
 */

// ===========================
// GENERAL API RATE LIMITER
// ===========================

/**
 * Default rate limiter for all API routes
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    retryAfter: 900, // 15 minutes in seconds
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check and static files
    return req.path === "/api/health" || req.path.startsWith("/uploads")
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP address
    return req.user?.id || req.ip
  },
})

// ===========================
// AUTHENTICATION RATE LIMITER
// ===========================

/**
 * Strict rate limiter for login/signup
 * 5 attempts per 15 minutes (prevents brute force)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
    retryAfter: 900, // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests against the limit
  skipFailedRequests: false, // Count failed requests
})

// ===========================
// PASSWORD CHANGE RATE LIMITER
// ===========================

/**
 * Rate limiter for password changes
 * 3 attempts per hour (prevents password spam)
 */
const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    message: "Too many password change attempts, please try again later.",
    retryAfter: 3600, // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.user?.id || req.ip,
})

// ===========================
// PRODUCT CREATION RATE LIMITER
// ===========================

/**
 * Rate limiter for product creation (prevents spam)
 * 20 products per hour for shopkeepers
 */
const productCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 product creations per hour
  message: {
    success: false,
    message: "Too many products created, please try again later.",
    retryAfter: 3600, // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.user?.id || req.ip,
})

// ===========================
// PRODUCT UPDATE RATE LIMITER
// ===========================

/**
 * Rate limiter for product updates
 * 50 updates per hour
 */
const productUpdateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 updates per hour
  message: {
    success: false,
    message: "Too many product updates, please try again later.",
    retryAfter: 3600, // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
})

// ===========================
// ORDER CREATION RATE LIMITER
// ===========================

/**
 * Rate limiter for order creation
 * 10 orders per hour (prevents spam orders)
 */
const orderCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 orders per hour
  message: {
    success: false,
    message: "Too many orders created, please try again later.",
    retryAfter: 3600, // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
})

// ===========================
// SEARCH RATE LIMITER
// ===========================

/**
 * Rate limiter for search queries
 * 30 searches per minute (prevents search abuse)
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    success: false,
    message: "Too many search requests, please try again later.",
    retryAfter: 60, // 1 minute in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
})

// ===========================
// REVIEW/RATING RATE LIMITER
// ===========================

/**
 * Rate limiter for reviews and ratings
 * 10 reviews per hour (prevents review spam)
 */
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 reviews per hour
  message: {
    success: false,
    message: "Too many reviews submitted, please try again later.",
    retryAfter: 3600, // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
})

// ===========================
// FILE UPLOAD RATE LIMITER
// ===========================

/**
 * Rate limiter for file uploads
 * 50 uploads per hour (prevents upload spam)
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    success: false,
    message: "Too many uploads, please try again later.",
    retryAfter: 3600, // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
})

// ===========================
// CART OPERATIONS RATE LIMITER
// ===========================

/**
 * Rate limiter for cart operations
 * 100 cart operations per 10 minutes
 */
const cartOperationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // 100 operations per window
  message: {
    success: false,
    message: "Too many cart operations, please try again later.",
    retryAfter: 600, // 10 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
})

module.exports = {
  // Core limiters
  apiLimiter,
  authLimiter,
  
  // Feature-specific limiters
  passwordChangeLimiter,
  productCreationLimiter,
  productUpdateLimiter,
  orderCreationLimiter,
  searchLimiter,
  reviewLimiter,
  uploadLimiter,
  cartOperationLimiter,
}
