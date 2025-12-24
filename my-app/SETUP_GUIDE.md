# Me-Shopz Setup Guide

This guide will walk you through setting up the Me-Shopz e-commerce platform from scratch.

## Step-by-Step Installation

### 1. Prerequisites

Before starting, ensure you have:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Choose one:
  - [Local MongoDB](https://www.mongodb.com/try/download/community)
  - [MongoDB Atlas (Cloud)](https://www.mongodb.com/cloud/atlas)
- **Git** (optional) - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended

### 2. Project Setup

#### Download the Project
```bash
# If using Git
git clone <repository-url>
cd me-shopz

# Or extract the downloaded ZIP file
```

### 3. Backend Setup

#### Step 3.1: Install Dependencies
```bash
cd backend
npm install
```

This will install:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- multer
- express-validator
- express-rate-limit
- helmet
- morgan
- nodemon (dev)

#### Step 3.2: Configure Environment
Create a `.env` file in the `backend` directory:

```bash
# Copy the example file
cp .env.example .env

# Or create manually
touch .env
```

Add the following configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/me-shopz
JWT_SECRET=change_this_to_a_long_random_string_123456789
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

**Important Security Notes:**
- Generate a strong JWT_SECRET (use random string generator)
- Never commit `.env` to version control
- Use different secrets for production

#### Step 3.3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
# Windows
net start MongoDB

# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update MONGODB_URI in `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/me-shopz?retryWrites=true&w=majority
```

#### Step 3.4: Start Backend Server
```bash
# Development mode (auto-reload on changes)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000 in development mode
```

**Test the API:**
Open browser: `http://localhost:5000/api/health`

Expected response:
```json
{
  "success": true,
  "message": "Me-Shopz API is running",
  "timestamp": "2025-01-XX..."
}
```

### 4. Frontend Setup

#### Step 4.1: Navigate to Frontend
```bash
# Open new terminal
cd frontend
```

#### Step 4.2: Configure API URL
Open `js/config.js` and verify:
```javascript
const API_BASE_URL = "http://localhost:5000/api"
```

#### Step 4.3: Serve Frontend

**Option A: Python Simple Server**
```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

**Option B: Node.js http-server**
```bash
# Install globally (one time)
npm install -g http-server

# Run server
http-server -p 3000
```

**Option C: VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

#### Step 4.4: Access Application
Open browser: `http://localhost:3000`

### 5. Testing the Application

#### Create Test Accounts

**Shopkeeper Account:**
1. Go to: `http://localhost:3000/signup.html?role=shopkeeper`
2. Fill in:
   - Name: Test Shopkeeper
   - Email: shop@test.com
   - Password: test123
   - Role: Sell Products (Shopkeeper)
3. Click "Create Account"

**Customer Account:**
1. Go to: `http://localhost:3000/signup.html`
2. Fill in:
   - Name: Test Customer
   - Email: customer@test.com
   - Password: test123
   - Role: Buy Products (Customer)
3. Click "Create Account"

#### Test Shopkeeper Features
1. Login as shopkeeper
2. Go to Dashboard
3. Click "Add New Product"
4. Fill in product details
5. Upload image
6. Submit

#### Test Customer Features
1. Logout (click Logout in navbar)
2. Login as customer
3. Browse products on home page
4. Add product to cart
5. Go to cart
6. Proceed to checkout
7. Fill shipping address
8. Place order
9. View order in dashboard

### 6. Verify Everything Works

#### Backend Health Check
```bash
# Test API health
curl http://localhost:5000/api/health

# Test authentication (should fail - not authenticated)
curl http://localhost:5000/api/auth/me
```

#### Frontend Check
- [ ] Home page loads
- [ ] Can search/filter products
- [ ] Login works
- [ ] Signup works
- [ ] Cart functionality works
- [ ] Dashboard shows correctly

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Error:** `MongooseError: connect ECONNREFUSED`

**Solution:**
1. Check MongoDB is running:
```bash
# Check status
mongosh  # Should connect

# If not running, start it
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

2. Verify connection string in `.env`
3. Check firewall settings

### Issue: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port
# macOS/Linux
lsof -i :5000

# Windows
netstat -ano | findstr :5000

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in .env
PORT=5001
```

### Issue: CORS Errors
**Error:** `Access to fetch blocked by CORS policy`

**Solution:**
1. Ensure backend is running
2. Check FRONTEND_URL in backend `.env`
3. Restart backend server

### Issue: Images Not Uploading
**Error:** `MulterError: File too large`

**Solution:**
1. Check image size (max 5MB)
2. Verify uploads folder exists:
```bash
cd backend
mkdir -p uploads/products
```

### Issue: JWT Token Invalid
**Error:** `Token is invalid or expired`

**Solution:**
1. Clear browser localStorage
2. Login again
3. Check JWT_SECRET is set in `.env`

## Development Tips

### Hot Reload (Auto Refresh)
Backend uses nodemon for auto-reload. Any file changes will restart the server.

Frontend requires manual refresh or use Live Server for auto-reload.

### Debugging

**Backend Logs:**
Check terminal running backend server for:
- API requests
- Database queries
- Errors

**Frontend Logs:**
Open browser DevTools (F12):
- Console tab for JavaScript logs
- Network tab for API requests
- Application tab for localStorage

**MongoDB Data:**
```bash
# Connect to MongoDB
mongosh

# Switch to database
use me-shopz

# View collections
show collections

# View users
db.users.find().pretty()

# View products
db.products.find().pretty()
```

### API Testing with Postman

1. Install [Postman](https://www.postman.com/)
2. Import collection (create manually):

**Test Login:**
- Method: POST
- URL: http://localhost:5000/api/auth/login
- Body (JSON):
```json
{
  "email": "shop@test.com",
  "password": "test123"
}
```

**Test Protected Route:**
- Method: GET
- URL: http://localhost:5000/api/auth/me
- Headers:
```
Authorization: Bearer <your_jwt_token>
```

## Next Steps

### Production Deployment
- See README.md deployment section
- Use production MongoDB
- Set NODE_ENV=production
- Use strong JWT_SECRET
- Enable HTTPS
- Configure proper CORS

### Add Features
- Payment gateway integration
- Email notifications
- Reviews and ratings
- Advanced search

### Optimization
- Add caching (Redis)
- Image optimization
- CDN for static files
- Database indexing

## Getting Help

### Resources
- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Support
- Check existing issues
- Create new issue with:
  - Error message
  - Steps to reproduce
  - Environment details

---

🎉 **Congratulations!** You've successfully set up Me-Shopz!
