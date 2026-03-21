const dotenv = require('dotenv');
dotenv.config({ path: './config/.env' });

const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async (email, password, name) => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      console.log(`⚠️ User with email "${email}" already exists. Updating role to admin...`);
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`✅ User "${existingUser.name}" is now an ADMIN!`);
      process.exit(0);
    }

    // Create new admin user
    const adminUser = await User.create({
      name: name || 'Admin',
      email: email.toLowerCase(),
      password: password,
      role: 'admin',
      isVerified: true,
      isActive: true,
      authProvider: 'local',
      avatar: {
        public_id: 'avatar_' + Date.now(),
        url: `https://ui-avatars.com/api/?name=Admin&background=random&color=fff&size=150`
      }
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${adminUser.name}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`User ID: ${adminUser._id}`);
    console.log(`\n🎉 You can now login as admin!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] || 'Admin';

if (!email || !password) {
  console.log('Usage: node createAdmin.js <email> <password> [name]');
  console.log('Example: node createAdmin.js admin@gmail.com 123456 "Admin User"');
  process.exit(1);
}

createAdmin(email, password, name);
