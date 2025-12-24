const Product = require("../models/Product")
const { validationResult } = require("express-validator")

// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, page = 1, limit = 12 } = req.query

    // Build query
    const query = { isActive: true }

    if (category) {
      query.category = category
    }

    if (search) {
      query.$text = { $search: search }
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .populate("shopkeeper", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const count = await Product.countDocuments(query)

    res.status(200).json({
      success: true,
      count: products.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      products,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("shopkeeper", "name email phone")

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.status(200).json({
      success: true,
      product,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new product (Shopkeeper only)
// @route   POST /api/products
// @access  Private/Shopkeeper
exports.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { name, description, price, category, stock } = req.body

    // Handle uploaded images
    let images = []
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/products/${file.filename}`)
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images,
      shopkeeper: req.user.id,
    })

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update product (Shopkeeper only - own products)
// @route   PUT /api/products/:id
// @access  Private/Shopkeeper
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Check ownership
    if (product.shopkeeper.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this product",
      })
    }

    const { name, description, price, category, stock, isActive } = req.body

    const updateData = {}
    if (name) updateData.name = name
    if (description) updateData.description = description
    if (price !== undefined) updateData.price = price
    if (category) updateData.category = category
    if (stock !== undefined) updateData.stock = stock
    if (isActive !== undefined) updateData.isActive = isActive

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/products/${file.filename}`)
      updateData.images = [...product.images, ...newImages]
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete product (Shopkeeper only - own products)
// @route   DELETE /api/products/:id
// @access  Private/Shopkeeper
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Check ownership
    if (product.shopkeeper.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this product",
      })
    }

    await Product.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get shopkeeper's own products
// @route   GET /api/products/my-products
// @access  Private/Shopkeeper
exports.getMyProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const products = await Product.find({ shopkeeper: req.user.id })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const count = await Product.countDocuments({ shopkeeper: req.user.id })

    res.status(200).json({
      success: true,
      count: products.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      products,
    })
  } catch (error) {
    next(error)
  }
}
