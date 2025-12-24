const mongoose = require("mongoose")

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
    default: 1,
  },
  price: {
    type: Number,
    required: true, // Store price at time of adding to cart
  },
})

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One cart per user
      index: true, // Index for fast user lookups
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Calculate totals before saving
cartSchema.pre("save", function (next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0)
  this.totalPrice = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  next()
})

// ===========================
// QUERY OPTIMIZATION INDEXES
// ===========================

// Index on updatedAt for cleanup operations
cartSchema.index({ updatedAt: 1 })

// Method to add item to cart
cartSchema.methods.addItem = function (productId, quantity, price) {
  const existingItemIndex = this.items.findIndex((item) => item.product.toString() === productId.toString())

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    this.items[existingItemIndex].quantity += quantity
  } else {
    // Add new item
    this.items.push({ product: productId, quantity, price })
  }
}

// Method to remove item from cart
cartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter((item) => item.product.toString() !== productId.toString())
}

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (productId, quantity) {
  const item = this.items.find((item) => item.product.toString() === productId.toString())
  if (item) {
    item.quantity = quantity
  }
}

// Method to clear cart
cartSchema.methods.clearCart = function () {
  this.items = []
  this.totalPrice = 0
  this.totalItems = 0
}

module.exports = mongoose.model("Cart", cartSchema)

module.exports = mongoose.model("Cart", cartSchema)
