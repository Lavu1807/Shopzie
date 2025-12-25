# 🛒 Shopzie - E-Commerce Platform

A full-stack e-commerce marketplace platform that enables multiple sellers (shopkeepers) to list and manage products, while customers can browse, purchase, and track orders. Built with modern web technologies and secured with JWT authentication.

![Shopzie Demo](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-ISC-green)

---

## ✨ Features

### 🎯 For Customers
- 🔐 User authentication with secure JWT tokens
- 🛍️ Browse products by category
- 🔍 Search and filter products
- 🛒 Shopping cart functionality
- 📦 Place orders with delivery address
- 📋 View order history and track status
- 👁️ Password visibility toggle for security awareness

### 🏪 For Shopkeepers
- 📱 Dedicated seller dashboard
- ➕ Add, edit, and delete products
- 💰 Set product prices and manage inventory
- 📊 View sales and order information
- 📸 Upload product images
- 🎛️ Full product lifecycle management

### 🔒 Security Features
- **JWT Authentication** - Secure token-based access control
- **Role-Based Access Control** - Customer vs Shopkeeper roles
- **Password Hashing** - bcrypt for secure password storage
- **Password Strength Validation** - Minimum 8 chars, uppercase, lowercase, number, special char
- **Input Validation** - Server-side validation with express-validator
- **Rate Limiting** - API protection against brute force attacks
- **Security Headers** - Helmet.js for secure HTTP headers
- **CORS Protection** - Configured CORS for frontend access

### 🎭 User Role Switching
- Switch between Customer and Shopkeeper roles from dashboard
- Real-time role updates
- Dynamic UI based on user role
- No need to create separate accounts

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with TypeScript
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hook Form** - Form state management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 5** - Web application framework
- **MongoDB 7** - NoSQL database
- **Mongoose 9** - MongoDB ODM
- **JWT** - Authentication tokens
- **Bcryptjs** - Password encryption
- **Multer** - File upload handling
- **Express Validator** - Input validation

### Database
- **MongoDB Atlas** - Cloud MongoDB service
- **Mongoose Models** - User, Product, Cart, Order

---

## 📁 Project Structure

```
Shopzie/
├── my-app/
│   ├── app/                    # Next.js app directory
│   │   ├── dashboard/          # Customer/Shopkeeper dashboard
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   ├── products/           # Product listing
│   │   ├── cart/               # Shopping cart
│   │   ├── orders/             # Order history
│   │   ├── shopkeeper/         # Shopkeeper routes
│   │   │   └── products/       # Product management
│   │   └── checkout/           # Checkout page
│   ├── backend/
│   │   ├── config/             # Database config
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # API routes
│   │   ├── utils/              # Utility functions
│   │   └── server.js           # Express server
│   ├── frontend/               # Legacy HTML/CSS/JS
│   ├── lib/                    # Shared utilities
│   └── public/                 # Static assets
├── package.json
└── .gitignore
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Lavu1807/Shopzie.git
cd Shopzie
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd my-app/backend
npm install

# Install frontend dependencies
cd ../
npm install
```

3. **Configure environment variables**

Create `.env` file in `my-app/backend/`:
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shopzie?appName=Cluster0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Running the Application

1. **Start Backend Server** (Terminal 1)
```bash
cd my-app/backend
npm start
# Server runs on http://localhost:5000
```

2. **Start Frontend Dev Server** (Terminal 2)
```bash
cd my-app
npm run dev
# Frontend runs on http://localhost:3000
```

3. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

---

## 📝 API Endpoints

### Authentication
```
POST   /api/auth/signup              # Register new user
POST   /api/auth/login               # Login user
POST   /api/auth/refresh             # Refresh access token
GET    /api/auth/me                  # Get current user info
PUT    /api/auth/profile             # Update profile (including role)
POST   /api/auth/logout              # Logout user
PUT    /api/auth/change-password     # Change password
```

### Products
```
GET    /api/products                 # Get all products
GET    /api/products/:id             # Get product details
POST   /api/products                 # Create product (Shopkeeper)
PUT    /api/products/:id             # Update product (Shopkeeper)
DELETE /api/products/:id             # Delete product (Shopkeeper)
GET    /api/products/my-products     # Get shopkeeper's products
```

### Cart
```
GET    /api/cart                     # Get user's cart
POST   /api/cart                     # Add to cart
PUT    /api/cart/:productId          # Update cart item quantity
DELETE /api/cart/:productId          # Remove from cart
```

