const dotenv = require('dotenv');
dotenv.config({ path: './config/.env' });

const mongoose = require('mongoose');
const User = require('./models/User');

const makeUserAdmin = async (email) => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`✅ User "${user.name}" (${user.email}) is now an ADMIN!`);
    console.log(`User ID: ${user._id}`);
    console.log(`Role: ${user.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const email = process.argv[2];

if (!email) {
  console.log('Usage: node makeAdmin.js <email>');
  console.log('Example: node makeAdmin.js admin@example.com');
  process.exit(1);
}

makeUserAdmin(email);
