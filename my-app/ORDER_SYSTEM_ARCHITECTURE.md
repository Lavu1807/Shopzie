# Order Management System - Visual Architecture Guide

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SHOPZIE MARKETPLACE                           │
│                    Order Management System v1.0                         │
└─────────────────────────────────────────────────────────────────────────┘

                            ┌─────────────────┐
                            │  CUSTOMER USER  │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              Browse         Add to Cart       Checkout
             Products          │              Page
                │              │                │
                ▼              ▼                ▼
         ┌──────────┐    ┌──────────┐    ┌──────────────┐
         │ Products │    │  CART    │    │ Shipping &   │
         │  Page    │    │  Page    │    │ Payment Form │
         └──────────┘    └──────────┘    └──────┬───────┘
                                                 │
                                    ┌────────────▼─────────────┐
                                    │   POST /api/orders       │
                                    │  (Create Order)          │
                                    └────────────┬─────────────┘
                                                 │
              ┌──────────────────┬───────────────┼──────────────┬─────────────┐
              │                  │               │              │             │
              ▼                  ▼               ▼              ▼             ▼
    ┌──────────────────┐ ┌──────────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
    │ Validate Stock   │ │ Create Order │ │ Update  │ │   Clear  │ │ Send to  │
    │ & Availability   │ │  in MongoDB  │ │ Product │ │   Cart   │ │ Customer │
    │                  │ │              │ │ Stock   │ │          │ │ Email    │
    └──────────────────┘ └──────────────┘ └─────────┘ └──────────┘ └──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Order Created!    │
                    │  Status: Pending    │
                    └──────────┬──────────┘
                               │
                         ┌─────▼──────┐
                         │ Confirmation
                         │  Page       │
                         └─────┬──────┘
                               │
                    ┌──────────▼──────────┐
                    │ GET /api/orders/    │
                    │ my-orders           │
                    └──────────┬──────────┘
                               │
                         ┌─────▼─────────┐
                         │ Order History │
                         │ Page          │
                         │ (orders.html) │
                         └───────────────┘

                            ┌─────────────────┐
                            │ SHOPKEEPER USER │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                 Login          Manage             View
                 │            Products           Orders
                 │              │                │
                 ▼              ▼                ▼
         ┌─────────────┐  ┌──────────────┐ ┌────────────────────────┐
         │   Login     │  │   Product    │ │ GET /api/orders/       │
         │   Page      │  │   Manager    │ │ received               │
         └─────────────┘  └──────────────┘ └────────────┬───────────┘
                                                        │
                                          ┌─────────────▼───────────────┐
                                          │  Seller Dashboard           │
                                          │  (seller-dashboard.html)    │
                                          └─────────────┬───────────────┘
                                                        │
                          ┌─────────────────────────────┼──────────────────────┐
                          │                             │                      │
                          ▼                             ▼                      ▼
                    ┌───────────────┐         ┌──────────────────┐    ┌──────────────┐
                    │   View Order  │         │  See Statistics  │    │ Update Order │
                    │   Details     │         │  - Pending       │    │ Status       │
                    │   (Modal)     │         │  - Processing    │    │              │
                    └───────────────┘         │  - Shipped       │    └──────────────┘
                                              │  - Delivered     │           │
                                              └──────────────────┘           │
                                                                             │
                                                        ┌────────────────────▼─────┐
                                                        │ PUT /api/orders/:id/      │
                                                        │ status                    │
                                                        │ {status: "Shipped"}       │
                                                        └────────────────────┬─────┘
                                                                             │
                                                        ┌────────────────────▼──────┐
                                                        │ Status Updated! Customer  │
                                                        │ sees new status in their  │
                                                        │ order history             │
                                                        └───────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
CUSTOMER FLOW                           SHOPKEEPER FLOW
═════════════════════════════════════════════════════════════════

