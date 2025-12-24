# ME-SHOPZ Frontend - Complete Documentation

## 📋 Overview

A modern, responsive frontend application for the Me-Shopz e-commerce platform built with vanilla HTML, CSS, and JavaScript. Supports both customer and shopkeeper roles with comprehensive product browsing, shopping cart, and seller dashboard functionality.

---

## 📁 Project Structure

```
frontend/
├── index.html                 # Home page with product listing
├── login.html                 # User login page
├── signup.html                # User registration page
├── product-detail.html        # Product details page
├── cart.html                  # Shopping cart page
├── dashboard.html             # Shopkeeper dashboard
├── add-product.html           # Add new product form
├── edit-product.html          # Edit product form
├── css/
│   └── main.css              # Global styles & components
├── js/
│   ├── utils.js              # API, DOM, formatting utilities
│   ├── validators.js         # Form validation & utilities
│   ├── navbar.js             # Navbar component
│   └── footer.js             # Footer component
```

---

## 🎨 Styling System

### CSS Variables

All colors, spacing, and typography are defined as CSS variables in `main.css`:

```css
:root {
  --primary: #3498db;              /* Main blue */
  --secondary: #e74c3c;            /* Red accent */
  --success: #27ae60;              /* Green */
  --danger: #e74c3c;               /* Error red */
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  
  --font-size-base: 16px;
  --font-size-sm: 14px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
}
```

### Utility Classes

Quick styling with utility classes:

```html
<!-- Margins -->
<div class="mt-3 mb-2 p-4">Content</div>

<!-- Text -->
<p class="text-center text-lg text-muted">Muted text</p>

<!-- Layout -->
<div class="flex gap-2">Flex container</div>
<div class="grid grid-3">3-column grid</div>

<!-- Visibility -->
<div class="hidden">Hidden element</div>
```

---

## 📄 Pages

### 1. Home Page (`index.html`)

**Features:**
- Product grid with filtering and sorting
- Category, price range, and sort filters
- Product cards with pricing and ratings
- Pagination (9 products per page)
- Add to cart and wishlist functionality
- Search functionality
- Responsive design

**Key Functions:**
```javascript
loadProducts()           // Load products from API or mock data
applyFilters()          // Apply active filters
displayProducts()       // Render product cards
addToCart(productId)    // Add item to cart
toggleWishlist(id)      // Add/remove from wishlist
goToPage(pageNum)       // Navigate pagination
```

### 2. Product Detail Page (`product-detail.html`)

**Features:**
- Large product image
- Detailed product information
- Price and discount display
- Quantity selector
- Add to cart and wishlist buttons
- Product specifications
- Customer reviews section

**Key Functions:**
```javascript
loadProduct()          // Load product from API
displayProduct(data)   // Display product details
addToCart()            // Add to shopping cart
toggleWishlist()       // Toggle wishlist status
```

### 3. Login Page (`login.html`)

**Features:**
- Email and password fields
- Remember me option
- Form validation
- Error handling
- Forgot password link
- Sign up link
- Redirect on success

**Key Functions:**
```javascript
form.addEventListener('submit', handleLogin)
Validators.email()     // Validate email format
Validators.required()  // Validate required fields
```

### 4. Signup Page (`signup.html`)

**Features:**
- First/Last name fields
- Email and phone input
- Password strength meter
- Customer/Shopkeeper role selector
- Shopkeeper-specific fields (shop name, license)
- Terms agreement checkbox
- Form validation

**Key Components:**
```javascript
selectRole(role)                      // Switch between roles
PasswordStrengthMeter                 // Password strength indicator
new FormValidator(form)               // Multi-field validation
```

### 5. Shopping Cart (`cart.html`)

**Features:**
- List all items in cart
- Quantity adjustment
- Item removal
- Order summary (subtotal, tax, total)
- Proceed to checkout button
- Continue shopping link
- Empty cart state

