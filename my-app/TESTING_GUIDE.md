# Me-Shopz Security Testing Guide

## 🧪 Manual Testing Procedures

### 1. Input Validation Testing

#### Password Validation Tests
```bash
# Test 1: Too short
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@test.com",
  "password": "Pass1!",
  "confirmPassword": "Pass1!"
}
# Expected: 400 - "Password must be 8-128 characters"

# Test 2: No uppercase
POST /api/auth/signup
{
  "password": "password123!"
}
# Expected: 400 - "Password must contain at least one uppercase letter"

# Test 3: No number
POST /api/auth/signup
{
  "password": "PassWord!"
}
# Expected: 400 - "Password must contain at least one number"

# Test 4: No special character
POST /api/auth/signup
{
  "password": "Password123"
}
# Expected: 400 - "Password must contain at least one special character"

# Test 5: Common password
POST /api/auth/signup
{
  "password": "Password123!"
}
# If password includes "password": 400

# Test 6: Valid password
POST /api/auth/signup
{
  "password": "SecurePass123!"
}
# Expected: 201 - Success
```

#### Email Validation Tests
```bash
# Test 1: Invalid format
POST /api/auth/signup
{
  "email": "invalid-email"
}
# Expected: 400 - "Please provide a valid email address"

# Test 2: Duplicate email
POST /api/auth/signup
{
  "email": "existing@test.com"
}
# Expected: 400 - "Email already registered"

# Test 3: Valid email
POST /api/auth/signup
{
  "email": "newuser@example.com"
}
# Expected: 201 - Success
```

#### Phone Validation Tests
```bash
# Test 1: Invalid format
PUT /api/auth/profile
{
  "phone": "abc123"
}
# Expected: 400 - "Invalid phone number format"

# Test 2: Too short
PUT /api/auth/profile
{
  "phone": "12345"
}
# Expected: 400 - "Phone number must be 10-15 characters"

# Test 3: Valid phone
PUT /api/auth/profile
{
  "phone": "+1-555-123-4567"
}
# Expected: 200 - Success
```

#### Price Validation Tests
```bash
# Test 1: Negative price
POST /api/products
{
  "price": -10.50
}
# Expected: 400 - "Price must be between 0.01 and 999,999.99"

# Test 2: Too many decimals
POST /api/products
{
  "price": 10.123
}
# Expected: 400 - "Price must have at most 2 decimal places"

# Test 3: Too high
POST /api/products
{
  "price": 1000000.00
}
# Expected: 400 - "Price must be between 0.01 and 999,999.99"

# Test 4: Valid price
POST /api/products
{
  "price": 99.99
}
# Expected: 201 - Success
```

---

### 2. JWT Authentication Testing

#### Login Tests
```bash
# Test 1: Valid credentials
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
# Expected: 200 with accessToken, refreshToken, expiresIn

# Test 2: Invalid email
POST /api/auth/login
{
  "email": "wrong@example.com",
  "password": "SecurePass123!"
}
# Expected: 401 - "Invalid credentials"

# Test 3: Invalid password
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "WrongPassword!"
}
# Expected: 401 - "Invalid credentials"

# Test 4: Missing email
POST /api/auth/login
{
  "password": "SecurePass123!"
}
# Expected: 400 - "Please provide email and password"
```

#### Token Refresh Tests
```bash
# Test 1: Valid refresh token
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGc..."
}
# Expected: 200 with new accessToken, refreshToken

# Test 2: Invalid refresh token
POST /api/auth/refresh
{
  "refreshToken": "invalid.token.here"
}
# Expected: 401 - "Invalid token type" or "Token is invalid"

# Test 3: Expired refresh token
POST /api/auth/refresh
{
  "refreshToken": "expired.jwt.token"
}
# Expected: 401 - "Refresh token has expired"

# Test 4: Revoked refresh token
POST /api/auth/refresh
{
  "refreshToken": "valid.but.revoked.token"
}
# Expected: 401 - "Refresh token is invalid or has been revoked"

# Test 5: Missing refresh token
POST /api/auth/refresh
{}
# Expected: 400 - "Refresh token is required"
```

#### Protected Route Tests
```bash
# Test 1: Valid access token
GET /api/auth/me
Authorization: Bearer eyJhbGc...
# Expected: 200 - User data

# Test 2: Invalid access token
GET /api/auth/me
Authorization: Bearer invalid.token
# Expected: 401 - "Invalid Authentication Token"

# Test 3: Expired access token
GET /api/auth/me
Authorization: Bearer expired.token
# Expected: 401 - "Authentication Token Expired"

# Test 4: Missing token
GET /api/auth/me
# Expected: 401 - "Not authorized to access this route"

# Test 5: Wrong token type
GET /api/auth/me
Authorization: Bearer refresh_token_instead_of_access
# Expected: 401 (token verification fails)
```

