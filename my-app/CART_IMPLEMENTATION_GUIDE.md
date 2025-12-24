# Shopping Cart Implementation Guide

## Overview

Complete shopping cart system with:
- **Frontend**: localStorage persistence + backend API sync
- **Backend**: MongoDB storage with automatic calculations
- **Features**: Add/remove items, quantity management, total calculation, free shipping

---

## Backend Architecture

### Models

#### Cart Schema (`backend/models/Cart.js`)
```javascript
cartSchema = {
  user: ObjectId,              // Reference to user
  items: [
    {
      product: ObjectId,       // Reference to product
      quantity: Number,        // Item quantity
      price: Number           // Price at time of adding
    }
  ],
  totalPrice: Number,          // Auto-calculated
  totalItems: Number,          // Auto-calculated
  timestamps: true
}
```

### API Endpoints

#### GET /api/cart
Get user's cart
```javascript
// Response
{
  success: true,
  cart: {
    _id: "...",
    user: "...",
    items: [
      {
        product: {
          _id: "...",
          name: "Product Name",
          price: 99.99,
          images: ["..."],
          stock: 10
        },
        quantity: 2,
        price: 99.99
      }
    ],
    totalPrice: 199.98,
    totalItems: 2
  }
}
```

#### POST /api/cart/add
Add item to cart
```javascript
// Request body
{
  productId: "...",
  quantity: 2
}

// Response
{
  success: true,
  message: "Item added to cart",
  cart: { ... }
}
```

#### PUT /api/cart/update
Update item quantity
```javascript
// Request body
{
  productId: "...",
  quantity: 5
}

// Response
{
  success: true,
  message: "Cart updated successfully",
  cart: { ... }
}
```

#### DELETE /api/cart/remove/:productId
Remove item from cart
```javascript
// Response
{
  success: true,
  message: "Item removed from cart",
  cart: { ... }
}
```

#### DELETE /api/cart/clear
Clear entire cart
```javascript
// Response
{
  success: true,
  message: "Cart cleared successfully",
  cart: { items: [], totalPrice: 0, totalItems: 0 }
}
```

---

## Frontend Architecture

### CartService Class

Main service handling all cart operations with automatic sync.

#### Initialization
```javascript
// Initialize (automatic on page load)
const cartService = new CartService()

// API_BASE_URL: http://localhost:5000/api
// Auto-sync interval: 5 seconds
// Persists to localStorage with key 'cart'
```

### Local Cart Storage

#### Structure
```javascript
{
  id: string,              // Product ID
  name: string,            // Product name
  price: number,           // Original price
  discountPrice: number,   // Current/discount price
  image: string,           // Emoji or image URL
  seller: string,          // Seller name
  quantity: number,        // Quantity in cart
  stock: number,           // Available stock
  addedAt: timestamp       // When added to cart
}
```

#### Get Local Cart
```javascript
const items = cartService.getLocalCart()
// Returns: Array of cart items from localStorage
```

#### Add to Local Cart
```javascript
cartService.addToLocalCart(productId, quantity, productData)
// Adds item to localStorage
// Updates quantity if item exists
```

#### Update Local Cart Item
```javascript
cartService.updateLocalCartItem(productId, newQuantity)
// Updates quantity of existing item
```

#### Remove from Local Cart
```javascript
cartService.removeFromLocalCart(productId)
// Removes item from cart
```

#### Clear Local Cart
```javascript
cartService.clearLocalCart()
// Removes all items from localStorage
```

### Backend Cart Operations

#### Get Cart from Backend
```javascript
const result = await cartService.getBackendCart()
// Returns: { success: true, cart: {...} }
// Or: { success: false, error: "..." }
```

#### Add to Backend Cart
```javascript
const result = await cartService.addToBackendCart(
  productId,    // Product ID
  quantity,     // Quantity to add
  productData   // Product details (optional)
)
// Falls back to localStorage if not authenticated
```

#### Update Backend Cart Item
```javascript
const result = await cartService.updateBackendCartItem(
  productId,    // Product ID
  newQuantity   // New quantity
)
```

#### Remove from Backend Cart
```javascript
const result = await cartService.removeFromBackendCart(productId)
```

