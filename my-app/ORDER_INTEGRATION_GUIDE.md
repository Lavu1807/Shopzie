# Order Management System - Integration Guide

## 🚀 Quick Start

### 1. Frontend Pages Ready
- ✅ **`orders.html`** - Customer order history
- ✅ **`seller-dashboard.html`** - Shopkeeper received orders

### 2. Backend Already Configured
- ✅ Order Model complete with all fields
- ✅ Order Controller with 5 endpoints
- ✅ Order Routes registered in server.js
- ✅ Cart model with clearCart() method
- ✅ Authentication middleware in place

### 3. Database Relations Established
```
User (Customer) → Order → Items → Product → User (Shopkeeper)
```

---

## 🔧 Integration Checklist

### Backend Integration
- [x] Order model (MongoDB schema)
- [x] Order controller (5 endpoints)
- [x] Order routes (router setup)
- [x] Cart integration (clear on order)
- [x] Stock management (update on order)
- [x] Authentication checks
- [x] Error handling
- [x] Data validation
- [x] Pagination support
- [x] Database relations

### Frontend Integration

**Step 1: Add Navigation Links**
```html
<!-- In navbar -->
<li><a href="orders.html">My Orders</a></li>  <!-- For customers -->
<li><a href="seller-dashboard.html">Dashboard</a></li>  <!-- For shopkeepers -->
```

**Step 2: Link from Checkout**
```javascript
// In checkout.html, after successful order creation
const confirmOrder = async () => {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      shippingAddress: formData.address,
      paymentMethod: formData.method,
      notes: formData.notes
    })
  });

  if (response.ok) {
    // Redirect to order confirmation
    window.location.href = 'orders.html';
  }
};
```

**Step 3: Verify API Configuration**
```javascript
// In js/config.js
API_BASE_URL = 'http://localhost:5000';  // or your server URL
```

**Step 4: Ensure Cart Service Integration**
```javascript
// orders.html already includes:
<script src="js/cart-service.js"></script>

// For reorder functionality
const cartService = new CartService();
await cartService.addToBackendCart(productId, quantity, product);
```

---

## 📋 File Checklist

### Created Files
```
frontend/
├── orders.html                    ✅ Customer order history
└── seller-dashboard.html          ✅ Shopkeeper dashboard

backend/
├── models/Order.js                ✅ (Already complete)
├── controllers/orderController.js ✅ (Already complete)
└── routes/orderRoutes.js          ✅ (Already complete)

Documentation/
├── ORDER_MANAGEMENT_GUIDE.md      ✅ Complete guide
├── ORDER_API_REFERENCE.md         ✅ API documentation
└── ORDER_INTEGRATION_GUIDE.md     ✅ (This file)
```

### Modified Files
```
backend/
└── server.js                      ✅ (Already has orderRoutes)

Note: No modifications needed to existing files!
```

---

## 🧪 Testing Guide

### 1. Test Order Creation

**Setup:**
1. Login as customer
2. Add items to cart
3. Go to checkout page
4. Fill shipping address
5. Submit order

**Expected Result:**
```
✓ Order created with unique order number
✓ Stock updated for each product
✓ Cart cleared
✓ Order appears in /api/orders/my-orders
```

**Test Cases:**
```javascript
// Test 1: Valid order creation
{
  shippingAddress: {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA"
  },
  paymentMethod: "COD"
}
// Expected: 201 Created with order data

// Test 2: Missing address field
{
  shippingAddress: {
    city: "New York"
    // Missing other fields
  }
}
// Expected: 400 "Complete shipping address is required"

// Test 3: Empty cart
// Expected: 400 "Cart is empty"

// Test 4: Insufficient stock
{
  product: "phone",
  quantity: 1000  // Stock is 50
}
// Expected: 400 "Insufficient stock for phone"
```

### 2. Test Customer Order History

**Setup:**
1. Create 2-3 orders
2. Go to orders.html
3. Test filters and pagination

