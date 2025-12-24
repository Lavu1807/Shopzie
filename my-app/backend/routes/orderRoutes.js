const express = require("express")
const {
  createOrder,
  getMyOrders,
  getReceivedOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// All order routes require authentication
router.use(protect)

// Customer routes
router.post("/", authorize("customer"), createOrder)
router.get("/my-orders", authorize("customer"), getMyOrders)

// Shopkeeper routes
router.get("/received", authorize("shopkeeper"), getReceivedOrders)
router.put("/:id/status", authorize("shopkeeper"), updateOrderStatus)

// Shared routes
router.get("/:id", getOrderById)

module.exports = router
