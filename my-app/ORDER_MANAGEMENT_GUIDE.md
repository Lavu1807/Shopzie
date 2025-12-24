# Order Management System - Complete Documentation

## 📋 Overview

The order management system is a complete solution for order placement, tracking, and management with role-based access for customers and shopkeepers. The system provides:

- **Order Placement**: Customers can place orders from their cart
- **Order History**: Customers view their order history with filtering and pagination
- **Shopkeeper Dashboard**: Sellers view received orders and update status
- **Real-time Synchronization**: Order status updates reflect immediately
- **Detailed Tracking**: Complete order lifecycle from pending to delivered

---

## 🏗️ Architecture

### Database Schema

#### Order Model
```javascript
{
  orderNumber: String (unique),
  customer: ObjectId (ref: User),
  items: [
    {
      product: ObjectId (ref: Product),
      productName: String,
      quantity: Number,
      price: Number,
      shopkeeper: ObjectId (ref: User)
    }
  ],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: String (COD, Card, UPI, Net Banking),
  paymentStatus: String (Pending, Completed, Failed),
  orderStatus: String (Pending, Processing, Shipped, Delivered, Cancelled),
  totalAmount: Number,
  totalItems: Number,
  notes: String,
  timestamps: true
}
```

### Data Flow Diagram

```
Customer Flow:
┌─────────────┐
│ Shopping    │
│ Cart        │
└──────┬──────┘
       │ Checkout
       ↓
┌─────────────┐      ┌──────────────┐
│ Checkout    │─────→│ Validate     │
│ Page        │      │ - Stock      │
└──────┬──────┘      │ - Address    │
       │              └──────────────┘
       │ Submit Order (POST /api/orders)
       ↓
┌─────────────┐
│ Order       │
│ Created     │
└──────┬──────┘
       │
       └─→ Stock Updated
       │
       └─→ Cart Cleared
       │
       └─→ Order Confirmation
       │
       ↓
┌──────────────────────┐
│ Order History        │
│ (GET /api/orders/    │
│  my-orders)          │
└──────────────────────┘

Shopkeeper Flow:
┌──────────────┐
│ Received     │
│ Orders       │
│ (GET /api/   │
│  orders/     │
│  received)   │
└──────┬───────┘
       │ View Order
       ↓
┌──────────────┐
│ Order        │
│ Details      │
└──────┬───────┘
       │ Update Status
       │ (PUT /api/orders/:id/status)
       ↓
┌──────────────┐
│ Status       │
│ Updated      │
└──────────────┘
```

---

## 🔌 API Endpoints

### 1. Create Order (Customer)
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "COD",
  "notes": "Please deliver on weekends"
}

Response (201 Created):
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "...",
    "orderNumber": "ORD-2025-12-001",
    "customer": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [
      {
        "product": "...",
        "productName": "Laptop",
        "quantity": 1,
        "price": 999.99,
        "shopkeeper": "..."
      }
    ],
    "totalAmount": 999.99,
    "totalItems": 1,
    "orderStatus": "Pending",
    "paymentStatus": "Pending",
    "createdAt": "2025-12-22T10:00:00Z"
  }
}

Error Responses:
- 400: Cart empty, insufficient stock, product unavailable, incomplete address
- 401: Unauthorized
```

### 2. Get My Orders (Customer)
```http
GET /api/orders/my-orders?page=1&limit=10
Authorization: Bearer <token>

Query Parameters:
- page: Page number (default: 1)
- limit: Orders per page (default: 10)

Response (200 OK):
{
  "success": true,
  "count": 5,
  "total": 15,
  "totalPages": 2,
  "currentPage": 1,
  "orders": [
    {
      "_id": "...",
      "orderNumber": "ORD-2025-12-001",
      "customer": "...",
      "items": [...],
      "totalAmount": 999.99,
      "orderStatus": "Delivered",
      "createdAt": "2025-12-20T10:00:00Z"
    }
  ]
}

Error Responses:
- 401: Unauthorized
```

### 3. Get Received Orders (Shopkeeper)
```http
GET /api/orders/received?page=1&limit=20
Authorization: Bearer <token>
Role: shopkeeper

Query Parameters:
- page: Page number (default: 1)
- limit: Orders per page (default: 20)