**Test Cases:**
```javascript
// Test 1: Get all orders
GET /api/orders/my-orders?page=1&limit=10
// Expected: 200 OK with order list

// Test 2: Pagination
GET /api/orders/my-orders?page=2&limit=5
// Expected: 200 OK with next page

// Test 3: View order details
GET /api/orders/:orderId
// Expected: 200 OK with full order details

// Test 4: Unauthorized access
GET /api/orders/my-orders
// Without Bearer token
// Expected: 401 Unauthorized

// Test 5: View other customer's order
GET /api/orders/:othersOrderId
// Expected: 403 Forbidden
```

### 3. Test Shopkeeper Dashboard

**Setup:**
1. Login as shopkeeper
2. Go to seller-dashboard.html
3. Verify only your orders show

**Test Cases:**
```javascript
// Test 1: Get received orders
GET /api/orders/received?page=1&limit=20
// Expected: 200 OK with orders containing shopkeeper's items

// Test 2: Update order status
PUT /api/orders/:orderId/status
{
  "status": "Shipped"
}
// Expected: 200 OK with updated order

// Test 3: Invalid status
{
  "status": "Invalid"
}
// Expected: 400 "Invalid status"

// Test 4: Shopkeeper updating other's product order
// Expected: 403 Forbidden

// Test 5: Statistics calculation
// Expected: Counts match order status distribution
```

### 4. Test Authorization

**Test Cases:**
```javascript
// Test 1: Customer trying to access /api/orders/received
// Expected: 403 Forbidden

// Test 2: Shopkeeper trying to POST /api/orders
// Expected: 403 Forbidden

// Test 3: Unauthenticated access
// Expected: 401 Unauthorized

// Test 4: Invalid token
Header: Authorization: Bearer invalid_token
// Expected: 401 Unauthorized
```

---

## 🐛 Debugging

### Common Issues & Solutions

**Issue 1: Orders not showing in dashboard**
```
Solution:
1. Check if shopkeeper has products in system
2. Verify order items have correct shopkeeper reference
3. Check MongoDB query filters
4. Verify user ID in local storage
```

**Issue 2: Stock not updating**
```
Solution:
1. Check orderController.js stock update code
2. Verify Product model has stock field
3. Check if stock validation passes
4. Review MongoDB update operations
```

**Issue 3: Cart not clearing after order**
```
Solution:
1. Verify Cart.clearCart() method exists
2. Check cart.save() is called
3. Verify cart belongs to user
4. Check error logs for save failures
```

**Issue 4: Order details showing incorrect data**
```
Solution:
1. Verify populate() calls in controller
2. Check MongoDB references are correct
3. Review response data structure
4. Check for missing fields in model
```

**Issue 5: Authorization failures**
```
Solution:
1. Verify JWT token is stored in localStorage
2. Check Authorization header format
3. Verify protect middleware is working
4. Check user role is set correctly
```

### Enable Debug Logging

```javascript
// Add to server.js
const debug = require('debug')('shopzie:orders');

// In orderController.js
debug('Creating order for user:', req.user.id);
debug('Cart items:', cart.items);
debug('Validating stock...', product.stock);
```

**View logs:**
```bash
DEBUG=shopzie:* npm start
```

---

## 📱 Frontend Testing

### Browser DevTools

**Check Network Tab:**
1. Look for POST /api/orders request
2. Verify 201 status code
3. Check response body has order data
4. Verify request headers include JWT

**Check Console:**
1. No JavaScript errors
2. Proper API responses logged
3. Error handling messages appear

**Check Storage:**
1. JWT token stored in localStorage
2. User info available
3. Cart cleared after order

### Mobile Testing

**Test on Mobile Devices:**
```
✓ buttons clickable (48px+ minimum)
✓ tables responsive (card layout on mobile)
✓ modals fit screen
✓ forms easy to fill
✓ pagination works
✓ no horizontal scroll
```

---

## 🔄 API Testing with Postman

### Setup Collection

**1. Create Environment Variables:**
```json
{
  "base_url": "http://localhost:5000",
  "customer_token": "eyJhbGc...",
  "shopkeeper_token": "eyJhbGc...",
  "order_id": "6543a1b2c3d4e5f6g7h8i9j0"
}
```