#### Clear Backend Cart
```javascript
const result = await cartService.clearBackendCart()
```

### Cart Synchronization

#### Auto-Sync with Backend
```javascript
// Called automatically:
// - On page visibility change
// - On cart update
// - Before checkout

// Syncs local cart items that aren't in backend
await cartService.syncWithBackend()
```

#### Sync Backend to Local
```javascript
// Called after successful backend operations
cartService.syncBackendToLocal(backendCart)
// Converts MongoDB structure to localStorage format
```

### Cart Calculations

#### Calculate Summary
```javascript
const summary = cartService.calculateSummary()
// Returns:
{
  subtotal: 99.99,      // Sum of (price × quantity)
  tax: 9.99,            // 10% of subtotal
  shipping: 0,          // 0 if subtotal > $100, else $10
  total: 109.98,        // subtotal + tax + shipping
  itemCount: 2          // Total items
}
```

#### Calculate Savings
```javascript
const savings = cartService.calculateSavings()
// Returns: Sum of (original - discountPrice) × quantity
// Example: 20 (savings on two items)
```

#### Validate Cart
```javascript
const validation = await cartService.validateCart()
// Returns:
{
  isValid: true,        // All items available
  errors: [],           // Out of stock items, etc
  warnings: []          // Low stock warnings
}
```

#### Get Order Data (for Checkout)
```javascript
const orderData = cartService.getOrderData()
// Returns:
{
  items: [
    { product: "...", quantity: 2, price: 99.99 },
    ...
  ],
  subtotal: 99.99,
  tax: 9.99,
  shipping: 0,
  totalAmount: 109.98,
  itemCount: 2
}
```

---

## Usage Examples

### Add to Cart from Product Page

```javascript
// Simple add
addToCart(productId)

// With quantity
addToCart(productId, 2)

// With full product data
const product = {
  name: "Wireless Headphones",
  price: 99.99,
  discountPrice: 79.99,
  image: "🎧",
  seller: "TechStore",
  stock: 10
}
addToCart(productId, 1, product)
```

### Display Cart Summary

```javascript
function displayCart() {
  const summary = cartService.calculateSummary()
  const savings = cartService.calculateSavings()
  
  console.log(`Subtotal: $${summary.subtotal}`)
  console.log(`Tax: $${summary.tax}`)
  console.log(`Shipping: ${summary.shipping === 0 ? 'FREE' : '$' + summary.shipping}`)
  console.log(`Total: $${summary.total}`)
  console.log(`You save: $${savings}`)
}
```

### Sync Cart on Login

```javascript
// After successful login:
async function handleLoginSuccess(user) {
  localStorage.setItem('token', user.token)
  localStorage.setItem('user', JSON.stringify(user))
  
  // Sync cart with backend
  await cartService.syncWithBackend()
  
  // Notify app of updates
  window.dispatchEvent(new Event('cartUpdated'))
}
```

### Checkout with Validation

```javascript
async function prepareCheckout() {
  // Validate items are still available
  const validation = await cartService.validateCart()
  
  if (!validation.isValid) {
    validation.errors.forEach(error => {
      console.error(error)
    })
    return false
  }
  
  // Get order data
  const orderData = cartService.getOrderData()
  
  // Send to checkout page or API
  sessionStorage.setItem('orderData', JSON.stringify(orderData))
  window.location.href = 'checkout.html'
}
```

### Update Cart Item Quantity

```javascript
async function changeQuantity(productId, newQty) {
  const result = await cartService.updateBackendCartItem(
    productId,
    newQty
  )
  
  if (result.success) {
    // Reload cart UI
    loadCartPage()
  }
}
```

### Remove Item from Cart

```javascript
async function removeCartItem(productId) {
  if (!confirm('Remove this item?')) return
  
  const result = await cartService.removeFromBackendCart(productId)
  
  if (result.success) {
    // Item removed
    console.log('Item removed')
  }
}
```

---

## Frontend Integration