Response (200 OK):
{
  "success": true,
  "count": 10,
  "total": 25,
  "totalPages": 2,
  "currentPage": 1,
  "orders": [
    {
      "_id": "...",
      "orderNumber": "ORD-2025-12-001",
      "customer": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "product": "...",
          "productName": "Laptop",
          "quantity": 1,
          "price": 999.99,
          "shopkeeper": "..."
        }
      ],
      "totalAmount": 999.99,
      "orderStatus": "Pending",
      "createdAt": "2025-12-22T10:00:00Z"
    }
  ]
}

Error Responses:
- 401: Unauthorized
- 403: Not a shopkeeper
```

### 4. Get Order Details
```http
GET /api/orders/:orderId
Authorization: Bearer <token>

Path Parameters:
- orderId: MongoDB ObjectId of the order

Response (200 OK):
{
  "success": true,
  "order": {
    "_id": "...",
    "orderNumber": "ORD-2025-12-001",
    "customer": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "items": [
      {
        "product": {
          "_id": "...",
          "name": "Laptop",
          "images": ["..."],
          "price": 999.99
        },
        "productName": "Laptop",
        "quantity": 1,
        "price": 999.99,
        "shopkeeper": {
          "_id": "...",
          "name": "Tech Store",
          "email": "tech@store.com"
        }
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "totalAmount": 999.99,
    "totalItems": 1,
    "orderStatus": "Pending",
    "paymentStatus": "Pending",
    "paymentMethod": "COD",
    "notes": "Please deliver on weekends",
    "createdAt": "2025-12-22T10:00:00Z"
  }
}

Error Responses:
- 401: Unauthorized
- 403: Not authorized to view this order
- 404: Order not found
```

### 5. Update Order Status (Shopkeeper)
```http
PUT /api/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json
Role: shopkeeper

Path Parameters:
- orderId: MongoDB ObjectId of the order

Request Body:
{
  "status": "Shipped"  // or Processing, Delivered, Cancelled
}

Response (200 OK):
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "_id": "...",
    "orderNumber": "ORD-2025-12-001",
    "orderStatus": "Shipped",
    "updatedAt": "2025-12-22T11:00:00Z"
  }
}

Error Responses:
- 400: Status required or invalid status
- 401: Unauthorized
- 403: Not authorized to update this order
- 404: Order not found
```

---

## 🎯 Frontend Features

### Customer Order History Page (`orders.html`)

**Features:**
- Display all customer orders with pagination
- Filter orders by status (All, Pending, Processing, Shipped, Delivered)
- View order details in modal
- Reorder items directly
- Real-time status updates
- Responsive design for mobile

**Key Functions:**
```javascript
// Load orders with pagination
async function loadOrders(page = 1)

// Filter orders by status
function filterOrders(status)

// Show order details modal
async function showOrderDetails(orderId)

// Reorder items from previous order
async function reorderItems(orderId)

// Render pagination controls
function renderPagination(total, totalPages)
```

**Component Structure:**
```
┌─ Header
├─ Filter Section
├─ Orders List
│  ├─ Order Card (per order)
│  │  ├─ Order Number & Date
│  │  ├─ Status Badge
│  │  ├─ Items List
│  │  ├─ Order Total
│  │  └─ Action Buttons (View, Reorder)
│  └─ Empty State
├─ Pagination
└─ Modal (Order Details)
```

**CSS Classes:**
- `.order-card`: Individual order display
- `.order-status`: Status badge with color coding
- `.order-item`: Item in order
- `.modal`: Detail modal
- `.pagination`: Pagination controls

### Shopkeeper Received Orders Dashboard (`seller-dashboard.html`)

**Features:**
- View all received orders in table format
- Real-time statistics (pending, processing, shipped, delivered counts)
- Filter orders by status
- Update order status for received orders
- View detailed order information per shopkeeper
- Only shows items from the shopkeeper's products
- Pagination support

**Key Functions:**
```javascript
// Load received orders
async function loadOrders(page = 1)

// Update order statistics
function updateStatistics()

// Filter orders by status
function filterOrders(status)

// View order details
async function showOrderDetails(orderId)

// Open status update modal
function openStatusModal(orderId)

