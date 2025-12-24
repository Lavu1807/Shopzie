const express = require("express")
const { body } = require("express-validator")
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} = require("../controllers/productController")
const { protect, authorize } = require("../middleware/auth")
const upload = require("../middleware/upload")
const { productCreationLimiter } = require("../middleware/rateLimiter")
const { handleValidationErrors } = require("../middleware/validator")

const router = express.Router()

// Validation rules
const productValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 100 })
    .withMessage("Product name too long"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 2000 })
    .withMessage("Description too long"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("category").notEmpty().withMessage("Category is required"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
]

// Public routes
router.get("/", getAllProducts)
router.get("/:id", getProductById)

// Protected routes - Shopkeeper only
router.post(
  "/",
  protect,
  authorize("shopkeeper"),
  productCreationLimiter,
  upload.array("images", 5),
  productValidation,
  handleValidationErrors,
  createProduct,
)

router.put("/:id", protect, authorize("shopkeeper"), upload.array("images", 5), updateProduct)

router.delete("/:id", protect, authorize("shopkeeper"), deleteProduct)

router.get("/my-products", protect, authorize("shopkeeper"), getMyProducts)

module.exports = router