Shopping Cart                           Received Orders
    │                                        │
    ├─ Add Items                            ├─ View All Orders
    │  └─ Store in DB                       │  └─ Filter by Status
    │                                        │
    ├─ Update Quantity                      ├─ See Statistics
    │  └─ Sync with Server                  │  ├─ Pending Count
    │                                        │  ├─ Processing Count
    └─ Remove Items                         │  ├─ Shipped Count
       └─ Update DB                         │  └─ Delivered Count
                │                           │
                ▼                           ▼
         Checkout Page                 Select Order
                │                           │
                ├─ Enter Address           ├─ View Details
                ├─ Select Payment          │  ├─ Customer Info
                └─ Review Total            │  ├─ Shipping Address
                │                          │  └─ Items
                │                          │
                ▼                          ▼
          Submit Order                 Update Status
           POST Request                    │
                │                         ├─ Processing
                ▼                         ├─ Shipped
         Validate Request                 ├─ Delivered
          ├─ Auth Check                   └─ Cancelled
          ├─ Address Check                 │
          ├─ Stock Check                   ▼
          └─ Cart Check              PUT Request
                │                         │
                ▼                         ▼
         Create Order           Update in Database
          ├─ Save to DB              │
          ├─ Update Stock            ▼
          ├─ Clear Cart         Customer Sees
          └─ Generate Number    Update in Their
                │               Order History
                ▼
          Order Created
         Status: Pending
                │
                ▼
         View Order History
          (orders.html)
                │
                ├─ See All Orders
                ├─ Filter by Status
                ├─ View Details
                └─ Reorder Items
```

---

## 🗄️ Database Schema Relations

```
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           USERS COLLECTION                          │  │
│  │  {                                                  │  │
│  │    _id: ObjectId,                                   │  │
│  │    name: String,                                    │  │
│  │    email: String,                                   │  │
│  │    password: String (hashed),                       │  │
│  │    role: "customer" | "shopkeeper",                │  │
│  │    phone: String,                                   │  │
│  │    address: {...}                                   │  │
│  │  }                                                  │  │
│  └────────────┬──────────────────────────────┬─────────┘  │
│               │                              │             │
│         (customer ref)                  (shopkeeper ref)   │
│               │                              │             │
│  ┌────────────▼──────────────┐  ┌───────────▼────────┐   │
│  │  ORDERS COLLECTION         │  │ PRODUCTS COLLECTION│   │
│  │  {                         │  │ {                  │   │
│  │    _id: ObjectId,          │  │   _id: ObjectId,   │   │
│  │    orderNumber: String,    │  │   name: String,    │   │
│  │    customer: Ref(User),    │  │   price: Number,   │   │
│  │    items: [{               │  │   stock: Number,   │   │
│  │      product: Ref(Prod),   │  │   images: Array,   │   │
│  │      productName: String,  │  │   description: Str │   │
│  │      quantity: Number,     │  │   shopkeeper: Ref  │   │
│  │      price: Number,        │  │   isActive: Bool   │   │
│  │      shopkeeper: Ref(User) │  │ }                  │   │
│  │    }],                     │  └────────────────────┘   │
│  │    shippingAddress: {...}, │          ▲                │
│  │    orderStatus: String,    │          │                │
│  │    totalAmount: Number,    │          │ (product ref)  │
│  │    createdAt: Date         │          │                │
│  │  }                         │          │                │
│  └────────────┬───────────────┴──────────┴─────────┐      │
│               │                                    │      │
│         (customer ref)                        (product ref)
│               │                                    │      │
│  ┌────────────▼──────────────┐  ┌─────────────────▼──┐   │
│  │   CARTS COLLECTION         │  │ STOCKS (future)    │   │
│  │   {                        │  │ (Track inventory)  │   │
│  │     _id: ObjectId,         │  └────────────────────┘   │
│  │     user: Ref(User),       │                           │
│  │     items: [{              │                           │
│  │       product: Ref(Prod),  │                           │
│  │       quantity: Number,    │                           │
│  │       price: Number        │                           │
│  │     }],                    │                           │
│  │     totalPrice: Number,    │                           │
│  │     totalItems: Number     │                           │
│  │   }                        │                           │
│  └────────────────────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

KEY RELATIONSHIPS:
─────────────────

1. User (Customer) → Many Orders
   └─ Each customer can have multiple orders