### HTML Page Template

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <!-- Content -->

  <!-- Scripts in order -->
  <script src="js/utils.js"></script>
  <script src="js/validators.js"></script>
  <script src="js/navbar.js"></script>
  <script src="js/footer.js"></script>
  <script src="js/cart-service.js"></script>
  <script src="js/add-to-cart.js"></script>

  <script>
    // Page logic here
  </script>
</body>
</html>
```

### Add to Cart Button

```html
<button onclick="addToCart('123', 1, {
  name: 'Product Name',
  price: 99.99,
  image: '🎧',
  seller: 'Store Name',
  stock: 10
})">
  Add to Cart
</button>
```

### Listen for Cart Updates

```javascript
window.addEventListener('cartUpdated', (event) => {
  const { count, total, items } = event.detail
  console.log(`Cart updated: ${count} items, $${total}`)
  
  // Update UI here
})
```

---

## Authentication & Cart

### Before Login
- Cart stored in localStorage only
- No synchronization with backend
- Items persist across page loads
- Lost after browser clear (local storage cleared)

### After Login
- Cart syncs with MongoDB backend
- Local items sent to backend
- Updates to backend reflected locally
- Cart persists even if localStorage cleared

### Login Flow with Cart

```javascript
// 1. User adds items while browsing (logged out)
// → Items stored in localStorage

// 2. User logs in
// → Token stored in localStorage
// → isLoggedIn() returns true

// 3. Next cart operation
// → Detects auth token
// → Syncs localStorage items to backend
// → Future operations use backend API

// 4. User logs out
// → Token cleared
// → Cart reverts to localStorage only
```

---

## Mobile Responsiveness

### Cart Page Layout
- Desktop: 2-column (items + summary sidebar)
- Mobile: 1-column (items, then summary)
- Summary sticky on desktop, static on mobile
- Buttons full width on mobile

### Touch Interactions
- Larger touch targets (28px buttons)
- Confirmed deletions
- Toast notifications for feedback

---

## Performance Optimization

### Caching
```javascript
// Cart recalculated on every:
// - Item addition
// - Quantity change
// - Item removal

// Not stored separately (always computed from items)
// Keeps data consistent
```

### Network
```javascript
// API calls made only when:
// - User authenticated
// - User explicitly acts (add/remove/update)

// NOT made on:
// - Page load (uses localStorage)
// - Automatic sync (debounced)
```

### Storage
```javascript
// localStorage < 5KB typical
// One cart per browser
// JSON stringified for storage
```

---

## Error Handling

### Network Errors
```javascript
// If API call fails:
// 1. Falls back to localStorage
// 2. Returns { success: false, local: true }
// 3. Retry on next operation
```

### Stock Validation
```javascript
// Checked on:
// - Adding item
// - Updating quantity
// - Before checkout

// Returns error if:
// - Product out of stock
// - Quantity exceeds stock
```

### Deleted Products
```javascript
// Detected on checkout validation
// Removed from cart
// User notified
```

---

## Testing Checklist

- [ ] Add item to cart
- [ ] Update item quantity
- [ ] Remove item
- [ ] Clear cart
- [ ] Login with items in cart
- [ ] Validate checkout
- [ ] Test free shipping (>$100)
- [ ] Test tax calculation (10%)
- [ ] Mobile quantity controls
- [ ] Mobile touch interactions
- [ ] Network error fallback
- [ ] Browser back button
- [ ] Page refresh persistence

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Cart empty after refresh | localStorage cleared | Sync with backend after login |
| Quantity wrong | Input not validated | Check min/max bounds |
| Can't checkout | Not authenticated | Require login, redirect |
| API errors ignored | Wrong error handling | Always check result.success |
| Double items | Sync conflicts | Merge logic on duplicate |

---

## Future Enhancements

1. **Cart Expiration**: Clear cart items older than 30 days
2. **Save for Later**: Move items to wishlist temporarily
3. **Recommendations**: Suggest products based on cart
4. **Bulk Operations**: Add multiple items at once
5. **Cart Sharing**: Share cart link with friends
6. **Price Tracking**: Alert when prices change
7. **Abandoned Cart**: Email reminders
8. **Cart Recovery**: Recover from browser history

---

**Last Updated**: December 2025
**Status**: Production Ready ✅