**Key Functions:**
```javascript
loadCart()             // Load cart from localStorage
renderCartItems()      // Display cart items
updateQuantity()       // Adjust item quantity
removeItem()           // Delete item from cart
updateSummary()        // Recalculate totals
checkout()             // Proceed to checkout
```

### 6. Shopkeeper Dashboard (`dashboard.html`)

**Features:**
- Sales overview with key metrics
- Recent orders table
- Product management section
- Order history
- Analytics placeholder
- Shop settings form
- Responsive sidebar navigation

**Sections:**
- Overview: Key stats (products, orders, revenue, rating)
- Products: Product list with edit/delete actions
- Orders: Order history and status
- Analytics: Sales analytics (coming soon)
- Settings: Shop configuration

**Key Functions:**
```javascript
switchTab(tabName)     // Switch between sections
deleteProduct(id)      // Remove product
loadDashboard()        // Load dashboard data
```

### 7. Add Product (`add-product.html`)

**Features:**
- Comprehensive product form
- Image upload with preview
- Drag & drop image upload
- Price and discount fields
- Stock management
- Category selection
- Brand, color, material specs
- SEO fields (meta title, description)
- Tags input
- Form validation

**Form Sections:**
- Basic Information
- Pricing & Inventory
- Product Images
- Specifications
- SEO & Visibility

**Key Functions:**
```javascript
new ImageUploadHandler()   // Handle image uploads
new FormValidator()        // Validate all fields
validateForm()             // Submit and validate
apiPost('/products', data)  // Create product
```

### 8. Edit Product (`edit-product.html`)

**Features:**
- Pre-filled form with product data
- All fields from add product
- Status selector (active/inactive/draft)
- Danger zone with delete button
- Update functionality
- Product deletion with confirmation

**Additional Features:**
- Load existing product data
- Status badge display
- Permanent deletion warning
- Form state management

---

## 🎛️ Components

### Navbar Component (`js/navbar.js`)

**Features:**
- Logo and branding
- Search functionality
- Cart badge with count
- User menu (login/logout)
- Role-based menu items
- Mobile hamburger menu
- Responsive design

**HTML Structure:**
```html
<nav class="navbar">
  <div class="navbar-brand">ME-SHOPZ</div>
  <div class="navbar-search">Search bar</div>
  <div class="navbar-menu">
    Cart icon
    User dropdown menu
  </div>
</nav>
```

**Methods:**
```javascript
new Navbar()                  // Initialize navbar
navbar.updateUserMenu()       // Update based on auth state
navbar.handleLogout()         // Logout handler
Navbar.updateCartCount()      // Update cart badge
```

### Footer Component (`js/footer.js`)

**Features:**
- About section with social links
- Quick links
- Customer service links
- Contact information
- Newsletter subscription
- Payment methods display
- Copyright information

**HTML Structure:**
```html
<footer class="footer">
  <section>About</section>
  <section>Quick Links</section>
  <section>Customer Service</section>
  <section>Contact</section>
  <section>Newsletter</section>
  <section>Payment Methods</section>
  <section>Copyright</section>
</footer>
```

---

## 🔧 Utilities

### API Utilities (`js/utils.js`)

**Functions:**

