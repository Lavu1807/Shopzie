const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const path = require("path")
// Load .env from backend directory regardless of CWD
require("dotenv").config({ path: path.join(__dirname, ".env") })

// Centralized Mongo connection helper
const connectDB = require("./config/database")

// Import test database setup
const { connectTestDB } = require("./testDB")

const app = express()

// Import routes
const authRoutes = require("./routes/authRoutes")
const productRoutes = require("./routes/productRoutes")
const cartRoutes = require("./routes/cartRoutes")
const orderRoutes = require("./routes/orderRoutes")

// Import middleware
const errorHandler = require("./middleware/errorHandler")
const securityHeaders = require("./middleware/securityHeaders")
const { apiLimiter } = require("./middleware/rateLimiter")

// Import utility to create upload directories
const createUploadDirectories = require("./utils/createDirectory")

// Create upload directories on startup
createUploadDirectories()

// Security middleware
app.use(helmet())
app.use(securityHeaders)

// CORS configuration
// Allow common dev origins (3000/3001) and configured FRONTEND_URL
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow same-origin or non-browser requests (no origin)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
  }),
)

// Body parser middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Apply rate limiting to all API routes
app.use("/api", apiLimiter)

// MongoDB connection: prefer real URI, fallback to in-memory in dev
async function boot() {
  const mongoUri = process.env.MONGODB_URI

  if (mongoUri) {
    try {
      await connectDB()
      console.log("✅ MongoDB connected successfully")
      startServer()
      return
    } catch (err) {
      console.error("❌ MongoDB connection error:", err.message)
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️ Falling back to in-memory MongoDB for development")
    try {
      await connectTestDB()
      console.log("✅ Connected to in-memory MongoDB (Test DB)")
      startServer()
      return
    } catch (err) {
      console.error("❌ Failed to start application:", err.message)
      process.exit(1)
    }
  }

  console.error("❌ No MONGODB_URI provided and not in development mode")
  process.exit(1)
}

boot()

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Me-Shopz API is running",
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Function to start the server
function startServer() {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
  })
}
