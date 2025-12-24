# Shopping Cart - Quick Reference

## 🚀 Quick Start

### Backend Running?
```bash
cd backend && npm run dev
# Should show: ✅ MongoDB connected & 🚀 Server running on port 5000
```

### Frontend Includes
```html
<script src="js/cart-service.js"></script>
<script src="js/add-to-cart.js"></script>
```

---

## 📦 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/add` | Add item |
| PUT | `/api/cart/update` | Update quantity |
| DELETE | `/api/cart/remove/:id` | Remove item |
| DELETE | `/api/cart/clear` | Clear cart |

**All endpoints require**: `Authorization: Bearer TOKEN`

---

## 🛒 Core Functions

### Add to Cart
```javascript
addToCart(productId, quantity = 1, productData = {})
```

### Get Cart
```javascript
const items = cartService.getLocalCart()
```

### Update Quantity
```javascript
cartService.updateBackendCartItem(productId, newQuantity)
```

### Remove Item
```javascript
cartService.removeFromBackendCart(productId)
```

### Get Summary
```javascript
const summary = cartService.calculateSummary()
// Returns: { subtotal, tax, shipping, total, itemCount }
```

### Clear Cart
```javascript
cartService.clearBackendCart()
```

---

## 📊 Calculations

```javascript
// Subtotal = sum of (price × quantity)
subtotal: 199.98

// Tax = subtotal × 0.10
tax: 19.998

// Shipping
shipping: 0          // FREE if subtotal > $100
shipping: 10         // $10 otherwise

// Total = subtotal + tax + shipping
total: 219.978
```

---

## 🔐 Authentication & Cart

| State | Storage | Sync |
|-------|---------|------|
| Not Logged In | localStorage | No |
| Logging In | localStorage → MongoDB | Yes |
| Logged In | MongoDB | Yes |
| Logging Out | MongoDB → localStorage | No |

---

## 📲 Pages

| Page | Path | Purpose |
|------|------|---------|
| Cart | `/cart.html` | View cart items |
| Checkout | `/checkout.html` | Place order |
| Confirmation | `/order-confirmation.html` | Order placed ✓ |

---

## ✅ Testing URLs

```
Home (Add to cart):       http://localhost:3000/index.html
View Cart:                http://localhost:3000/cart.html
Checkout:                 http://localhost:3000/checkout.html
Order Confirmation:       http://localhost:3000/order-confirmation.html

API Health:               http://localhost:5000/api/health
Get Cart (auth required): http://localhost:5000/api/cart
```

---

## 🐛 Troubleshooting

### Cart Empty After Refresh
- ❌ Not logged in yet
- ✅ Solution: Log in to sync with backend

### API Returns 401
- ❌ Invalid/missing token
- ✅ Solution: Log in again, check token in localStorage

### Quantities Not Updating
- ❌ API call failed silently
- ✅ Solution: Check browser console, verify API running

### Checkout Shows Wrong Total
- ❌ Discount prices not set
- ✅ Solution: Check product data has `discountPrice`

### Mobile Buttons Not Clickable
- ❌ CSS not loaded properly
- ✅ Solution: Check `css/styles.css` path, hard refresh

---

## 💾 localStorage Keys

```javascript
localStorage.getItem('cart')          // Cart items array
localStorage.getItem('token')         // JWT token
localStorage.getItem('user')          // User object
localStorage.getItem('wishlist')      // Wishlist items (if available)
```

---

## 🎯 Workflow Examples

### Example 1: Customer Journey
```
1. Browse products → Add to cart (localStorage)
2. Click "Cart" → View items
3. Click "Checkout" → Redirected to login
4. Login → Cart syncs to MongoDB
5. Fill shipping/payment → Click "Place Order"
6. See confirmation ✓
```

### Example 2: Returning Customer
```
1. Login → Cart loads from MongoDB
2. Add more items → Auto-syncs
3. Go to cart → See all items
4. Update quantities → Recalculate total
5. Checkout → Create order
```

### Example 3: Error Recovery
```
1. Network error on add → Falls back to localStorage
2. User continues browsing
3. API recovers → Auto-syncs next operation
4. No data loss ✓
```

---

## 📋 Common Tasks

### Display Cart Count in Navbar
```javascript
const count = cartService.getLocalCartCount()
document.getElementById('cartBadge').textContent = count
```

### Format Price
```javascript
const formatted = (99.99).toFixed(2)  // "99.99"
const displayed = `$${formatted}`      // "$99.99"
```

### Check if Item in Cart
```javascript
const item = cartService.getLocalCart()
  .find(item => item.id === productId)
const inCart = !!item
```

### Calculate Discount Percent
```javascript
const savings = item.price - item.discountPrice
const percent = (savings / item.price) * 100
```

---

## 🔧 Configuration

### Change API URL
```javascript
// In any page, before CartService init
window.API_BASE_URL = 'https://api.example.com'
```

### Adjust Tax Rate
In `cartService.calculateSummary()`:
```javascript
const tax = subtotal * 0.10  // Change 0.10 to your rate
```

### Adjust Free Shipping Threshold
In `cartService.calculateSummary()`:
```javascript
const shipping = subtotal > 100 ? 0 : 10  // Change 100
```

---

## 📞 Support Resources

- **Backend API**: `backend/controllers/cartController.js`
- **Frontend Service**: `frontend/js/cart-service.js`
- **Full Guide**: `CART_IMPLEMENTATION_GUIDE.md`
- **Integration Checklist**: `CART_INTEGRATION_CHECKLIST.md`

---

## ⚡ Performance Tips

1. **Minimize API Calls** - Sync is debounced
2. **Cache with localStorage** - Reduces load
3. **Lazy Load Images** - Optional optimization
4. **Minify JS/CSS** - For production
5. **Use CDN** - For static assets

---

## 🎨 Styling Tips

```css
/* Override colors */
--primary: #3498db;        /* Primary color */
--success: #27ae60;        /* Success/savings */
--danger: #e74c3c;         /* Errors/remove */

/* Adjust spacing */
gap: 30px;                 /* Item spacing */
padding: 20px;             /* Container padding */

/* Responsive breakpoint */
@media (max-width: 768px)  /* Mobile devices */
```

---

## 🔒 Security Notes

✅ **Enabled**
- JWT authentication on all cart endpoints
- Password hashing for users
- CORS protection
- Input validation

❌ **Not Enabled (Implement if needed)**
- HTTPS (add in production)
- Rate limiting on checkout
- ReCAPTCHA on signup
- Two-factor authentication

---

## 📈 Analytics Tracking

Add this to cart operations:
```javascript
// Track add to cart
console.log('ADD_TO_CART', { productId, quantity, price })

// Track checkout
console.log('CHECKOUT', { total, itemCount, shippingMethod })

// Track order
console.log('ORDER_PLACED', { orderId, totalAmount })
```

Send to analytics service (Google Analytics, Mixpanel, etc)

---

## 🚀 Deploy Checklist

- [ ] Database backups configured
- [ ] API_BASE_URL set to production
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Error logging setup
- [ ] HTTPS enabled
- [ ] Assets minified
- [ ] Cache headers set
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented

---

## 📚 Documentation Files

1. **CART_COMPLETE_SUMMARY.md** - Full overview
2. **CART_IMPLEMENTATION_GUIDE.md** - Detailed guide
3. **CART_INTEGRATION_CHECKLIST.md** - Verification checklist
4. **CART_QUICK_REFERENCE.md** - This file

---

**Last Updated**: December 22, 2025  
**Status**: Production Ready ✅
