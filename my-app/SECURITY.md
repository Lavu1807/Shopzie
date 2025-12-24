# Me-Shopz Security & Optimization Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Input Validation](#input-validation)
3. [Authentication & JWT](#authentication--jwt)
4. [API Rate Limiting](#api-rate-limiting)
5. [Error Handling](#error-handling)
6. [Security Headers](#security-headers)
7. [Database Optimization](#database-optimization)
8. [Secure Password Practices](#secure-password-practices)
9. [Deployment Security Checklist](#deployment-security-checklist)
10. [Incident Response](#incident-response)

---

## Overview

This document provides comprehensive security guidelines and best practices for the Me-Shopz e-commerce application. Security is implemented across multiple layers:

- **Frontend**: Input validation, HTTPS enforcement, secure token storage
- **API Layer**: Rate limiting, request validation, secure headers
- **Backend**: JWT authentication, password hashing, database indexing
- **Database**: Indexes, query optimization, data isolation

---

## Input Validation

### Core Principles
- **Whitelist Approach**: Only allow known-good patterns
- **Server-Side Validation**: Never trust client-side validation alone
- **Length Limits**: Enforce maximum lengths for all inputs
- **Type Checking**: Validate data types before processing

### Validation Framework

Using `express-validator` with comprehensive rules:

```javascript
const { body, param, query } = require("express-validator")
const { handleValidationErrors } = require("../middleware/validator")
```

### Available Validators

#### Password Validation
```javascript
// Requirements:
// - 8-128 characters
// - At least 1 uppercase letter
// - At least 1 lowercase letter
// - At least 1 number
// - At least 1 special character (!@#$%^&*)
// - Not a common password (password, 123456, qwerty, etc.)

const passwordValidator = body("password")
  .isLength({ min: 8, max: 128 })
  .matches(/[A-Z]/)
  .matches(/[a-z]/)
  .matches(/[0-9]/)
  .matches(/[!@#$%^&*]/)
```

#### Email Validation
```javascript
// Validates email format and checks for duplicates
const emailValidator = body("email")
  .isEmail()
  .normalizeEmail()
  .isLength({ max: 254 })
```

#### Phone Validation
```javascript
// Accepts 10-15 digit phone numbers with formatting
const phoneValidator = body("phone")
  .matches(/^[\d\s\-\+\(\)]+$/)
  .isLength({ min: 10, max: 15 })
```

#### Product Validators
```javascript
// Price: 0.01 to 999,999.99 with max 2 decimal places
const priceValidator = body("price")
  .isFloat({ min: 0.01, max: 999999.99 })

// Stock: 0 to 1,000,000 units
const stockValidator = body("stock")
  .isInt({ min: 0, max: 1000000 })

// Quantity: 1 to 100 items
const quantityValidator = body("quantity")
  .isInt({ min: 1, max: 100 })
```

### Using Validation Rules

```javascript
// In route definitions:
const { signupValidationRules, handleValidationErrors } = require("../middleware/validator")

router.post("/signup", signupValidationRules(), handleValidationErrors, signup)

// In controllers:
const errors = validationResult(req)
if (!errors.isEmpty()) {
  return res.status(400).json({
    success: false,
    errors: errors.array()
  })
}
```

### Input Sanitization

```javascript
const { sanitizeInput } = require("../middleware/validator")

// Remove dangerous characters
const cleanInput = sanitizeInput(userInput)
// - Removes < and > characters
// - Removes javascript: protocol
// - Limits to 1000 characters
```

---

## Authentication & JWT

### Token Strategy

**Two-Token System for Enhanced Security**

#### Access Token (Short-Lived)
- **Expiry**: 15 minutes
- **Purpose**: API authentication
- **Payload**: `{ id, type: "access" }`
- **Storage**: Memory or localStorage (frontend handles)

#### Refresh Token (Long-Lived)
- **Expiry**: 7 days
- **Purpose**: Obtain new access tokens
- **Payload**: `{ id, type: "refresh" }`
- **Storage**: Secure HTTP-only cookie (optional) + database
- **Rotation**: New refresh token generated on each refresh

### Token Flow

```
1. User Login
   ↓
2. API returns accessToken + refreshToken
   ↓
3. Client stores accessToken in memory/localStorage
   ↓
4. Client uses accessToken for API requests (15 min validity)
   ↓
5. Token Expires
   ↓
6. Client calls /api/auth/refresh with refreshToken
   ↓
7. API validates refreshToken and returns new tokens
   ↓
8. Back to step 4
```

### API Endpoints

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900000  // 15 minutes in ms
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response:
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..." // New token (rotation)
}
```

#### Logout
```bash
POST /api/auth/logout
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

### Implementation Best Practices

1. **Environment Variables**
   ```bash
   JWT_SECRET=your_secret_key_min_32_chars
   JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
   JWT_ACCESS_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   ```

2. **Token Storage (Frontend)**
   ```javascript
   // ✅ RECOMMENDED: Store in memory
   let accessToken = null

   // ⚠️ ACCEPTABLE: localStorage (clear on logout)
   localStorage.setItem('accessToken', token)

   // ❌ AVOID: Storing in cookies without flags
   // Use only if httpOnly flag is enabled
   ```

3. **Secure Request Headers**
   ```javascript
   const headers = {
     'Authorization': `Bearer ${accessToken}`,
     'Content-Type': 'application/json'
   }
   ```

4. **Token Validation**
   ```javascript
   // Server validates:
   // - Token signature (JWT_SECRET)
   // - Token expiry (iat + expiresIn)
   // - Token type (access vs refresh)
   // - User exists and is active
   // - Token not in blacklist (for logout)
   ```

### Password Security

#### Hashing Algorithm
- **Algorithm**: bcryptjs (bcrypt variant)
- **Salt Rounds**: 10
- **Automatic on Save**: Triggers on password field modification

#### Change Password Flow
```javascript
// 1. User provides current password
// 2. Server verifies against hash
// 3. User provides new password
// 4. New password validated (strength requirements)
// 5. Password hashed and stored
// 6. All refresh tokens invalidated (force re-login)
```

---

## API Rate Limiting

### Purpose
Protects against:
- Brute force attacks
- DDoS attacks
- Spam and abuse
- Resource exhaustion

### Rate Limit Policies

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/api/auth/login` | 5 | 15 min | Prevent brute force |
| `/api/auth/signup` | 5 | 15 min | Prevent spam registration |
| `/api/products` (GET) | 100 | 15 min | General browsing |
| `/api/products` (POST) | 20 | 1 hour | Prevent spam listings |
| `/api/cart/*` | 100 | 10 min | Cart operations |
| `/api/orders` (POST) | 10 | 1 hour | Prevent spam orders |
| `/api/reviews` (POST) | 10 | 1 hour | Prevent review spam |
| Search | 30 | 1 min | Search abuse prevention |

### Response Headers
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1620000000
Retry-After: 900
```

### Handling Rate Limits (Frontend)

```javascript
// Example API call with retry logic
async function apiCall(url, options) {
  const response = await fetch(url, options)
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After')
    console.warn(`Rate limited. Retry after ${retryAfter}s`)
    
    // Implement exponential backoff
    await sleep(retryAfter * 1000)
    return apiCall(url, options) // Retry
  }
  
  return response
}
```

### By User vs By IP
- **Authenticated Users**: Limited by user ID (not IP)
- **Anonymous Users**: Limited by IP address
- **Successful Requests**: Some limits don't count successful auth attempts

---

## Error Handling

### Standardized Error Response Format

```json
{
  "success": false,
  "requestId": "req-1234567890-abc123",
  "message": "Validation Error",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Email already registered",
      "value": "user@example.com"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry, constraint violation |
| 413 | Payload Too Large | File size exceeds limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |

### Error Types Handled

#### Validation Errors
```javascript
// express-validator errors
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [...]
}
```

#### Authentication Errors
```javascript
// JWT errors
{
  "statusCode": 401,
  "message": "Invalid Authentication Token"
}

// Expired token
{
  "statusCode": 401,
  "message": "Authentication Token Expired"
}
```

#### Database Errors
```javascript
// Mongoose validation errors
{
  "statusCode": 400,
  "message": "Validation Error"
}

// Duplicate key errors
{
  "statusCode": 400,
  "message": "Duplicate Entry",
  "errors": [{ "field": "email", "message": "Email already exists" }]
}
```

### Error Logging

**Sensitive Data is Automatically Filtered:**
- ❌ Passwords removed from logs
- ❌ Authorization headers redacted
- ❌ Tokens excluded from logged requests
- ✅ Request ID included for tracing
- ✅ Timestamp recorded
- ✅ Stack trace (development only)

```javascript
// Log entry example
{
  "requestId": "req-123",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "method": "POST",
  "path": "/api/auth/login",
  "statusCode": 401,
  "errorName": "JsonWebTokenError",
  "errorMessage": "Invalid token"
}
```

---

## Security Headers

### Headers Implemented

#### Clickjacking Protection
```
X-Frame-Options: DENY
```
Prevents embedding in iframes (blocks clickjacking attacks)

#### MIME Sniffing Protection
```
X-Content-Type-Options: nosniff
```
Forces browser to respect Content-Type header

#### XSS Protection
```
X-XSS-Protection: 1; mode=block
```
Enables XSS filter in older browsers

#### Content Security Policy (CSP)
```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

#### Referrer Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
Controls referrer information sharing

#### Permissions Policy (Feature Policy)
```
Permissions-Policy:
  geolocation=(),
  microphone=(),
  camera=(),
  payment=(),
  usb=(),
  accelerometer=(),
  gyroscope=()
```
Restricts access to sensitive device features

#### HTTPS Enforcement (Production Only)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
Forces HTTPS for 1 year and includes in browser preload list

#### Expect-CT (Certificate Transparency)
```
Expect-CT: max-age=86400, enforce
```
Ensures SSL certificates are logged in public registries

#### Caching Policy
```
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
Pragma: no-cache
Expires: 0
```
Prevents caching of sensitive pages

---

## Database Optimization

### Indexing Strategy

#### User Collection Indexes
```javascript
// Single field indexes
db.users.createIndex({ email: 1 })      // Email lookups
db.users.createIndex({ role: 1 })       // Role-based queries
db.users.createIndex({ isActive: 1 })   // Active user filtering

// Compound indexes
db.users.createIndex({ isActive: 1, role: 1 })  // Active users by role
```

#### Product Collection Indexes
```javascript
// Already defined in schema:
db.products.createIndex({ shopkeeper: 1, isActive: 1 })
db.products.createIndex({ category: 1, isActive: 1 })
db.products.createIndex({ name: "text", description: "text" })
```

#### Order Collection Indexes
```javascript
// Single field indexes
db.orders.createIndex({ orderNumber: 1 })       // Order lookup
db.orders.createIndex({ customer: 1 })          // Customer orders
db.orders.createIndex({ paymentStatus: 1 })     // Payment queries
db.orders.createIndex({ orderStatus: 1 })       // Status queries

// Compound indexes
db.orders.createIndex({ customer: 1, createdAt: -1 })
db.orders.createIndex({ paymentStatus: 1, orderStatus: 1 })
```

#### Cart Collection Indexes
```javascript
// User lookup (primary)
db.carts.createIndex({ user: 1 })
db.carts.createIndex({ updatedAt: 1 })  // Cleanup operations
```

### Query Optimization Techniques

#### 1. Use .lean() for Read-Only Queries
```javascript
// ❌ SLOW: Returns Mongoose documents
const products = await Product.find({ category: "Electronics" })

// ✅ FAST: Returns plain JavaScript objects
const products = await Product
  .find({ category: "Electronics" })
  .lean()
```

**Performance Impact**: ~2-3x faster for read operations

#### 2. Use .select() to Limit Fields
```javascript
// ❌ Retrieves all fields
const user = await User.findById(userId)

// ✅ Retrieves only needed fields
const user = await User
  .findById(userId)
  .select("name email role phone")
```

**Performance Impact**: Reduces network transfer, faster queries

#### 3. Implement Pagination
```javascript
// Query parameters
const page = req.query.page || 1
const limit = req.query.limit || 20
const skip = (page - 1) * limit

// Query with pagination
const products = await Product
  .find({ isActive: true })
  .skip(skip)
  .limit(limit)
  .lean()

// Include total count for client
const total = await Product.countDocuments({ isActive: true })

return {
  items: products,
  total,
  page,
  limit,
  pages: Math.ceil(total / limit)
}
```

#### 4. Avoid N+1 Queries
```javascript
// ❌ N+1 Problem: 1 query + N queries in loop
const orders = await Order.find().lean()
for (const order of orders) {
  const customer = await User.findById(order.customer)
}

// ✅ Use populate: 2 queries total
const orders = await Order
  .find()
  .populate("customer", "name email")
  .lean()
```

#### 5. Use Bulk Operations
```javascript
// ❌ Slow: Individual updates
for (const orderId of orderIds) {
  await Order.findByIdAndUpdate(orderId, { status: "Shipped" })
}

// ✅ Fast: Bulk update
await Order.updateMany(
  { _id: { $in: orderIds } },
  { orderStatus: "Shipped" }
)
```

### Query Performance Monitoring

```javascript
// Enable query logging (development)
mongoose.set('debug', true)

// Or use profiling
db.setProfilingLevel(1, { slowms: 100 })  // Log queries > 100ms

// Check index usage
db.orders.find({customer: userId}).explain("executionStats")
```

### Example: Optimized Product List Query

```javascript
// BEFORE: Slow query
const products = await Product
  .find()
  .populate("shopkeeper")
  .populate("reviews")

// AFTER: Optimized query
const products = await Product
  .find({ isActive: true })
  .select("name price category stock rating images")
  .populate("shopkeeper", "name email")
  .limit(20)
  .skip(0)
  .lean()
  .sort({ createdAt: -1 })
```

---

## Secure Password Practices

### Requirements for User Passwords

✅ **MUST HAVE**
- Minimum 8 characters, maximum 128 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

❌ **MUST NOT BE**
- Common passwords (password, 123456, qwerty, abc123, letmein)
- Username or email (user cannot use email as password)
- Previously used passwords (for password changes)

### Password Hashing

```javascript
// Automatic on User.save()
// Uses bcryptjs with 10 salt rounds
// Never store plaintext passwords
// Never log passwords

// Example:
user.password = "SecurePass123!"
await user.save()  // Automatically hashed before save
```

### Force Password Reset

Implement periodic password resets for security:

```javascript
// Check if password older than 90 days
if (user.isPasswordExpired(90)) {
  return res.status(401).json({
    success: false,
    message: "Password reset required",
    code: "PASSWORD_EXPIRED"
  })
}
```

### Account Lockout (Optional Enhancement)

```javascript
// After 5 failed login attempts
// Lock account for 30 minutes
if (failedAttempts >= 5) {
  user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000)
  await user.save()
  
  return res.status(423).json({
    success: false,
    message: "Account locked. Try again after 30 minutes"
  })
}
```

---

## Deployment Security Checklist

### Environment Configuration

- [ ] All sensitive keys in `.env` file (never in code)
- [ ] `.env` added to `.gitignore`
- [ ] Environment variables used in production:
  - `NODE_ENV=production`
  - `JWT_SECRET` (minimum 32 random characters)
  - `JWT_REFRESH_SECRET` (separate secret)
  - `MONGODB_URI` (secure connection string)
  - `FRONTEND_URL` (for CORS)
  - `PORT` (production port)

### HTTPS/TLS Configuration

- [ ] SSL/TLS certificates installed
- [ ] HTTPS forced (redirect HTTP to HTTPS)
- [ ] Security headers enabled (HSTS, CSP)
- [ ] Certificate valid and not self-signed
- [ ] Certificate auto-renewal configured

### Database Security

- [ ] MongoDB authentication enabled
- [ ] Strong password for database user
- [ ] Database user has minimal required permissions
- [ ] Connection string uses secure method
- [ ] Database runs on non-public port
- [ ] Network security configured (firewall rules)
- [ ] Regular backups configured
- [ ] Backup encryption enabled

### API Security

- [ ] CORS properly configured (only trusted origins)
- [ ] Rate limiting active on all endpoints
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] File uploads restricted (size and type)
- [ ] Request size limits enforced
- [ ] API versioning implemented

### Logging and Monitoring

- [ ] Error logging configured
- [ ] Security events logged (failed logins, rate limit hits)
- [ ] Logs don't contain sensitive data
- [ ] Log retention policy set
- [ ] Monitoring alerts configured
- [ ] Health check endpoint tested

### Code Quality

- [ ] No hardcoded credentials in code
- [ ] No console.log statements with sensitive data
- [ ] Dependencies up to date (npm audit clean)
- [ ] No known vulnerabilities (npm audit)
- [ ] Code review process in place
- [ ] Security testing performed

### Access Control

- [ ] Admin access restricted and logged
- [ ] Role-based access control (RBAC) enforced
- [ ] Service accounts have minimal privileges
- [ ] SSH keys managed securely
- [ ] API keys rotated regularly
- [ ] Inactive accounts disabled

### Incident Response

- [ ] Incident response plan documented
- [ ] On-call rotation for critical issues
- [ ] Contact information for key personnel
- [ ] Escalation procedures defined
- [ ] Communication plan for security incidents

---

## Incident Response

### Security Incident Classification

#### P1: Critical
- Data breach confirmed
- Service completely unavailable
- Active ongoing attack
- Authentication system compromised

**Action**: Immediate shutdown of affected systems

#### P2: High
- Partial service outage
- Potential data exposure
- Unusual activity detected
- Rate limit attacks

**Action**: Investigate within 1 hour, notify team

#### P3: Medium
- Non-critical functionality affected
- Suspicious activity (not confirmed)
- Failed security checks
- Configuration issues

**Action**: Document and investigate within 24 hours

#### P4: Low
- Minor issues
- Warnings that don't affect operation
- Informational alerts

**Action**: Log and schedule for next review

### Response Procedures

#### 1. Detection
- Monitor error logs and alerts
- Review rate limiting metrics
- Check for unusual access patterns
- Verify backup and recovery systems

#### 2. Containment
- Isolate affected systems
- Revoke compromised tokens/credentials
- Enable enhanced logging
- Block suspicious IPs

#### 3. Eradication
- Identify root cause
- Apply fixes/patches
- Update security rules
- Rotate credentials

#### 4. Recovery
- Restore from clean backups
- Verify data integrity
- Gradually bring systems online
- Monitor for recurrence

#### 5. Communication
- Notify affected users (if data breach)
- Inform stakeholders
- Update status page
- Provide timeline and resolution

#### 6. Post-Incident
- Document incident details
- Conduct root cause analysis
- Implement preventive measures
- Update security policies
- Provide team training

### Emergency Contacts

Create a contact list for incidents:
- Lead Developer
- Database Administrator
- Security Officer
- Operations Manager
- Executive Sponsor

### Data Breach Response

If user data is exposed:

1. **Immediate** (First Hour)
   - Confirm breach details
   - Secure affected systems
   - Disable compromised accounts
   - Begin forensic analysis

2. **Short Term** (First 24 Hours)
   - Notify affected users
   - Notify data protection authority (if required)
   - Prepare public statement
   - Activate crisis communication

3. **Medium Term** (Days 1-7)
   - Provide credit monitoring (if relevant)
   - Implement additional security measures
   - Complete forensic investigation
   - Cooperate with authorities

4. **Long Term** (Week 2+)
   - Publish transparency report
   - Implement recommended changes
   - Restore user confidence
   - Update security policies

---

## Additional Resources

### Security Standards
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Tools and Services
- `npm audit` - Dependency vulnerability scanning
- `snyk` - Container and dependency security
- `eslint-plugin-security` - Code security linting
- `helmet` - HTTP security headers

### Regular Maintenance
- Update dependencies monthly
- Run security audits quarterly
- Conduct penetration testing annually
- Review access logs monthly
- Test backup and recovery monthly

---

## Support and Questions

For security concerns or questions:
1. Do NOT post security vulnerabilities publicly
2. Email security team with details
3. Use encrypted communication if possible
4. Allow reasonable time for response and remediation

---

**Last Updated**: January 2024
**Version**: 1.0
**Status**: Active