// Save new order status
async function saveOrderStatus()
```

**Component Structure:**
```
┌─ Header
├─ Statistics Cards (5 cards)
├─ Filter Section
├─ Orders Table
│  ├─ Table Headers
│  └─ Table Rows (per order)
├─ Pagination
├─ Order Details Modal
└─ Status Update Modal
```

**CSS Classes:**
- `.stat-card`: Statistics card
- `.orders-table`: Main table
- `.order-status`: Status badge
- `.action-buttons`: Action button group

---

## 🔐 Security Features

### Authentication & Authorization
```javascript
// All endpoints require JWT token
Authorization: Bearer <token>

// Role-based access control
- POST /api/orders → customer only
- GET /api/orders/my-orders → customer only
- GET /api/orders/received → shopkeeper only
- PUT /api/orders/:id/status → shopkeeper only
- GET /api/orders/:id → customer or shopkeeper (with product in order)
```

### Data Protection
```javascript
// Stock Validation
- Verify product is active
- Check stock availability before order creation
- Update stock atomically when order is placed

// User Isolation
- Customers only see their own orders
- Shopkeepers only see orders containing their products
- Order details hidden from unauthorized users

// Price Protection
- Product price stored at time of purchase
- Customer cannot manipulate price
- Shopkeeper updates validated server-side
```

---

## 💾 Database Relations

```
User (Customer)
  ↓
Order
  ↓
  ├─ Product (items[].product)
  ├─ User (items[].shopkeeper)
  └─ User (customer)

Cart
  ↓
  └─ Product (items[].product)
      ↓
      └─ User (shopkeeper)
```

### Referential Integrity
```javascript
// Order references
- customer: User._id (required)
- items[].product: Product._id (required)
- items[].shopkeeper: User._id (required)

// On order creation:
1. Verify cart exists and belongs to user
2. Verify each product is active
3. Verify stock is sufficient
4. Create order with references
5. Update product stock
6. Clear cart

// On order deletion (future):
- Restore stock if order cancelled
- Keep order history for audit trail
```

---

## 🔄 Workflow Examples

### Complete Order Flow (Customer)

```javascript
// 1. Customer browsing products
GET /api/products

// 2. Add items to cart
POST /api/cart/add

// 3. Go to checkout
GET /frontend/checkout.html

// 4. Fill shipping address and payment method
POST /api/orders
{
  shippingAddress: {...},
  paymentMethod: "COD",
  notes: "..."
}

// 5. Order created
- Order stored in MongoDB
- Stock updated for each product
- Cart cleared
- Redirect to confirmation

// 6. View order history
GET /api/orders/my-orders

// 7. View order details
GET /api/orders/:orderId

// 8. Reorder items
- Get order items
- Add to cart
- Redirect to checkout
```

### Shopkeeper Order Management Flow

```javascript
// 1. Shopkeeper logs in
POST /api/auth/login (role: "shopkeeper")

// 2. View received orders
GET /api/orders/received?page=1&limit=20

// 3. Filter by status
// (Frontend-side filtering)

// 4. View specific order details
GET /api/orders/:orderId

// 5. Update order status
PUT /api/orders/:orderId/status
{
  status: "Shipped"
}

