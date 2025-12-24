# Frontend Quick Reference

## 🎯 Common Tasks

### Add a New Page

1. Create `page-name.html` in frontend folder
2. Include scripts at bottom:
   ```html
   <script src="js/utils.js"></script>
   <script src="js/validators.js"></script>
   <script src="js/navbar.js"></script>
   <script src="js/footer.js"></script>
   ```
3. Add custom styles in `<style>` tag
4. Write logic in final `<script>` tag

### Make API Call

```javascript
// GET
const result = await apiGet('/products');
if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error);
}

// POST
const result = await apiPost('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
```

### Check Authentication

```javascript
if (!isLoggedIn()) {
  window.location.href = '/login.html';
}

// Only for shopkeepers
requireRole('shopkeeper');

// Get user data
const user = getCurrentUser();
const role = getUserRole();
```

### Show Alert Message

```javascript
showAlert('Success message', 'success');  // Green
showAlert('Error message', 'danger');     // Red
showAlert('Info message', 'info');        // Blue
showAlert('Warning message', 'warning');  // Orange
```

### Validate Form

```javascript
const validator = new FormValidator('#myForm');
validator.addRule('email', v => Validators.email(v), 'Invalid email');
validator.addRule('password', v => Validators.password(v), '8+ chars');

if (validator.validate()) {
  // Form is valid
}
```

### Store/Retrieve Data

```javascript
// Save
Storage.set('cart', [{id: 1, qty: 2}]);

// Get
const cart = Storage.get('cart') || [];

// Delete
Storage.remove('cart');

// Clear all
Storage.clear();
```

### Format Data

```javascript
formatPrice(99.99)      // "$99.99"
formatDate(new Date())  // "Dec 22, 2025"
formatDateTime(new Date()) // "Dec 22, 2025 10:30 AM"
truncate('Long text', 20) // "Long text..."
slugify('My Product')   // "my-product"
```

### DOM Manipulation

```javascript
// Select
el('#myId')              // querySelector
elAll('.myClass')        // querySelectorAll
byId('myId')             // getElementById

// Modify
setText('#myId', 'New text')
setHTML('#myId', '<strong>HTML</strong>')
show('#hidden')
hide('#visible')
toggle('#element')
addClass('#el', 'active')
removeClass('#el', 'active')

// Forms
getFormData('#myForm')   // {field: value}
setFormData('#myForm', {field: value})
clearForm('#myForm')
```

### Handle Images

```javascript
const handler = new ImageUploadHandler('#fileInput', '#previewDiv', 5);

// Get file
const file = handler.getFile();

// Clear
handler.clear();
```

### Create Elements

```javascript
const button = createElement('button', 'btn btn-primary', {
  id: 'myBtn',
  onclick: 'myFunction()'
});
```

---

## 🎨 CSS Classes Reference

### Layout
```html
<div class="container">Max width 1200px</div>
<div class="container-sm">Max width 800px</div>
<div class="flex gap-2">Flex with gap</div>
<div class="grid grid-3">3-column grid</div>
```

### Typography
```html
<h1>Heading 1</h1>
<p class="text-lg">Large text</p>
<p class="text-muted">Gray text</p>
<p class="text-bold">Bold text</p>
<p class="text-center">Centered</p>
```

### Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-sm">Small</button>
<button class="btn btn-lg">Large</button>
```

### Cards
```html
<div class="card">
  <div class="card-body">Content</div>
</div>

<div class="card">
  <div class="card-header">Header</div>
  <div class="card-body">Content</div>
  <div class="card-footer">Footer</div>
</div>
```

### Forms
```html
<form>
  <div class="form-group">
    <label>Label</label>
    <input type="text" />
  </div>
  <div class="form-row">
    <div class="form-group"><input /></div>
    <div class="form-group"><input /></div>
  </div>
</form>
```

### Spacing
```html
<!-- Margin top -->
<div class="mt-1">4px</div>
<div class="mt-2">8px</div>
<div class="mt-3">16px</div>
<div class="mt-4">24px</div>

