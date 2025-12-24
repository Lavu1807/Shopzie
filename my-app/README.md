# Me-Shopz - E-Commerce Platform

A full-stack e-commerce web application that enables shopkeepers to list, manage, and sell products online, while customers can browse, purchase, and track orders.

## Features

### For Shopkeepers
- Create and manage product listings
- Upload product images
- Track inventory and stock levels
- View and manage received orders
- Dashboard with sales statistics

### For Customers
- Browse products by category
- Search and filter products
- Add items to cart
- Place orders with shipping details
- Track order history and status

### Technical Features
- JWT-based authentication
- Role-based access control (Customer/Shopkeeper)
- Secure password hashing with bcrypt
- File upload with Multer
- Rate limiting for API protection
- Input validation and sanitization
- RESTful API architecture
- MongoDB database with Mongoose ODM

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **Security:** Helmet, CORS, express-rate-limit
- **Validation:** express-validator

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - DOM manipulation, Fetch API
- **Mobile-first** responsive design

## Project Structure

```
me-shopz/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── upload.js
│   │   ├── rateLimiter.js
│   │   ├── validator.js
│   │   └── securityHeaders.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   └── orderRoutes.js
│   ├── utils/
│   │   └── createDirectory.js
│   ├── uploads/
│   │   └── products/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── config.js
│   │   ├── auth.js
│   │   ├── api.js
│   │   ├── home.js
│   │   ├── login.js
│   │   ├── signup.js
│   │   ├── cart.js
│   │   └── dashboard.js
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── cart.html
│   └── dashboard.html
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/me-shopz
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

4. **Start MongoDB:**
```bash
# If using local MongoDB
mongod
```

5. **Start the backend server:**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Update API configuration:**
Open `js/config.js` and ensure `API_BASE_URL` points to your backend:
```javascript
const API_BASE_URL = "http://localhost:5000/api"
```

3. **Serve the frontend:**

**Option 1: Using Python:**
```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

**Option 2: Using Node.js http-server:**
```bash
npx http-server -p 3000
```

**Option 3: Using VS Code Live Server extension**

Frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)
- `PUT /api/auth/change-password` - Change password (Protected)

### Products
- `GET /api/products` - Get all products (Public)
- `GET /api/products/:id` - Get single product (Public)
- `POST /api/products` - Create product (Shopkeeper)
- `PUT /api/products/:id` - Update product (Shopkeeper)
- `DELETE /api/products/:id` - Delete product (Shopkeeper)
- `GET /api/products/my-products` - Get shopkeeper's products (Shopkeeper)

### Cart
- `GET /api/cart` - Get user cart (Protected)
- `POST /api/cart/add` - Add item to cart (Protected)
- `PUT /api/cart/update` - Update cart item (Protected)
- `DELETE /api/cart/remove/:productId` - Remove from cart (Protected)
- `DELETE /api/cart/clear` - Clear cart (Protected)

### Orders
- `POST /api/orders` - Create order (Customer)
- `GET /api/orders/my-orders` - Get customer orders (Customer)
- `GET /api/orders/received` - Get received orders (Shopkeeper)
- `GET /api/orders/:id` - Get order details (Protected)
- `PUT /api/orders/:id/status` - Update order status (Shopkeeper)

## Security Features

### Backend Security
- **Helmet.js** - Secure HTTP headers
- **CORS** - Cross-Origin Resource Sharing protection
- **Rate Limiting** - Prevent brute force attacks
  - General API: 100 requests per 15 minutes
  - Auth endpoints: 5 requests per 15 minutes
  - Product creation: 20 requests per hour
- **Input Validation** - express-validator for request validation
- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **File Upload Validation** - File type and size restrictions

### Database Security
- **Mongoose Schema Validation** - Data integrity
- **Password Selection** - Passwords excluded from queries by default
- **Indexed Queries** - Optimized database performance

## Usage Guide

### As a Customer

1. **Sign Up / Login**
   - Create an account as a "Customer"
   - Login with your credentials

2. **Browse Products**
   - View all products on the home page
   - Filter by category
   - Search for specific products

3. **Shopping Cart**
   - Add products to cart
   - Update quantities
   - Remove items
   - View total price

4. **Place Order**
   - Click "Proceed to Checkout"
   - Enter shipping address
   - Select payment method
   - Place order

5. **Track Orders**
   - View order history in dashboard
   - Check order status

### As a Shopkeeper

1. **Sign Up / Login**
   - Create an account as a "Shopkeeper"
   - Login with your credentials

2. **Dashboard**
   - View statistics (total products, stock, etc.)
   - Manage your products

3. **Add Product**
   - Click "Add New Product"
   - Fill in product details
   - Upload images (up to 5)
   - Set price and stock
   - Submit

4. **Manage Products**
   - Edit product details
   - Update stock levels
   - Delete products

5. **View Orders**
   - See all orders containing your products
   - Update order status

## Best Practices Implemented

### Code Quality
- Modular architecture
- Separation of concerns
- RESTful API design
- Error handling middleware
- Async/await for asynchronous operations

### Security
- Environment variables for sensitive data
- Input validation and sanitization
- Rate limiting
- Secure password handling
- JWT token expiration

### Performance
- MongoDB indexing
- Pagination for large datasets
- Image optimization
- Efficient database queries

### User Experience
- Responsive mobile-first design
- Loading states and spinners
- Error messages and validation
- Intuitive navigation
- Alert notifications

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts nodemon for auto-reload
```

### Adding New Features

1. **Create Model** - Define schema in `models/`
2. **Create Controller** - Add business logic in `controllers/`
3. **Create Routes** - Define endpoints in `routes/`
4. **Add Middleware** - Create middleware if needed
5. **Update Frontend** - Add UI and API calls

## Deployment

### Backend Deployment (Example: Heroku)
```bash
# Add Procfile
echo "web: node server.js" > Procfile

# Deploy
heroku create me-shopz-api
git push heroku main
```

### Frontend Deployment (Example: Vercel/Netlify)
- Upload frontend folder
- Configure build settings
- Update API_BASE_URL in config.js

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

**CORS Errors**
- Check FRONTEND_URL in backend `.env`
- Ensure frontend is running on correct port

**File Upload Fails**
- Check uploads directory exists
- Verify file size limits
- Check file type restrictions

**JWT Token Expired**
- Re-login to get new token
- Check JWT_EXPIRE setting

## Future Enhancements

- Payment gateway integration (Stripe/PayPal)
- Product reviews and ratings
- Email notifications
- Order tracking with status updates
- Admin panel for platform management
- Social media integration
- Wishlist functionality
- Multiple currency support
- Advanced search with filters
- Analytics dashboard

## License

MIT License - Free to use for personal and commercial projects

## Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@me-shopz.com

---

Built with ❤️ for small businesses and shopkeepers
