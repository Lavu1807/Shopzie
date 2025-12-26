# Me-Shopz - E-Commerce Platform (Next.js App)

This is the Next.js 16 application for Me-Shopz. The app has been migrated from TypeScript to JavaScript using `.jsx` pages and `next.config.js`.

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
- **Next.js 16** using JavaScript (`.jsx`)
- **React 19**
- **Tailwind CSS 4**
- **Lucide React** icons

## Project Structure (app dir)

```
my-app/
├── app/
│   ├── page.jsx
│   ├── layout.jsx
│   ├── login/page.jsx
│   ├── signup/page.jsx
│   ├── dashboard/page.jsx
│   ├── products/page.jsx
│   ├── products/[id]/page.jsx
│   ├── cart/page.jsx
│   ├── orders/page.jsx
│   └── shopkeeper/products/page.jsx
├── lib/utils.js
├── next.config.js
├── public/
└── package.json
```

## Run the App

1) Start the backend API (port 5000):

```bash
cd my-app/backend
npm install
npm run dev
```

2) Start the Next.js dev server:

```bash
cd my-app
npm install
npm run dev
```

- The dev server prints the exact URL. It defaults to `http://localhost:3000`; if that port is busy, Next.js will pick another (e.g., `http://localhost:3001`).
- The app calls the backend at `http://localhost:5000`.

## Recent Changes

- Converted all `.ts`/`.tsx` files to JavaScript `.jsx` pages.
- Replaced `next.config.ts` with `next.config.js`.
- Moved shared utility to `lib/utils.js`.
- Updated legacy HTML pages that loaded `lib/utils.ts` to `lib/utils.js`.

## Troubleshooting

- If you see "Failed to fetch" on login/signup:
   - Ensure the backend is running at `http://localhost:5000`.
   - Open the exact frontend URL printed by `npm run dev` (3000 or 3001).
   - CORS is preconfigured to allow `http://localhost:3000` and `http://localhost:3001`.
- If Next.js warns about multiple lockfiles/workspace root:
   - Keep a single `package-lock.json` at the intended root, or set `turbopack.root` in `next.config.js`.
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

### Run the Next.js App

```bash
cd my-app
npm install
npm run dev
```

The dev server prints the exact URL. It defaults to `http://localhost:3000`; if that port is in use, it will pick another (e.g., `http://localhost:3001`).

### Backend API

The app expects the backend at `http://localhost:5000`. Make sure it’s running:

```bash
cd my-app/backend
npm install
npm run dev
```

### CORS & "Failed to fetch"
- CORS is configured to allow `http://localhost:3000` and `http://localhost:3001`.
- Ensure you open the URL shown by the Next.js dev server.
- Verify the backend health at `http://localhost:5000/api/health`.

### Notes
- Utilities were migrated to `lib/utils.js` and references in legacy HTML updated.
- Config moved to `next.config.js`.
- TypeScript files were replaced by `.jsx` pages.

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
