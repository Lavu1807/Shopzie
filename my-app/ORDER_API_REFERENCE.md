# Order Management System - API Reference

## Quick Reference Table

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| POST | `/api/orders` | ✓ JWT | customer | Create new order |
| GET | `/api/orders/my-orders` | ✓ JWT | customer | Get customer's orders |
| GET | `/api/orders/received` | ✓ JWT | shopkeeper | Get received orders |
| GET | `/api/orders/:id` | ✓ JWT | both | Get order details |
| PUT | `/api/orders/:id/status` | ✓ JWT | shopkeeper | Update order status |

---

## API Documentation

### 1. POST /api/orders - Create Order

**Description:** Place a new order from customer's cart

**Authentication:** Required (JWT Bearer Token)

**Authorization:** Customer role only

**Request Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States"
  },
  "paymentMethod": "COD",
  "notes": "Leave at door"
}
```

**Request Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| shippingAddress | Object | Yes | Delivery address |
| shippingAddress.street | String | Yes | Street address |
| shippingAddress.city | String | Yes | City name |
| shippingAddress.state | String | Yes | State/Province |
| shippingAddress.zipCode | String | Yes | Postal code |
| shippingAddress.country | String | Yes | Country name |
| paymentMethod | String | No | COD, Card, UPI, Net Banking (default: COD) |
| notes | String | No | Order notes (max 500 chars) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "6543a1b2c3d4e5f6g7h8i9j0",
    "orderNumber": "ORD-2025-12-001",
    "customer": {
      "_id": "5432f1e2d3c4b5a6f7e8d9c0",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "items": [
      {
        "_id": "6543a1b2c3d4e5f6g7h8i9j1",
        "product": "5432f1e2d3c4b5a6f7e8d9c1",
        "productName": "Laptop Computer",
        "quantity": 1,
        "price": 999.99,
        "shopkeeper": "5432f1e2d3c4b5a6f7e8d9c2"
      }
    ],
    "shippingAddress": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "United States"
    },
    "paymentMethod": "COD",
    "paymentStatus": "Pending",
    "orderStatus": "Pending",
    "totalAmount": 999.99,
    "totalItems": 1,
    "notes": "Leave at door",
    "createdAt": "2025-12-22T10:30:00Z",
    "updatedAt": "2025-12-22T10:30:00Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing or invalid address:
```json
{
  "success": false,
  "message": "Complete shipping address is required"
}
```

**400 Bad Request** - Cart is empty:
```json
{
  "success": false,
  "message": "Cart is empty"
}
```

**400 Bad Request** - Product unavailable:
```json
{
  "success": false,
  "message": "Product Laptop is no longer available"
}
```

**400 Bad Request** - Insufficient stock:
```json
{
  "success": false,
  "message": "Insufficient stock for Laptop"
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Example cURL Request:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "paymentMethod": "COD",
    "notes": "Leave at door"
  }'