```javascript
// API Requests
apiRequest(endpoint, options)  // Base fetch wrapper
apiGet(endpoint)               // GET request
apiPost(endpoint, body)        // POST request
apiPut(endpoint, body)         // PUT request
apiDelete(endpoint)            // DELETE request
handleTokenExpired()           // Handle 401 errors

// Authentication
getCurrentUser()               // Get logged-in user
getToken()                     // Get JWT token
isLoggedIn()                   // Check auth state
getUserRole()                  // Get user role (customer/shopkeeper)
isCustomer()                   // Is customer?
isShopkeeper()                 // Is shopkeeper?
requireLogin()                 // Redirect if not logged in
requireRole(role)              // Redirect if wrong role

// DOM Manipulation
el(selector)                   // querySelector shortcut
elAll(selector)                // querySelectorAll shortcut
byId(id)                       // getElementById shortcut
createElement(tag, class, attrs) // Create element
on(selector, event, callback)  // Add event listener
onClick(selector, callback)    // Add click listener
show/hide/toggle(selector)     // Toggle visibility
addClass/removeClass()         // Manage classes
setText/setHTML()              // Set content
getFormData(form)              // Get form as object
setFormData(form, data)        // Fill form with data
clearForm(form)                // Reset form
showLoading(selector)          // Show spinner
showAlert(message, type)       // Show alert
confirm(message)               // Confirm dialog

// Formatting
formatPrice(number)            // Format as currency
formatDate(date)               // Format date
formatDateTime(date)           // Format date & time
truncate(text, length)         // Truncate text
slugify(text)                  // Convert to slug

// Storage
Storage.set(key, value)        // Save to localStorage
Storage.get(key)               // Get from localStorage
Storage.remove(key)            // Delete from localStorage
Storage.clear()                // Clear all
```

### Form Validators (`js/validators.js`)

**Validator Functions:**

```javascript
Validators.email(value)              // Email validation
Validators.password(value)           // Min 8 chars
Validators.passwordMatch(p1, p2)     // Password match
Validators.phone(value)              // Phone validation
Validators.required(value)           // Required field
Validators.minLength(value, length)  // Min length
Validators.maxLength(value, length)  // Max length
Validators.number(value)             // Must be > 0
Validators.url(value)                // Valid URL
Validators.fileSize(file, maxMB)     // File size check
Validators.fileType(file, types)     // File type check
```

**FormValidator Class:**

```javascript
const validator = new FormValidator('#formId');

// Add rules
validator.addRule('email', v => Validators.email(v), 'Invalid email');
validator.addRule('password', v => Validators.password(v), 'Min 8 chars');

// Validate
if (validator.validate()) {
  // Form is valid
}

// Get errors
validator.getErrors('email')        // Get field errors
validator.getAllErrors()            // Get all errors
```

**PasswordStrengthMeter Class:**

```javascript
const meter = new PasswordStrengthMeter('#passwordInput', '#meterDisplay');

// Methods
meter.calculateStrength(password)   // Get strength (0-5)
meter.getStrengthLabel(strength)    // Get text label
meter.getStrengthColor(strength)    // Get color
meter.updateStrength()              // Update display
```

**ImageUploadHandler Class:**

```javascript
const handler = new ImageUploadHandler('#fileInput', '#previewDiv', 5); // 5MB max

// Methods
handler.handleFileSelect(event)     // Handle file selection
handler.getFile()                   // Get selected file
handler.clear()                     // Clear preview
```

---

## 🔐 Authentication Flow

### Login Process

1. User fills login form
2. Form validation occurs
3. API POST to `/auth/login`
4. Token and user data stored in localStorage
5. User redirected to home

### Signup Process

1. User selects role (customer/shopkeeper)
2. Fills form with validation
3. API POST to `/auth/signup`
4. Token stored, user redirected
5. Shopkeeper redirected to dashboard

### Protected Routes

```javascript
// Check if logged in
if (!isLoggedIn()) {
  window.location.href = '/login.html';
}

// Check role
requireRole('shopkeeper'); // Only shopkeepers can access
```

---

## 💾 Local Storage

**Data stored in localStorage:**

```javascript
// Authentication
localStorage.token              // JWT token
localStorage.user               // User object (JSON)

// Shopping
localStorage.cart               // Array of cart items
localStorage.wishlist           // Array of wishlist IDs

// Preferences
localStorage.userPreferences    // User preferences
localStorage.newsletter_subscribers // Newsletter list
localStorage.apiUrl             // API base URL
```

**Access via Storage utility:**

```javascript
Storage.set('key', value)  // Save
Storage.get('key')         // Retrieve
Storage.remove('key')      // Delete
Storage.clear()            // Clear all
```

