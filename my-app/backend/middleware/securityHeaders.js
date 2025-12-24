/**
 * Enhanced Security Headers Middleware
 * Sets comprehensive security headers to protect against common vulnerabilities
 * Works in conjunction with helmet.js for additional protection
 */

const securityHeaders = (req, res, next) => {
  // ===========================
  // CLICKJACKING PROTECTION
  // ===========================
  
  // Prevent the page from being embedded in a frame (clickjacking)
  res.setHeader("X-Frame-Options", "DENY")
  
  // ===========================
  // MIME TYPE SNIFFING PROTECTION
  // ===========================
  
  // Prevent browsers from MIME sniffing
  res.setHeader("X-Content-Type-Options", "nosniff")
  
  // ===========================
  // XSS PROTECTION
  // ===========================
  
  // Enable XSS filter in older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block")
  
  // Content Security Policy - Strict rules
  // Prevents inline scripts and restricts resource loading
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Consider removing unsafe-inline in production
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ")
  )
  
  // ===========================
  // REFERRER POLICY
  // ===========================
  
  // Control what referrer information is sent
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
  
  // ===========================
  // PERMISSIONS POLICY (formerly Feature Policy)
  // ===========================
  
  // Restrict access to sensitive APIs and features
  res.setHeader(
    "Permissions-Policy",
    [
      "geolocation=()",
      "microphone=()",
      "camera=()",
      "payment=()",
      "usb=()",
      "accelerometer=()",
      "gyroscope=()",
    ].join(", ")
  )
  
  // ===========================
  // HSTS (HTTP Strict Transport Security)
  // ===========================
  
  // Force HTTPS connections (only if not in development)
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  }
  
  // ===========================
  // ADDITIONAL SECURITY HEADERS
  // ===========================
  
  // Prevent browsers from caching sensitive pages
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  res.setHeader("Pragma", "no-cache")
  res.setHeader("Expires", "0")
  
  // Disable DNS prefetching to prevent data leaks
  res.setHeader("X-DNS-Prefetch-Control", "off")
  
  // Remove server identification
  res.removeHeader("Server")
  res.removeHeader("X-Powered-By")
  res.setHeader("X-Powered-By", "Me-Shopz") // Custom identifier
  
  // Expect Certificate Transparency (for HTTPS)
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Expect-CT", "max-age=86400, enforce")
  }
  
  // Clear Site Data header (optional - use with caution)
  // res.setHeader('Clear-Site-Data', '"cookies"')
  
  next()
}

module.exports = securityHeaders
