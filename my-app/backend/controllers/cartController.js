const Cart = require("../models/Cart")
const Product = require("../models/Product")

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select: "name price images stock isActive",
    })

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      })
    }

    res.status(200).json({
      success: true,
      cart,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      })
    }

    // Check if product exists and is available
    const product = await Product.findById(productId)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: "Product is not available",
      })
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      })
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id })

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] })
    }

    // Add or update item in cart
    cart.addItem(productId, quantity, product.price)

    await cart.save()

    // Populate cart items
    cart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price images stock isActive",
    })

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      })
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      })
    }

    // Check product availability
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      })
    }

    let cart = await Cart.findOne({ user: req.user.id })

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    cart.updateItemQuantity(productId, quantity)
    await cart.save()

    cart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price images stock isActive",
    })

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params

    let cart = await Cart.findOne({ user: req.user.id })

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    cart.removeItem(productId)
    await cart.save()

    cart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price images stock isActive",
    })

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    cart.clearCart()
    await cart.save()

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    })
  } catch (error) {
    next(error)
  }
}