---

## 📱 Responsive Design

**Breakpoints:**

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

**Responsive Classes:**

```html
<!-- Grid -->
<div class="grid grid-3">3 columns (auto-responsive)</div>

<!-- Form -->
<div class="form-row">2 columns (1 on mobile)</div>

<!-- Navigation -->
<nav class="navbar">Auto mobile menu</nav>
```

---

## 🚀 Getting Started

### Installation

```bash
# Navigate to frontend
cd frontend

# No build process needed - just serve files
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server

# Or using VS Code Live Server
# Right-click index.html -> Open with Live Server
```

### Configuration

Create `.env` file or set via JavaScript:

```javascript
// Set API URL
localStorage.setItem('apiUrl', 'http://localhost:5000/api');

// Or hardcode in utils.js
const API_BASE_URL = 'http://localhost:5000/api';
```

### First Steps

1. **Open index.html** - Browse products
2. **Add to cart** - Add items to shopping cart
3. **Signup** - Create account (customer or shopkeeper)
4. **Login** - Login with credentials
5. **Dashboard** - Access shopkeeper features (if shopkeeper)

---

## 🧪 Testing

### Manual Testing

```javascript
// Test API calls
apiGet('/products').then(r => console.log(r));

// Test localStorage
Storage.set('test', 'data');
console.log(Storage.get('test'));

// Test validators
Validators.email('test@example.com');  // true
Validators.password('short');          // false

// Test DOM utilities
el('#productName').textContent = 'Test Product';
showAlert('Test message', 'success');
```

### Browser Console

```javascript
// Check authentication
isLoggedIn()
getCurrentUser()
getUserRole()

// Check cart
Storage.get('cart')
Storage.get('wishlist')

// Reset data
Storage.clear()
```

---

## 📊 Performance Tips

1. **Lazy Load Images**: Load images only when visible
2. **Debounce Search**: Delay API calls while typing
3. **Cache Products**: Store products in memory
4. **Minimize Reflows**: Batch DOM updates
5. **Use Event Delegation**: Single listener for many elements

---

## 🐛 Common Issues

### Issue: Cart not showing items
**Solution**: Check localStorage in browser DevTools
```javascript
Storage.get('cart')  // Should return array of items
```

### Issue: API calls failing
**Solution**: Check API URL and CORS
```javascript
// Check URL
console.log(API_BASE_URL);

// Check API is running
curl http://localhost:5000/api/products
```

### Issue: Authentication not working
**Solution**: Verify token is being stored
```javascript
// Check token
console.log(localStorage.getItem('token'));
```

---

## 📞 Support

For issues or questions:

1. Check browser console for errors
2. Verify API is running
3. Clear localStorage and reload
4. Check network tab in DevTools
5. Review console logs

---

## ✨ Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| Product Listing | ✅ | index.html |
| Product Details | ✅ | product-detail.html |
| Shopping Cart | ✅ | cart.html |
| User Authentication | ✅ | login.html, signup.html |
| Shopkeeper Dashboard | ✅ | dashboard.html |
| Add Products | ✅ | add-product.html |
| Edit Products | ✅ | edit-product.html |
| Form Validation | ✅ | validators.js |
| Responsive Design | ✅ | main.css |
| Mobile Menu | ✅ | navbar.js |
| Image Upload | ✅ | validators.js |
| Search | ✅ | index.html |
| Filtering | ✅ | index.html |
| Sorting | ✅ | index.html |
| Pagination | ✅ | index.html |

---

## 📈 Future Enhancements

- [ ] Dark mode toggle
- [ ] User reviews and ratings
- [ ] Wishlist page
- [ ] Order history
- [ ] Payment integration
- [ ] Email notifications
- [ ] Real-time notifications
- [ ] Advanced search filters
- [ ] Product recommendations
- [ ] Analytics dashboard

---

**Version:** 1.0
**Last Updated:** December 2025
**Status:** Production Ready