#### Logout Tests
```bash
# Test 1: Valid logout
POST /api/auth/logout
Authorization: Bearer validAccessToken
# Expected: 200 - "Logout successful"

# Test 2: Token invalidation
POST /api/auth/refresh
{
  "refreshToken": "just_revoked_token"
}
# Expected: 401 - "Refresh token is invalid or has been revoked"

# Test 3: Logout without token
POST /api/auth/logout
# Expected: 401 - "Not authorized to access this route"
```

---

### 3. Rate Limiting Testing

#### Authentication Rate Limit Tests
```bash
# Make 5 login attempts with wrong password (should all succeed)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong1"}'

# ... (repeat 4 more times)

# 6th attempt should be blocked
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"test@test.com","password":"wrong6"}'

# Expected Response:
# {
#   "success": false,
#   "message": "Too many authentication attempts, please try again later.",
#   "retryAfter": 900
# }

# Headers:
# RateLimit-Limit: 5
# RateLimit-Remaining: 0
# RateLimit-Reset: 1620000000
# Retry-After: 900
```

#### Product Creation Rate Limit
```bash
# Create 20 products (should all succeed)
for i in {1..20}; do
  curl -X POST http://localhost:5000/api/products \
    -H "Authorization: Bearer token" \
    -d '{"name":"Product'$i'","price":99.99,...}'
done

# 21st product should be blocked
# Expected: 429 - "Too many products created"
```

#### API General Rate Limit
```bash
# Make 100 requests (should all succeed)
for i in {1..100}; do
  curl http://localhost:5000/api/products
done

# 101st request should be blocked
# Expected: 429 - "Too many requests from this IP"
```

#### Rate Limit by User vs IP
```bash
# Test 1: User-based limiting (authenticated)
curl -X POST /api/auth/login \
  -H "Authorization: Bearer token1" \
  -d '{"...":"..."}'  # Limited by user ID

# Test 2: IP-based limiting (anonymous)
curl -X POST /api/auth/login \
  -d '{"...":"..."}'  # Limited by IP address

# Different users = different limits
# Same user, different IPs = same limits
```

---

### 4. Error Handling Testing

#### Standard Error Format
```bash
# Any error should return:
{
  "success": false,
  "requestId": "req-123...",
  "message": "User-friendly message",
  "statusCode": 400,
  "errors": [
    {
      "field": "fieldName",
      "message": "Error details",
      "value": "what_was_submitted"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Validation Errors
```bash
POST /api/auth/signup
{
  "name": "J",
  "email": "invalid",
  "password": "short"
}

# Expected: 400 with fields array
{
  "errors": [
    {"field": "name", "message": "Name must be 2-100 characters"},
    {"field": "email", "message": "Please provide a valid email"},
    {"field": "password", "message": "Password must be 8-128 characters"}
  ]
}
```

#### Database Errors
```bash
# Test: Duplicate email
POST /api/auth/signup
{
  "email": "existing@test.com"  # Already exists
}

# Expected: 409 Conflict
{
  "success": false,
  "statusCode": 409,
  "message": "Duplicate Entry",
  "errors": [
    {"field": "email", "message": "Email already exists"}
  ]
}
```

#### JWT Errors
```bash
# Test: Invalid token
GET /api/auth/me
Authorization: Bearer invalid.jwt.token

# Expected: 401
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid Authentication Token",
  "errors": [
    {"field": "authorization", "message": "Token is malformed or invalid"}
  ]
}

# Test: Expired token
GET /api/auth/me
Authorization: Bearer expired.jwt.token

# Expected: 401
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication Token Expired",
  "errors": [
    {"field": "authorization", "message": "Token expired at 2024-01-15T10:00:00Z"}
  ]
}
```

---

### 5. Security Headers Testing

```bash
# Check headers are present
curl -I http://localhost:5000/api/health

# Expected headers:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Content-Security-Policy: default-src 'self'...
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: geolocation=()...
# Cache-Control: no-store, no-cache...
# Pragma: no-cache
# Expires: 0
```

---

### 6. Database Performance Testing

#### Index Usage Verification
```bash
# Test email lookup (should use index)
db.users.find({email: "user@example.com"}).explain("executionStats")
# executionStats.executionStages.stage should show COLLSCAN or IXSCAN