### Orders
```
GET    /api/orders                   # Get user's orders
POST   /api/orders                   # Create new order
GET    /api/orders/:id               # Get order details
PUT    /api/orders/:id/status        # Update order status (Shopkeeper)
```

---

## 🔐 User Authentication

### Signup
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "role": "customer"  // or "shopkeeper"
}
```

### Password Requirements
✅ Minimum 8 characters
✅ At least one uppercase letter (A-Z)
✅ At least one lowercase letter (a-z)
✅ At least one number (0-9)
✅ At least one special character (!@#$%^&*)

### Example Valid Password
```
Priti@2703
MyShop123!
SecurePass@99
```

---

## 🎯 Getting Started as a Shopkeeper

1. **Sign up** with "Shopkeeper" role
2. Go to **Dashboard** → **Account Information**
3. Click **"Switch to Shopkeeper"** (if not already)
4. Click **"Manage Products"** card
5. Click **"+ Add New Product"**
6. Fill in:
   - Product Name
   - Description
   - Price
   - Category
   - Stock Quantity
7. Click **"Create Product"**
8. View, edit, or delete your products anytime

---

## 👥 Role Switching

Switch between Customer and Shopkeeper roles anytime from your dashboard:

1. Go to **Dashboard**
2. Click the blue button: **"Switch to Shopkeeper"** or **"Switch to Customer"**
3. Confirm the action
4. Dashboard updates automatically with role-specific features

---

## 🧪 Testing

### Test Credentials
```
Email: lav@gmail.com
Password: Priti@2703
Role: Can be switched from dashboard
```

### API Testing
Use Postman or similar tools:
```
Base URL: http://localhost:5000/api
Auth Header: Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 🌐 Deployment

### Deploy to Vercel (Frontend)
```bash
cd my-app
npm run build
vercel deploy
```

### Deploy to Heroku (Backend)
```bash
cd my-app/backend
heroku create your-app-name
git push heroku main
```

### Environment Variables
Update `.env` with production values:
- MongoDB Atlas connection string
- Production JWT secrets
- Production frontend URL
- Node environment to "production"

---

## 📚 Documentation

- [Frontend Setup](./my-app/SETUP_GUIDE.md)
- [API Reference](./my-app/ORDER_API_REFERENCE.md)
- [Security Implementation](./my-app/SECURITY.md)
- [Order System Guide](./my-app/README_ORDER_SYSTEM.md)
- [Cart Implementation](./my-app/README_CART_IMPLEMENTATION.md)

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Verify MongoDB Atlas credentials in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure internet connection

### JWT Secret Error
- Add `JWT_SECRET` to `.env` file
- Restart backend server
- Clear browser cache and login again

### CORS Errors
- Verify `FRONTEND_URL` in `.env`
- Check frontend and backend URLs match
- Ensure both servers are running

### Port Already in Use
```bash
# Kill process on port 3000 (Frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000 (Backend)
lsof -ti:5000 | xargs kill -9
```

---

## 🚀 Performance Features

- **JWT Token Refresh** - Automatic token rotation for security
- **Rate Limiting** - Protects against spam and brute force attacks
- **Database Indexing** - Optimized queries for faster performance
- **Input Validation** - Server-side validation prevents malicious requests
- **Error Handling** - Comprehensive error messages and logging

---

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'customer' | 'shopkeeper',
  phone: String,
  address: { street, city, state, zipCode, country },
  refreshToken: String,
  refreshTokenExpiry: Date,
  isActive: Boolean
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  images: [String],
  shopkeeper: ObjectId (ref: User),
  rating: { average, count },
  isActive: Boolean,
  createdAt: Date
}
```

### Order Model
```javascript
{
  orderNumber: String (unique),
  customer: ObjectId (ref: User),
  items: [{ product, productName, quantity, price, shopkeeper }],
  totalAmount: Number,
  shippingAddress: { street, city, state, zipCode, country },
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced search filters

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Lavanya Verma**
- GitHub: [@Lavu1807](https://github.com/Lavu1807)
- Email: lavu18072006@gmail.com

---

## 📞 Support

For support, email lavuverma18072006@gmail.com or open an issue on GitHub.

---

## 🙏 Acknowledgments

- Next.js and React community
- MongoDB documentation
- Express.js guides
- Tailwind CSS documentation
- All contributors and testers

---

**Made with ❤️ by Lavanya Verma**

