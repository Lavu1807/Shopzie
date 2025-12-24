/**
 * Test Database Setup with In-Memory MongoDB
 * Used for development and testing when MongoDB Atlas is unavailable
 */

const { MongoMemoryServer } = require("mongodb-memory-server")
const mongoose = require("mongoose")

let mongoServer

/**
 * Connect to in-memory MongoDB instance
 */
async function connectTestDB() {
  try {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()

    // Connect mongoose to in-memory database
    await mongoose.connect(mongoUri, {
      // useNewUrlParser and useUnifiedTopology are deprecated in newer versions
    })

    console.log("✅ Connected to in-memory MongoDB (Test DB)")
    return mongoUri
  } catch (error) {
    console.error("❌ Failed to connect to test database:", error.message)
    process.exit(1)
  }
}

/**
 * Disconnect from test database
 */
async function disconnectTestDB() {
  try {
    await mongoose.disconnect()
    if (mongoServer) {
      await mongoServer.stop()
    }
    console.log("✅ Disconnected from test database")
  } catch (error) {
    console.error("❌ Error disconnecting from test database:", error.message)
  }
}

module.exports = {
  connectTestDB,
  disconnectTestDB,
}
