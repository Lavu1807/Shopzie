const Order = require("../models/Order")
const Cart = require("../models/Cart")
const Product = require("../models/Product")

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zipCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      })
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product")

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      })
    }

    // Validate stock availability
    for (const item of cart.items) {
      if (!item.product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product.name} is no longer available`,
        })
      }

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}`,
        })
      }
    }

    // Prepare order items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.price,
      shopkeeper: item.product.shopkeeper,
    }))

    // Create order
    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      totalAmount: cart.totalPrice,
      totalItems: cart.totalItems,
      notes,
    })

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      })
    }

    // Clear cart
    cart.clearCart()
    await cart.save()

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate("items.product", "name images")

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get customer's orders
// @route   GET /api/orders/my-orders
// @access  Private/Customer
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const orders = await Order.find({ customer: req.user.id })
      .populate("items.product", "name images")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const count = await Order.countDocuments({ customer: req.user.id })

    res.status(200).json({
      success: true,
      count: orders.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      orders,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get shopkeeper's received orders
// @route   GET /api/orders/received
// @access  Private/Shopkeeper
exports.getReceivedOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query

    // Find orders containing items from this shopkeeper
    const orders = await Order.find({
      "items.shopkeeper": req.user.id,
    })
      .populate("customer", "name email phone")
      .populate("items.product", "name images")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const count = await Order.countDocuments({
      "items.shopkeeper": req.user.id,
    })

    res.status(200).json({
      success: true,
      count: orders.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      orders,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("items.product", "name images price")
      .populate("items.shopkeeper", "name email")

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check authorization
    const isCustomer = order.customer._id.toString() === req.user.id
    const isShopkeeper = order.items.some((item) => item.shopkeeper._id.toString() === req.user.id)

    if (!isCustomer && !isShopkeeper) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      })
    }

    res.status(200).json({
      success: true,
      order,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update order status (Shopkeeper only)
// @route   PUT /api/orders/:id/status
// @access  Private/Shopkeeper
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      })
    }

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check if shopkeeper has items in this order
    const hasItems = order.items.some((item) => item.shopkeeper.toString() === req.user.id)

    if (!hasItems) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      })
    }

    order.orderStatus = status
    await order.save()

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    })
  } catch (error) {
    next(error)
  }
}
