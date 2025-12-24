const { validationResult, body, param, query } = require("express-validator")
const User = require("../models/User")

// =====================
// MIDDLEWARE
// =====================

/**
 * Middleware to handle validation errors
 * Returns structured error response with field-level details
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    })
  }

  next()
}

/**
 * Sanitize input to prevent XSS attacks
 * Removes dangerous characters and limits string length
 */
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .substring(0, 1000) // Limit length
}

// =====================
// PASSWORD VALIDATORS
// =====================

const passwordValidator = body("password")
  .isLength({ min: 8, max: 128 })
  .withMessage("Password must be 8-128 characters")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one number")
  .matches(/[!@#$%^&*]/)
  .withMessage("Password must contain at least one special character (!@#$%^&*)")
  .custom((value) => {
    // Prevent common passwords
    const commonPasswords = ["password", "123456", "qwerty", "abc123", "letmein"]
    if (commonPasswords.some((pwd) => value.toLowerCase().includes(pwd))) {
      throw new Error("Password is too common. Please choose a more secure password")
    }
    return true
  })

const passwordConfirmValidator = body("confirmPassword")
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match")
    }
    return true
  })

// =====================
// EMAIL VALIDATORS
// =====================

const emailValidator = body("email")
  .trim()
  .isEmail()
  .withMessage("Please provide a valid email address")
  .normalizeEmail()
  .isLength({ max: 254 })
  .withMessage("Email is too long")

const emailExistsValidator = body("email").custom(async (value) => {
  const user = await User.findOne({ email: value })
  if (user) {
    throw new Error("Email already registered")
  }
})

// =====================
// PHONE VALIDATORS
// =====================

const phoneValidator = body("phone")
  .optional({ checkFalsy: true })
  .trim()
  .matches(/^[\d\s\-\+\(\)]+$/)
  .withMessage("Invalid phone number format")
  .isLength({ min: 10, max: 15 })
  .withMessage("Phone number must be 10-15 characters")

// =====================
// TEXT VALIDATORS
// =====================

const nameValidator = body("name")
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage("Name must be 2-100 characters")
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage("Name can only contain letters, spaces, hyphens, and apostrophes")

const descriptionValidator = body("description")
  .trim()
  .isLength({ min: 10, max: 3000 })
  .withMessage("Description must be 10-3000 characters")

const categoryValidator = body("category")
  .trim()
  .isIn(["Electronics", "Clothing", "Books", "Home & Kitchen", "Sports", "Toys", "Beauty", "Food", "Other"])
  .withMessage("Invalid category selected")

// =====================
// NUMERIC VALIDATORS
// =====================

const priceValidator = body("price")
  .isFloat({ min: 0.01, max: 999999.99 })
  .withMessage("Price must be between 0.01 and 999,999.99")
  .custom((value) => {
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      throw new Error("Price must have at most 2 decimal places")
    }
    return true
  })

const stockValidator = body("stock")
  .isInt({ min: 0, max: 1000000 })
  .withMessage("Stock must be a non-negative integer up to 1,000,000")

const quantityValidator = body("quantity")
  .isInt({ min: 1, max: 100 })
  .withMessage("Quantity must be between 1 and 100")

const ratingValidator = body("rating")
  .isInt({ min: 1, max: 5 })
  .withMessage("Rating must be between 1 and 5")

// =====================
// ADDRESS VALIDATORS
// =====================

const addressValidator = [
  body("address.street")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Street address must be 5-200 characters"),
  body("address.city")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be 2-50 characters"),
  body("address.state")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be 2-50 characters"),
  body("address.zipCode")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{5,10}$/)
    .withMessage("Zip code must be 5-10 digits"),
  body("address.country")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be 2-50 characters"),
]

// =====================
// ID VALIDATORS
// =====================

const mongoIdValidator = param("id")
  .isMongoId()
  .withMessage("Invalid resource ID")

const userIdValidator = body("userId")
  .optional()
  .isMongoId()
  .withMessage("Invalid user ID")

// =====================
// QUERY VALIDATORS
// =====================

const paginationValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
]

const searchValidator = query("search")
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 100 })
  .withMessage("Search query too long")

const sortValidator = query("sort")
  .optional()
  .isIn(["newest", "oldest", "price-asc", "price-desc", "popular"])
  .withMessage("Invalid sort option")

// =====================
// COMPOSITE VALIDATORS
// =====================

const signupValidationRules = () => [
  nameValidator,
  emailValidator,
  emailExistsValidator,
  passwordValidator,
  passwordConfirmValidator,
  phoneValidator,
  body("role")
    .optional()
    .isIn(["customer", "shopkeeper"])
    .withMessage("Invalid role"),
]

const loginValidationRules = () => [
  emailValidator,
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
]

const profileValidationRules = () => [
  nameValidator,
  phoneValidator,
  ...addressValidator,
]

const changePasswordValidationRules = () => [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password cannot be the same as current password")
      }
      return true
    }),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match")
      }
      return true
    }),
]

const productValidationRules = () => [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be 3-100 characters"),
  descriptionValidator,
  priceValidator,
  categoryValidator,
  stockValidator,
]

const cartValidationRules = () => [
  body("productId")
    .isMongoId()
    .withMessage("Invalid product ID"),
  quantityValidator,
]

const orderValidationRules = () => [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),
  body("items.*.productId")
    .isMongoId()
    .withMessage("Invalid product ID in order items"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Item quantity must be at least 1"),
  body("deliveryAddress")
    .notEmpty()
    .withMessage("Delivery address is required"),
  ...addressValidator,
]

const reviewValidationRules = () => [
  body("productId")
    .isMongoId()
    .withMessage("Invalid product ID"),
  ratingValidator,
  body("comment")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Comment must not exceed 500 characters"),
]

module.exports = {
  // Middleware
  handleValidationErrors,
  sanitizeInput,
  
  // Individual validators
  passwordValidator,
  passwordConfirmValidator,
  emailValidator,
  emailExistsValidator,
  phoneValidator,
  nameValidator,
  descriptionValidator,
  categoryValidator,
  priceValidator,
  stockValidator,
  quantityValidator,
  ratingValidator,
  mongoIdValidator,
  userIdValidator,
  paginationValidator,
  searchValidator,
  sortValidator,
  
  // Composite validators
  signupValidationRules,
  loginValidationRules,
  profileValidationRules,
  changePasswordValidationRules,
  productValidationRules,
  cartValidationRules,
  orderValidationRules,
  reviewValidationRules,
}