// 6. Track statistics
- Count orders by status
- Display metrics dashboard
- Monitor pending orders
```

---

## 🎨 UI Components

### Order Status Badges

```
Pending → Yellow background (#fff3cd)
Processing → Blue background (#cfe2ff)
Shipped → Cyan background (#d1ecf1)
Delivered → Green background (#d4edda)
Cancelled → Red background (#f8d7da)
```

### Order Cards (Customer)

```
┌─────────────────────────────────┐
│ Order #123456  | Status: Pending│
│ Dec 22, 2025   | Status Badge   │
├─────────────────────────────────┤
│ Item 1: Qty 2  │ $199.98        │
│ Item 2: Qty 1  │ $99.99         │
├─────────────────────────────────┤
│ Total: $299.97                  │
│ [View Details] [Reorder]        │
└─────────────────────────────────┘
```

### Order Table (Shopkeeper)

```
┌──────────────────────────────────────┐
│ Order ID │ Customer  │ Items │ Amount │
├──────────────────────────────────────┤
│ #123456  │ John Doe  │ 2     │ $199.98│
│ #123457  │ Jane Smith│ 3     │ $299.97│
│ #123458  │ Bob Jones │ 1     │ $99.99 │
└──────────────────────────────────────┘
```

---

## 📊 Statistics & Metrics

### Order Status Distribution
```javascript
{
  pending: 5,      // Orders awaiting processing
  processing: 3,   // Orders being prepared
  shipped: 8,      // Orders in transit
  delivered: 25,   // Completed orders
  cancelled: 2     // Cancelled orders
}
```

### Revenue Metrics
```javascript
{
  totalRevenue: 5499.50,    // Sum of all order amounts
  averageOrderValue: 165.74, // totalRevenue / orderCount
  totalOrders: 33,          // Total number of orders
  conversionRate: 2.5%      // Orders / visitors
}
```

---

## 🛠️ Configuration

### Environment Variables
```
API_BASE_URL=http://localhost:5000
ORDER_EXPIRY_DAYS=30          # Keep orders for 30 days
MAX_PAGE_SIZE=100             # Max orders per page
ORDER_NUMBER_PREFIX=ORD       # Order ID prefix
```

### Pagination Settings
```javascript
// Customer Orders
DEFAULT_PAGE_SIZE: 10
MAX_PAGE_SIZE: 50

// Shopkeeper Orders
DEFAULT_PAGE_SIZE: 20
MAX_PAGE_SIZE: 100
```

---

## ⚠️ Error Handling

### Common Errors & Solutions

```javascript
// 1. Cart Empty Error
Error: "Cart is empty"
Solution: Add items to cart before checkout

// 2. Insufficient Stock
Error: "Insufficient stock for Product X"
Solution: Reduce quantity or choose different product

// 3. Product Unavailable
Error: "Product X is no longer available"
Solution: Remove from cart and refresh products

// 4. Unauthorized Access
Error: "Not authorized to view this order"
Solution: Ensure user token is valid, correct user logged in

// 5. Invalid Status Update
Error: "Invalid status"
Valid values: Pending, Processing, Shipped, Delivered, Cancelled

// 6. Network Error
Error: Failed to load orders
Solution: Check internet connection, retry with exponential backoff
```

### Fallback Strategies
```javascript
// If API fails
- Show cached data from previous load
- Display error message with retry button
- Queue status updates and retry when online
- Show loading state with spinner

// If authorization fails
- Redirect to login page
- Clear invalid token
- Prompt user to re-authenticate
```

---

## 📱 Mobile Responsiveness

### Breakpoints
```css
/* Desktop: 1024px+ */
- Full table view with all columns
- Sidebar statistics
- Multi-column layout

/* Tablet: 768px - 1023px */
- Compact table with essential columns
- Stacked statistics (2 columns)
- Adjusted padding/margins

/* Mobile: < 768px */
- Card layout instead of table
- Single column stack
- Full-width buttons
- Simplified modals
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All API endpoints tested with Postman/Insomnia
- [ ] Frontend pages tested on mobile devices
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] API error handling verified
- [ ] Database backups configured
- [ ] CORS settings verified

### Production Settings
- [ ] API_BASE_URL set to production server
- [ ] JWT secret keys configured
- [ ] Database connection pooling enabled
- [ ] Rate limiting configured
- [ ] Logging enabled
- [ ] Error monitoring (Sentry) configured

### Post-Deployment
- [ ] Monitor order creation rate
- [ ] Check error logs for issues
- [ ] Verify email notifications sent
- [ ] Test payment gateway integration
- [ ] Set up automated backups
- [ ] Configure monitoring alerts

---

## 📚 Additional Resources

### Related Files
- [Cart Implementation Guide](CART_IMPLEMENTATION_GUIDE.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Security Guide](SECURITY_GUIDE.md)
- [Database Schema](DATABASE_SCHEMA.md)

### Technologies Used
- MongoDB: Database
- Express.js: Backend framework
- Node.js: Runtime environment
- JWT: Authentication
- Mongoose: ODM (Object Data Modeling)

---

**Version**: 1.0.0  
**Last Updated**: December 22, 2025  
**Status**: Production Ready ✅
