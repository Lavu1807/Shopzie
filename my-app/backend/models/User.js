const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
      index: true, // Index for faster email lookups
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["customer", "shopkeeper"],
      default: "customer",
      index: true, // Index for role-based queries
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // Index for active user queries
    },
    // Refresh token for JWT refresh token rotation
    refreshToken: {
      type: String,
      select: false, // Don't return by default for security
    },
    // Expiry time for refresh token
    refreshTokenExpiry: {
      type: Date,
      select: false,
    },
    // Track last login for security monitoring
    lastLogin: {
      type: Date,
    },
    // Track password change date (for forced password resets)
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
)

// Create compound index for active users by role
userSchema.index({ isActive: 1, role: 1 })

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    this.lastPasswordChange = new Date()
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Method to get user object without sensitive data
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  delete user.refreshToken
  delete user.refreshTokenExpiry
  return user
}

// Method to check if password needs to be changed (e.g., older than 90 days)
userSchema.methods.isPasswordExpired = function (dayLimit = 90) {
  const lastChangeTime = this.lastPasswordChange || this.createdAt
  const daysSinceChange = Math.floor((Date.now() - lastChangeTime) / (1000 * 60 * 60 * 24))
  return daysSinceChange > dayLimit
}

module.exports = mongoose.model("User", userSchema)

module.exports = mongoose.model("User", userSchema)