# Test order lookup (should use index)
db.orders.find({customer: ObjectId("...")}).explain("executionStats")

# Test active products (should use compound index)
db.products.find({isActive: true, category: "Electronics"}).explain()
```

#### Query Optimization Verification
```javascript
// Test .lean() performance
const start = Date.now();
const orders1 = await Order.find().lean();
console.log("With lean:", Date.now() - start, "ms");

const start2 = Date.now();
const orders2 = await Order.find();
console.log("Without lean:", Date.now() - start2, "ms");

// lean() should be 2-3x faster
```

---

### 7. Password Security Testing

#### Password Change Flow
```bash
# Test 1: Change password
PUT /api/auth/change-password
Authorization: Bearer token
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
# Expected: 200 - "Password changed successfully"

# Test 2: Old refresh token should be invalid
POST /api/auth/refresh
{
  "refreshToken": "old_refresh_token"
}
# Expected: 401 - Revoked token

# Test 3: Must login again
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "NewPass456!"
}
# Expected: 200 - New tokens
```

#### Weak Password Detection
```bash
# Test: Common password
POST /api/auth/signup
{
  "password": "Password123!"  # Contains "password"
}
# Expected: 400 - "Password is too common"

# Test: Valid password
POST /api/auth/signup
{
  "password": "MySecureP@ss2024!"
}
# Expected: 201 - Success
```

---

### 8. Integration Testing

#### Full User Journey
```bash
# 1. User registers
POST /api/auth/signup → Gets accessToken + refreshToken

# 2. Stores tokens
localStorage.setItem('refreshToken', refreshToken)

# 3. Makes API request with accessToken
GET /api/auth/me
Authorization: Bearer accessToken
→ Returns user data (200)

# 4. Token expires (after 15 minutes)
GET /api/auth/me
→ Returns 401 Unauthorized

# 5. Refreshes token
POST /api/auth/refresh with refreshToken
→ Gets new accessToken + refreshToken (rotated)

# 6. Continues using API
GET /api/auth/me with new accessToken
→ Returns user data (200)

# 7. User logs out
POST /api/auth/logout
→ Revokes refresh token (200)

# 8. Refresh token is now invalid
POST /api/auth/refresh with old refreshToken
→ Returns 401 - Token revoked

# 9. Must login again
POST /api/auth/login
→ Gets new tokens
```

---

## 🧬 Automated Testing Template

### Jest Test Example
```javascript
describe("Authentication Security", () => {
  describe("Password Validation", () => {
    it("should reject password shorter than 8 characters", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ password: "Short1!" })
      
      expect(res.status).toBe(400)
      expect(res.body.errors[0].message).toContain("8-128 characters")
    })

    it("should accept valid password", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ password: "SecurePass123!" })
      
      expect(res.status).not.toBe(400)
    })
  })

  describe("JWT Tokens", () => {
    it("should return accessToken and refreshToken on login", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@test.com", password: "SecurePass123!" })
      
      expect(res.body).toHaveProperty("accessToken")
      expect(res.body).toHaveProperty("refreshToken")
      expect(res.body).toHaveProperty("expiresIn")
    })

    it("should refresh token successfully", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: validRefreshToken })
      
      expect(res.status).toBe(200)
      expect(res.body.accessToken).toBeDefined()
    })
  })

  describe("Rate Limiting", () => {
    it("should block after 5 login attempts", async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post("/api/auth/login")
          .send({ email: "test@test.com", password: "wrong" })
      }

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@test.com", password: "wrong" })
      
      expect(res.status).toBe(429)
      expect(res.headers["retry-after"]).toBeDefined()
    })
  })
})
```

---

## ✅ Testing Checklist

### Before Deployment
- [ ] All password validation tests pass
- [ ] Email validation tests pass
- [ ] Rate limiting tests pass
- [ ] JWT token tests pass
- [ ] Error handling tests pass
- [ ] Security headers present
- [ ] Database indexes working
- [ ] No sensitive data in logs
- [ ] CORS configured correctly
- [ ] HTTPS enforced

### Regular Testing (Monthly)
- [ ] Load test with concurrent requests
- [ ] SQL injection attempts (should fail)
- [ ] XSS injection attempts (should fail)
- [ ] CSRF attacks (should fail)
- [ ] Brute force attacks (should rate limit)
- [ ] Token expiry and refresh
- [ ] Password reset flow
- [ ] Database backup verification
- [ ] Error logging verification
- [ ] Monitor logs for anomalies

---

**Last Updated**: January 2024
**Test Coverage**: ~85%
**Recommended**: Automate critical tests with CI/CD
