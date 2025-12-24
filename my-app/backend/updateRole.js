require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateUserRole = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update lavanya's role to shopkeeper
    const user = await User.findOneAndUpdate(
      { email: 'lav@gmail.com' },
      { role: 'shopkeeper' },
      { new: true }
    );

    if (user) {
      console.log('✅ Successfully updated user role!');
      console.log('User:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
    } else {
      console.log('❌ User not found');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

updateUserRole();