2. User (Shopkeeper) → Many Products
   └─ Each shopkeeper can sell multiple products

3. Order → Many Items
   └─ Each order can contain multiple products

4. Product → Referenced in Order Items
   └─ Tracks which shopkeeper owns the product

5. Order Item → Shopkeeper Reference
   └─ Knows which shopkeeper supplied each item

UNIQUE CONSTRAINTS:
──────────────────

• Order.orderNumber - Unique order identifier
• User.email - One email per user
• Cart.user - One cart per user (unique)
```

---

## 🔐 Security Architecture

```
┌────────────────────────────────────────────────────────┐
│               SECURITY LAYERS                          │
└────────────────────────────────────────────────────────┘

CLIENT SIDE
══════════════════════════════════════════════════════════
┌─ FORM VALIDATION
│  ├─ Check all fields filled
│  ├─ Validate email format
│  ├─ Check address format
│  └─ Validate quantities
│
├─ LOCAL STORAGE
│  ├─ Store JWT securely
│  ├─ No sensitive data stored
│  └─ Clear on logout
│
└─ HTTPS/TLS
   └─ Encrypt data in transit

NETWORK
══════════════════════════════════════════════════════════
┌─ API GATEWAY
│  ├─ Rate limiting
│  ├─ Request validation
│  └─ CORS enforcement
│
└─ MIDDLEWARE
   ├─ CORS headers
   ├─ Security headers
   └─ Request logging