<!-- Similar for: mb (margin-bottom), p (padding) -->
```

### Utilities
```html
<div class="hidden">Hidden</div>
<div class="text-muted">Muted color</div>
<div class="text-danger">Red text</div>
<div class="text-success">Green text</div>
<div class="shadow">Box shadow</div>
<div class="rounded">Rounded corners</div>
<div class="w-100">Full width</div>
```

### Alerts
```html
<div class="alert alert-success">Success</div>
<div class="alert alert-danger">Error</div>
<div class="alert alert-info">Info</div>
<div class="alert alert-warning">Warning</div>
```

### Badges
```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-danger">Danger</span>
```

---

## 📱 Page Quick Reference

### index.html
- Product grid with filters
- Add to cart button
- Product card component
- Mock data generation

### product-detail.html
- Product info display
- Image gallery
- Add to cart form
- Reviews section

### login.html
- Email/password form
- Form validation
- Remember me checkbox
- API call to `/auth/login`

### signup.html
- Role selection (customer/shopkeeper)
- Multi-field form
- Password strength meter
- Form validation

### cart.html
- Cart items list
- Quantity adjustment
- Order summary
- Checkout button

### dashboard.html
- Shopkeeper overview
- Product management
- Order history
- Settings form

### add-product.html
- Comprehensive form
- Image upload
- Drag & drop support
- Form validation

### edit-product.html
- Pre-filled form
- Product deletion
- Status management
- Update functionality

---

## 🔗 Important Files

| File | Purpose |
|------|---------|
| `js/utils.js` | API calls, auth, DOM helpers |
| `js/validators.js` | Form validation, image upload |
| `js/navbar.js` | Navigation component |
| `js/footer.js` | Footer component |
| `css/main.css` | All styling |

---

## ⚡ Common Code Patterns

### Async API with Error Handling
```javascript
async function loadData() {
  showLoading('#container');
  const result = await apiGet('/endpoint');
  
  if (result.success) {
    displayData(result.data);
  } else {
    showAlert(result.error || 'Failed to load', 'danger');
  }
}
```

### Form Submission
```javascript
const form = el('#myForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = getFormData(form);
  
  const result = await apiPost('/endpoint', data);
  if (result.success) {
    showAlert('Success!', 'success');
  } else {
    showAlert(result.error, 'danger');
  }
});
```

### Event Listener with Delegation
```javascript
on('#myButton', 'click', (e) => {
  e.stopPropagation();
  // Handle click
});
```

### Conditional Rendering
```javascript
if (isLoggedIn()) {
  show('#authenticatedContent');
  hide('#guestContent');
} else {
  show('#guestContent');
  hide('#authenticatedContent');
}
```

### Dynamic Content Update
```javascript
const html = items.map(item => `
  <div class="item">
    <h3>${item.name}</h3>
    <p>${item.description}</p>
  </div>
`).join('');

setHTML('#container', html);
```

---

## 🚀 Deployment Checklist

- [ ] Update API_BASE_URL to production API
- [ ] Test all pages in production mode
- [ ] Check form validation
- [ ] Verify authentication flow
- [ ] Test shopping cart functionality
- [ ] Test product uploads (for shopkeepers)
- [ ] Check responsive design on mobile
- [ ] Verify images load correctly
- [ ] Test navigation
- [ ] Check error handling

---

## 💡 Tips & Tricks

1. **Console Logging**: Use `console.log(result)` to debug API responses
2. **DevTools**: Use Browser DevTools (F12) to inspect elements and storage
3. **Local Storage**: Inspect localStorage in DevTools Application tab
4. **Network Tab**: Check API calls in Network tab
5. **Responsive Design**: Use DevTools device toolbar to test mobile
6. **Form Debug**: Add temporary `<pre id="debug"></pre>` to view form data
7. **Performance**: Use Lighthouse in DevTools to check performance

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| API call fails | Check API_BASE_URL, verify API is running |
| Form won't submit | Check console for validation errors |
| Cart not saving | Verify localStorage is enabled |
| Images not loading | Check image file paths and permissions |
| Page not redirecting | Check auth state with `isLoggedIn()` |
| Styles not applying | Check class names match CSS |
| Mobile menu not working | Check viewport meta tag |

---

**Last Updated:** December 2025
**Status:** Production Ready ✅
