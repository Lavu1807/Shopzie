const mongoose = require("mongoose")

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true, // Store name in case product is deleted
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true, // Price at time of purchase
  },
  shopkeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
})

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for customer queries
    },
    items: [orderItemSchema],
    shippingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Card", "UPI", "Net Banking"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
      index: true, // Index for payment status queries
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      index: true, // Index for order status queries
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    totalItems: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
)

// Generate unique order number before saving
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    this.orderNumber = `ORD-${timestamp}-${random}`
  }
  next()
})

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================

// Composite indexes for common queries
orderSchema.index({ customer: 1, createdAt: -1 }) // User's orders sorted by date
orderSchema.index({ customer: 1, orderStatus: 1 }) // User's orders by status
orderSchema.index({ "items.shopkeeper": 1, createdAt: -1 }) // Shopkeeper's orders
orderSchema.index({ orderNumber: 1 }) // Unique order lookup
orderSchema.index({ paymentStatus: 1, orderStatus: 1 }) // Payment and order status queries
orderSchema.index({ createdAt: -1 }) // Recent orders

// TTL index for auto-deleting pending orders after 30 days
// orderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000, partialFilterExpression: { orderStatus: "Pending" } })

module.exports = mongoose.model("Order", orderSchema)