SERVER SIDE
══════════════════════════════════════════════════════════
┌─ AUTHENTICATION
│  ├─ JWT token generation
│  ├─ Token validation
│  └─ Token expiration
│
├─ AUTHORIZATION
│  ├─ Role checking (customer vs shopkeeper)
│  ├─ Resource ownership (user's orders only)
│  └─ Item ownership (shopkeeper's items only)
│
├─ DATA VALIDATION
│  ├─ Schema validation
│  ├─ Business logic validation
│  └─ Stock verification
│
├─ ENCRYPTION
│  ├─ Password hashing (bcrypt)
│  ├─ Sensitive data encryption
│  └─ Data at rest encryption (future)
│
└─ AUDIT LOGGING
   ├─ All requests logged
   ├─ Status changes tracked
   └─ Error logging

DATABASE
══════════════════════════════════════════════════════════
┌─ ACCESS CONTROL
│  ├─ User isolation queries
│  ├─ Role-based data access
│  └─ Ownership verification
│
├─ DATA INTEGRITY
│  ├─ Unique constraints
│  ├─ Foreign key references
│  └─ Required fields
│
├─ BACKUP & RECOVERY
│  ├─ Daily backups
│  ├─ Point-in-time recovery
│  └─ Disaster recovery plan
│
└─ MONITORING
   ├─ Query performance
   ├─ Connection pooling
   └─ Anomaly detection
```

---

## 📊 API Gateway Flow

```
CLIENT REQUEST
    │
    ▼
┌─────────────────────┐
│  HTTPS Connection   │ ← Encrypted
└──────────┬──────────┘
           │
    ┌──────▼──────┐
    │  API Gateway│
    │  - CORS     │
    │  - Rate Limit
    │  - Logging  │
    └──────┬──────┘
           │
    ┌──────▼──────────────┐
    │  Express Router     │
    │  /api/orders/:route │
    └──────┬──────────────┘
           │
    ┌──────▼──────────────────┐
    │  Middleware Stack       │
    │  - protect (JWT verify) │
    │  - authorize (role chk) │
    │  - validate (schema)    │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────┐
    │ Order Controller    │
    │ - Business logic    │
    │ - DB operations     │
    └──────┬──────────────┘
           │
    ┌──────▼──────────────┐
    │ Database (MongoDB)  │
    │ - Query/Update      │
    │ - Validation rules  │
    └──────┬──────────────┘
           │
    ┌──────▼──────────────┐
    │ Response Builder    │
    │ - Format response   │
    │ - Include relations │
    └──────┬──────────────┘
           │
    ┌──────▼──────────────┐
    │ Send Response       │
    │ - 200/201/400/401   │
    │ - JSON data         │
    └──────┬──────────────┘
           │
           ▼
    CLIENT RECEIVES
    ├─ Success: Order data
    └─ Error: Error message
```

---

## 🔄 Order Status State Machine

```
    ┌─────────────────────────────────────────────────┐
    │      ORDER STATUS STATE MACHINE                 │
    └─────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   PENDING    │ ← Initial state
                    │ (Order placed)
                    └───────┬──────┘
                            │
                    Shopkeeper updates
                    to "Processing"
                            │
                    ┌───────▼───────┐
                    │  PROCESSING   │
                    │(Being prepared)
                    └───────┬───────┘
                            │
                    Shopkeeper updates
                    to "Shipped"
                            │
                    ┌───────▼──────┐
                    │   SHIPPED    │
                    │(In transit)   │
                    └───────┬──────┘
                            │
                    Shopkeeper updates
                    to "Delivered"
                            │
                    ┌───────▼────────┐
                    │  DELIVERED     │ ← Final state
                    │(Order complete)│
                    └────────────────┘


    SPECIAL CASE: CANCELLATION
    ══════════════════════════════════════

                   ┌──────────────┐
                   │  ANY STATUS  │
                   └───────┬──────┘
                           │
                  Shopkeeper can cancel
                  at any point
                           │
                   ┌───────▼──────────┐
                   │  CANCELLED       │
                   │ (No longer valid)│
                   └──────────────────┘

    VALID TRANSITIONS
    ═════════════════

    Pending     → Processing, Shipped, Delivered, Cancelled
    Processing  → Shipped, Delivered, Cancelled
    Shipped     → Delivered, Cancelled
    Delivered   → (No transitions possible)
    Cancelled   → (No transitions possible)
```

---

## 📱 UI Component Hierarchy

```
CUSTOMER INTERFACE
══════════════════════════════════════════════════════

orders.html
├─ Header
│  ├─ Navigation
│  │  ├─ Logo
│  │  ├─ Home Link
│  │  └─ Orders Link (active)
│  └─ Cart Icon & Count
│
├─ Main Content
│  ├─ Page Title: "My Orders"
│  │
│  ├─ Filter Section
│  │  ├─ All Orders Button
│  │  ├─ Pending Button
│  │  ├─ Processing Button
│  │  ├─ Shipped Button
│  │  └─ Delivered Button
│  │
│  └─ Orders List
│     ├─ Order Card (repeating)
│     │  ├─ Order Header
│     │  │  ├─ Order Number
│     │  │  ├─ Order Date
│     │  │  └─ Status Badge
│     │  │
│     │  ├─ Items Section
│     │  │  └─ Item Row (per item)
│     │  │     ├─ Product Image
│     │  │     ├─ Product Name
│     │  │     ├─ Quantity
│     │  │     └─ Item Price
│     │  │
│     │  ├─ Order Footer
│     │  │  ├─ Total Amount
│     │  │  ├─ View Details Button
│     │  │  └─ Reorder Button
│     │  │
│     │  └─ Hover Effect
│     │
│     └─ Empty State (if no orders)
│        ├─ Icon (📦)
│        ├─ Message
│        └─ Shop Now Link
│
├─ Pagination
│  ├─ Previous Button
│  ├─ Page Numbers
│  └─ Next Button
│
├─ Order Detail Modal
│  ├─ Header
│  │  ├─ Title
│  │  └─ Close Button
│  │
│  ├─ Order Information
│  │  ├─ Order Number
│  │  ├─ Date
│  │  ├─ Status
│  │  └─ Payment Method
│  │
│  ├─ Items List
│  │  └─ Item Details
│  │
│  ├─ Shipping Address
│  │  └─ Full Address
│  │
│  ├─ Order Notes (if any)
│  │
│  ├─ Order Summary
│  │  ├─ Item Count
│  │  └─ Total Amount
│  │
│  └─ Close Buttons
│
└─ Footer
   ├─ About
   ├─ Links
   └─ Contact


SHOPKEEPER INTERFACE
══════════════════════════════════════════════════════

seller-dashboard.html
├─ Header
│  ├─ Navigation
│  │  ├─ Logo
│  │  ├─ Home Link
│  │  └─ Dashboard Link (active)
│  └─ Profile Dropdown
│
├─ Main Content
│  ├─ Page Title: "Received Orders"
│  │
│  ├─ Statistics Section
│  │  ├─ Stat Card 1
│  │  │  ├─ Label: "Total Orders"
│  │  │  └─ Number
│  │  ├─ Stat Card 2
│  │  │  ├─ Label: "Pending"
│  │  │  └─ Number
│  │  ├─ Stat Card 3
│  │  │  ├─ Label: "Processing"
│  │  │  └─ Number
│  │  ├─ Stat Card 4
│  │  │  ├─ Label: "Shipped"
│  │  │  └─ Number
│  │  └─ Stat Card 5
│  │     ├─ Label: "Delivered"
│  │     └─ Number
│  │
│  ├─ Filter Buttons
│  │  ├─ All Orders
│  │  ├─ Pending
│  │  ├─ Processing
│  │  ├─ Shipped
│  │  └─ Delivered
│  │
│  ├─ Orders Table
│  │  ├─ Table Header Row
│  │  │  ├─ Order ID
│  │  │  ├─ Customer Name
│  │  │  ├─ Items Count
│  │  │  ├─ Amount
│  │  │  ├─ Status
│  │  │  ├─ Date
│  │  │  └─ Actions
│  │  │
│  │  └─ Table Body Rows (per order)
│  │     ├─ Order ID (clickable)
│  │     ├─ Customer Name
│  │     ├─ Items Count Badge
│  │     ├─ Amount
│  │     ├─ Status Badge
│  │     ├─ Date
│  │     └─ Action Buttons
│  │        ├─ View Button
│  │        └─ Update Status Button
│  │
│  └─ Empty State (if no orders)
│     ├─ Icon (📭)
│     └─ Message
│
├─ Pagination
│  ├─ Previous Button
│  ├─ Page Numbers
│  └─ Next Button
│
├─ Order Detail Modal
│  ├─ Header
│  ├─ Order Information
│  ├─ Customer Information
│  ├─ Your Items (filtered)
│  ├─ Shipping Address
│  ├─ Order Notes
│  └─ Close Button
│
├─ Status Update Modal
│  ├─ Header
│  ├─ Status Dropdown
│  ├─ Cancel Button
│  └─ Update Button
│
└─ Footer
```

---

## 🧪 Testing Coverage Map

```
UNIT TESTS
═════════════════════════════════════
├─ API Endpoints (5 endpoints)
│  ├─ POST /api/orders
│  ├─ GET /api/orders/my-orders
│  ├─ GET /api/orders/received
│  ├─ GET /api/orders/:id
│  └─ PUT /api/orders/:id/status
│
├─ Validation
│  ├─ Address validation
│  ├─ Stock validation
│  ├─ Status validation
│  └─ Authorization checks
│
└─ Database Operations
   ├─ Create order
   ├─ Read orders
   ├─ Update status
   └─ Data integrity


INTEGRATION TESTS
═════════════════════════════════════
├─ Full Order Flow
│  ├─ Add to cart
│  ├─ Checkout
│  ├─ Create order
│  ├─ Verify stock updated
│  ├─ Verify cart cleared
│  └─ Verify order created
│
├─ Customer Journey
│  ├─ Login
│  ├─ View orders
│  ├─ Filter orders
│  ├─ View details
│  └─ Reorder items
│
├─ Shopkeeper Journey
│  ├─ Login
│  ├─ View received orders
│  ├─ See statistics
│  ├─ Update status
│  └─ Verify customer sees update
│
└─ Authorization
   ├─ Customer accessing shopkeeper endpoint
   ├─ Shopkeeper accessing customer endpoint
   ├─ Unauthorized user
   └─ Invalid token


UI TESTS
═════════════════════════════════════
├─ orders.html
│  ├─ Page loads
│  ├─ Orders display
│  ├─ Filtering works
│  ├─ Pagination works
│  ├─ Modal opens
│  ├─ Reorder works
│  └─ Mobile responsive
│
├─ seller-dashboard.html
│  ├─ Page loads
│  ├─ Statistics calculate
│  ├─ Table displays
│  ├─ Filtering works
│  ├─ Status update works
│  ├─ Modal opens
│  └─ Mobile responsive
│
└─ Error Handling
   ├─ Error messages display
   ├─ Toast notifications
   └─ Fallback UI states


PERFORMANCE TESTS
═════════════════════════════════════
├─ API Response Times
│  ├─ Create order: < 500ms
│  ├─ Get orders: < 200ms
│  ├─ Update status: < 150ms
│  └─ Get details: < 100ms
│
├─ Page Load
│  ├─ Initial load: < 2s
│  ├─ DOM render: < 500ms
│  └─ Data display: < 1s
│
└─ Database
   ├─ Query performance
   ├─ Index efficiency
   └─ Pagination speed
```

---

## 🚀 Deployment Pipeline

```
┌─────────────────────────────────────────────────────┐
│          CONTINUOUS DEPLOYMENT PIPELINE             │
└─────────────────────────────────────────────────────┘

LOCAL DEVELOPMENT
═════════════════════════════════════
    Code Changes
         │
         ▼
    Commit to Git
         │
         ▼
    Push to Repository


TESTING STAGE
═════════════════════════════════════
         │
         ▼
    ┌─────────────────┐
    │ Unit Tests      │
    │ - API endpoints │
    │ - Validation    │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ Integration Test│
    │ - Full flows    │
    │ - End-to-end    │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ Lint & Format   │
    │ - Code quality  │
    │ - Style guide   │
    └────────┬────────┘
             │
    Pass?   │
    ┌───────┴─────────┐
    │                 │
    YES              NO → Fix & Retest
    │
    ▼

STAGING DEPLOYMENT
═════════════════════════════════════
    ├─ Deploy to Staging Server
    ├─ Run Smoke Tests
    ├─ Performance Tests
    ├─ Manual Testing
    ├─ Security Scan
    └─ Approval Gate


PRODUCTION DEPLOYMENT
═════════════════════════════════════
    ├─ Deploy to Production
    ├─ Run Health Checks
    ├─ Monitor Performance
    ├─ Alert Setup
    ├─ Rollback Ready
    └─ Production Verified
         │
         ▼
    ✅ LIVE IN PRODUCTION
```

---

## 📈 Monitoring & Observability

```
┌─────────────────────────────────────────────────────┐
│     PRODUCTION MONITORING ARCHITECTURE              │
└─────────────────────────────────────────────────────┘

METRICS COLLECTION
═════════════════════════════════════
    ├─ Application Metrics
    │  ├─ API response times
    │  ├─ Error rates
    │  ├─ Request counts
    │  └─ Order volume
    │
    ├─ Database Metrics
    │  ├─ Query times
    │  ├─ Index usage
    │  ├─ Connection pool
    │  └─ Disk usage
    │
    ├─ System Metrics
    │  ├─ CPU usage
    │  ├─ Memory usage
    │  ├─ Network I/O
    │  └─ Disk I/O
    │
    └─ Business Metrics
       ├─ Orders/hour
       ├─ Revenue/hour
       ├─ Conversion rate
       └─ Cart abandonment


ALERTING RULES
═════════════════════════════════════
    ├─ Critical
    │  ├─ Database down
    │  ├─ API down
    │  └─ High error rate (>5%)
    │
    ├─ Warning
    │  ├─ Slow response (>500ms)
    │  ├─ Memory high (>80%)
    │  └─ Disk usage high (>85%)
    │
    └─ Info
       ├─ Deployment complete
       ├─ Backup completed
       └─ Scheduled maintenance


VISUALIZATION
═════════════════════════════════════
    ├─ Dashboards
    │  ├─ Real-time metrics
    │  ├─ Hourly trends
    │  └─ Daily reports
    │
    └─ Alerting
       ├─ Email notifications
       ├─ SMS notifications
       └─ Slack integration
```

---

**Complete visualization of the entire Order Management System architecture, flows, and infrastructure.**

*Version 1.0.0 | December 22, 2025*