**2. Import Request Collection:**
```json
{
  "info": {
    "name": "Order Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0"
  },
  "item": [
    {
      "name": "Create Order",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{customer_token}}"
          }
        ],
        "url": "{{base_url}}/api/orders"
      }
    },
    {
      "name": "Get My Orders",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{customer_token}}"
          }
        ],
        "url": "{{base_url}}/api/orders/my-orders?page=1&limit=10"
      }
    }
  ]
}
```

---

## 📊 Database Verification

### Check Order Model in MongoDB

```javascript
// In MongoDB shell
use shopzie_db

// Check if orders collection exists
db.orders.find().count()

// View sample order
db.orders.findOne()

// Check indexes
db.orders.getIndexes()

// Verify references
db.orders.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "customer",
      foreignField: "_id",
      as: "customerData"
    }
  }
])
```

### Expected Schema
```javascript
{
  _id: ObjectId(),
  orderNumber: "ORD-2025-12-001",
  customer: ObjectId(),
  items: [
    {
      product: ObjectId(),
      productName: String,
      quantity: Number,
      price: Number,
      shopkeeper: ObjectId()
    }
  ],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: String,
  paymentStatus: String,
  orderStatus: String,
  totalAmount: Number,
  totalItems: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Deployment Steps

### 1. Backend Deployment

```bash
# Install dependencies (if needed)
npm install mongoose bcryptjs express-validator

# Start server
npm start

# Verify order routes are registered
curl http://localhost:5000/api/orders/my-orders \
  -H "Authorization: Bearer token"
```

### 2. Frontend Deployment

```bash
# Ensure files are in correct location
- frontend/orders.html
- frontend/seller-dashboard.html

# Update API_BASE_URL in config
# Test on local server
# Deploy to production server
```

### 3. Database Deployment

```bash
# Create indexes for performance
db.orders.createIndex({ customer: 1, createdAt: -1 })
db.orders.createIndex({ orderNumber: 1 }, { unique: true })
db.orders.createIndex({ "items.shopkeeper": 1 })

# Backup database
mongodump --db shopzie_db
```

---

## 📈 Performance Optimization

### Database Indexes
```javascript
// Already recommended in Order model
db.orders.createIndex({ customer: 1 })           // For customer orders
db.orders.createIndex({ "items.shopkeeper": 1 }) // For shopkeeper orders
db.orders.createIndex({ orderStatus: 1 })        // For filtering
db.orders.createIndex({ createdAt: -1 })         // For sorting
```

### Query Optimization
```javascript
// Use projection to return only needed fields
Order.find({ customer: userId })
  .select('orderNumber totalAmount orderStatus createdAt')
  .limit(10)

// Use aggregate for statistics
Order.aggregate([
  { $match: { "items.shopkeeper": shopkeeperId } },
  { $group: { 
      _id: "$orderStatus", 
      count: { $sum: 1 } 
    }
  }
])
```

### Frontend Optimization
```javascript
// Lazy load order details
// Cache order list locally
// Implement virtual scrolling for large lists
// Debounce pagination requests
```

---

## ✅ Final Checklist

- [ ] Backend API endpoints tested and working
- [ ] Frontend pages created and linked
- [ ] Database schema verified
- [ ] Authentication working for both roles
- [ ] Order creation flow tested
- [ ] Order history displays correctly
- [ ] Shopkeeper dashboard shows received orders
- [ ] Status updates work for shopkeepers
- [ ] Stock management working
- [ ] Cart cleared after order
- [ ] Pagination working
- [ ] Filters working
- [ ] Error messages clear
- [ ] Mobile responsive
- [ ] All data persists correctly
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Deployment ready

---

## 📞 Support

For issues or questions:
1. Check API Reference documentation
2. Review error messages in console
3. Check database for data integrity
4. Enable debug logging
5. Test with Postman
6. Review MongoDB queries

---

**Version**: 1.0.0  
**Last Updated**: December 22, 2025  
**Status**: Ready for Deployment ✅