```

---

### 2. GET /api/orders/my-orders - Get Customer Orders

**Description:** Retrieve all orders placed by the authenticated customer

**Authentication:** Required (JWT Bearer Token)

**Authorization:** Customer role only

**Request Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | Number | 1 | Page number for pagination |
| limit | Number | 10 | Orders per page |

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "total": 15,
  "totalPages": 2,
  "currentPage": 1,
  "orders": [
    {
      "_id": "6543a1b2c3d4e5f6g7h8i9j0",
      "orderNumber": "ORD-2025-12-001",
      "customer": "5432f1e2d3c4b5a6f7e8d9c0",
      "items": [
        {
          "product": {
            "_id": "5432f1e2d3c4b5a6f7e8d9c1",
            "name": "Laptop Computer",
            "images": ["..."]
          },
          "productName": "Laptop Computer",
          "quantity": 1,
          "price": 999.99
        }
      ],
      "totalAmount": 999.99,
      "totalItems": 1,
      "orderStatus": "Delivered",
      "createdAt": "2025-12-22T10:30:00Z"
    }
  ]
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Example JavaScript Fetch:**
```javascript
const response = await fetch(
  'http://localhost:5000/api/orders/my-orders?page=1&limit=10',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
const data = await response.json();
console.log(data.orders);
```

---

### 3. GET /api/orders/received - Get Shopkeeper Orders

**Description:** Get all orders containing products from the authenticated shopkeeper

**Authentication:** Required (JWT Bearer Token)

**Authorization:** Shopkeeper role only

**Request Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | Number | 1 | Page number for pagination |
| limit | Number | 20 | Orders per page |

**Response (200 OK):**
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "totalPages": 2,
  "currentPage": 1,
  "orders": [
    {
      "_id": "6543a1b2c3d4e5f6g7h8i9j0",
      "orderNumber": "ORD-2025-12-001",
      "customer": {
        "_id": "5432f1e2d3c4b5a6f7e8d9c0",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "items": [
        {
          "product": {
            "_id": "5432f1e2d3c4b5a6f7e8d9c1",
            "name": "Laptop Computer",
            "images": ["..."]
          },
          "productName": "Laptop Computer",
          "quantity": 1,
          "price": 999.99,
          "shopkeeper": "5432f1e2d3c4b5a6f7e8d9c2"
        }
      ],
      "totalAmount": 999.99,
      "orderStatus": "Pending",
      "createdAt": "2025-12-22T10:30:00Z"
    }
  ]
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

### 4. GET /api/orders/:id - Get Order Details

**Description:** Get detailed information about a specific order

**Authentication:** Required (JWT Bearer Token)

**Authorization:** Customer (if their order) or Shopkeeper (if has items in order)

**Request Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | MongoDB ObjectId of the order |

**Response (200 OK):**
```json
{
  "success": true,
  "order": {
    "_id": "6543a1b2c3d4e5f6g7h8i9j0",
    "orderNumber": "ORD-2025-12-001",
    "customer": {
      "_id": "5432f1e2d3c4b5a6f7e8d9c0",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "items": [
      {
        "product": {
          "_id": "5432f1e2d3c4b5a6f7e8d9c1",
          "name": "Laptop Computer",
          "images": ["..."],
          "price": 999.99
        },
        "productName": "Laptop Computer",
        "quantity": 1,
        "price": 999.99,
        "shopkeeper": {
          "_id": "5432f1e2d3c4b5a6f7e8d9c2",
          "name": "Tech Store",
          "email": "tech@store.com"
        }
      }
    ],
    "shippingAddress": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "United States"
    },
    "paymentMethod": "COD",
    "paymentStatus": "Pending",
    "orderStatus": "Pending",
    "totalAmount": 999.99,
    "totalItems": 1,
    "notes": "Leave at door",
    "createdAt": "2025-12-22T10:30:00Z",
    "updatedAt": "2025-12-22T10:30:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Not authorized to view this order"
}
```

---

### 5. PUT /api/orders/:id/status - Update Order Status

**Description:** Update the status of an order (Shopkeeper only)

**Authentication:** Required (JWT Bearer Token)

**Authorization:** Shopkeeper role, must have items in the order

**Request Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | MongoDB ObjectId of the order |

**Request Body:**
```json
{
  "status": "Shipped"
}
```

**Request Body Parameters:**
| Parameter | Type | Required | Valid Values |
|-----------|------|----------|--------------|
| status | String | Yes | Processing, Shipped, Delivered, Cancelled |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "_id": "6543a1b2c3d4e5f6g7h8i9j0",
    "orderNumber": "ORD-2025-12-001",
    "orderStatus": "Shipped",
    "updatedAt": "2025-12-22T11:00:00Z"
  }
}
```

**Error Response (400 Bad Request) - Missing status:**
```json
{
  "success": false,
  "message": "Status is required"
}
```

**Error Response (400 Bad Request) - Invalid status:**
```json
{
  "success": false,
  "message": "Invalid status"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Not authorized to update this order"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/orders/6543a1b2c3d4e5f6g7h8i9j0/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Shipped"
  }'
```

---

## Status Flow

```
Pending
    ↓
Processing (Shopkeeper updates)
    ↓
Shipped (Shopkeeper updates)
    ↓
Delivered (Shopkeeper updates)

Cancelled (Can be set at any point)
```

---

## Frontend Integration Examples

### JavaScript Fetch Examples

**Create Order:**
```javascript
async function createOrder(shippingAddress, paymentMethod = 'COD', notes = '') {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      shippingAddress,
      paymentMethod,
      notes
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Usage
const order = await createOrder({
  street: '123 Main St',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  country: 'USA'
});
```

**Get Customer Orders:**
```javascript
async function getMyOrders(page = 1, limit = 10) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/orders/my-orders?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
}

// Usage
const { orders, totalPages } = await getMyOrders(1, 10);
```

**Get Shopkeeper Orders:**
```javascript
async function getReceivedOrders(page = 1, limit = 20) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/orders/received?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
}
```

**Update Order Status:**
```javascript
async function updateOrderStatus(orderId, newStatus) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/orders/${orderId}/status`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Usage
await updateOrderStatus('6543a1b2c3d4e5f6g7h8i9j0', 'Shipped');
```

---

## Rate Limiting

| Endpoint | Rate Limit |
|----------|-----------|
| POST /api/orders | 10 requests/hour |
| GET /api/orders/* | 100 requests/hour |
| PUT /api/orders/*/status | 50 requests/hour |

---

## Webhook Events (Future)

```javascript
// Events that could trigger webhooks:
- order.created
- order.status_changed
- order.shipped
- order.delivered
- order.cancelled

// Webhook payload example:
{
  "event": "order.created",
  "timestamp": "2025-12-22T10:30:00Z",
  "order": {
    "_id": "...",
    "orderNumber": "ORD-2025-12-001",
    "totalAmount": 999.99
  }
}
```

---

## Testing Checklist

- [ ] Create order with valid shipping address
- [ ] Test order creation with empty cart (should fail)
- [ ] Test with insufficient stock (should fail)
- [ ] Verify stock is updated after order creation
- [ ] Verify cart is cleared after order creation
- [ ] Get customer orders with pagination
- [ ] Get shopkeeper orders with pagination
- [ ] View order details as customer
- [ ] View order details as shopkeeper
- [ ] Update order status as shopkeeper
- [ ] Verify unauthorized access is blocked
- [ ] Test all valid status transitions
- [ ] Test invalid status (should fail)
- [ ] Verify only shopkeeper's items show in their dashboard

---

**Version**: 1.0.0  
**Last Updated**: December 22, 2025  
**Status**: Production Ready ✅
