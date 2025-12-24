const fs = require("fs")
const path = require("path")

// Create uploads directories if they don't exist
const createUploadDirectories = () => {
  const directories = [path.join(__dirname, "../uploads"), path.join(__dirname, "../uploads/products")]

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`Created directory: ${dir}`)
    }
  })
}

module.exports = createUploadDirectories
