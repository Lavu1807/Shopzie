/**
 * Global Error Handler Middleware
 * Provides standardized error responses with proper status codes and logging
 * Must be used as the last middleware in the Express app
 */

const errorHandler = (err, req, res, next) => {
  // Generate unique request ID for tracking
  const requestId = req.id || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Prepare error details
  const errorDetails = {
    requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode: err.statusCode || 500,
  }

  // Log error with sanitized sensitive data
  logError(err, errorDetails)

  // Determine response based on error type
  let response = {
    success: false,
    requestId,
    message: "An error occurred",
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    response.statusCode = 400
    response.message = "Validation Error"
    response.errors = Object.entries(err.errors).map(([field, error]) => ({
      field,
      message: error.message,
    }))

    return res.status(400).json(response)
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    response.statusCode = 400
    const field = Object.keys(err.keyPattern)[0]
    response.message = `Duplicate Entry`
    response.errors = [
      {
        field,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      },
    ]

    return res.status(400).json(response)
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === "CastError") {
    response.statusCode = 400
    response.message = "Invalid Resource ID"
    response.errors = [
      {
        field: err.path,
        message: `Invalid ${err.kind}: ${err.value}`,
      },
    ]

    return res.status(400).json(response)
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    response.statusCode = 401
    response.message = "Invalid Authentication Token"
    response.errors = [
      {
        field: "authorization",
        message: "Token is malformed or invalid",
      },
    ]

    return res.status(401).json(response)
  }

  // Handle token expiration
  if (err.name === "TokenExpiredError") {
    response.statusCode = 401
    response.message = "Authentication Token Expired"
    response.errors = [
      {
        field: "authorization",
        message: `Token expired at ${err.expiredAt}`,
      },
    ]

    return res.status(401).json(response)
  }

  // Handle custom API errors (with statusCode property)
  if (err.statusCode) {
    response.statusCode = err.statusCode
    response.message = err.message || "An error occurred"

    if (err.errors) {
      response.errors = err.errors
    }

    return res.status(err.statusCode).json(response)
  }

  // Handle file upload errors
  if (err.code === "FILE_SIZE_LIMIT_EXCEEDED") {
    response.statusCode = 413
    response.message = "File too large"
    response.errors = [
      {
        field: "file",
        message: "File size exceeds maximum limit (10MB)",
      },
    ]

    return res.status(413).json(response)
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    response.statusCode = 400
    response.message = "Too many files"
    response.errors = [
      {
        field: "files",
        message: "Maximum 5 files allowed",
      },
    ]

    return res.status(400).json(response)
  }

  // Handle rate limit errors
  if (err.status === 429 || err.statusCode === 429) {
    response.statusCode = 429
    response.message = "Too many requests"
    response.retryAfter = err.retryAfter

    return res.status(429).json(response)
  }

  // Default error response
  const statusCode = err.statusCode || 500
  response.statusCode = statusCode
  response.message = err.message || "Internal Server Error"

  // Include stack trace in development only
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack
    response.fullError = err
  }

  res.status(statusCode).json(response)
}

/**
 * Log error with proper sanitization
 * Prevents logging of sensitive information like passwords, tokens
 */
const logError = (err, errorDetails) => {
  const sanitizedBody = sanitizeRequestBody(err.request?.body)
  const sanitizedHeaders = sanitizeHeaders(err.request?.headers)

  const logEntry = {
    ...errorDetails,
    errorName: err.name,
    errorMessage: err.message,
    ...(process.env.NODE_ENV === "development" && {
      body: sanitizedBody,
      headers: sanitizedHeaders,
      stack: err.stack,
    }),
  }

  // Log level based on status code
  if (errorDetails.statusCode >= 500) {
    console.error("🔴 SERVER ERROR:", JSON.stringify(logEntry, null, 2))
  } else if (errorDetails.statusCode >= 400) {
    console.warn("🟡 CLIENT ERROR:", JSON.stringify(logEntry, null, 2))
  } else {
    console.log("🔵 ERROR:", JSON.stringify(logEntry, null, 2))
  }
}

/**
 * Sanitize request body to remove sensitive data
 */
const sanitizeRequestBody = (body) => {
  if (!body) return {}

  const sensitiveFields = ["password", "token", "secret", "apiKey", "creditCard", "ssn", "authorization"]
  const sanitized = { ...body }

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]"
    }
  })

  return sanitized
}

/**
 * Sanitize headers to remove authorization tokens
 */
const sanitizeHeaders = (headers) => {
  if (!headers) return {}

  const sanitized = { ...headers }
  if (sanitized.authorization) {
    sanitized.authorization = "[REDACTED]"
  }
  if (sanitized.cookie) {
    sanitized.cookie = "[REDACTED]"
  }

  return sanitized
}

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Async error wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = errorHandler
module.exports.ApiError = ApiError
module.exports.asyncHandler = asyncHandler
