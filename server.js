const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Resolve the .env path based on the directory where this file is located
const envPath = path.join(__dirname, 'config', '.env');

// Load environment variables FIRST, before any other imports
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.log('❌ Error loading .env from', envPath);
    console.log('Error:', result.error.message);
    process.exit(1);
  }
  console.log('✅ Environment variables loaded from:', envPath);
} else {
  console.log('ℹ️  No local .env found at', envPath);
  console.log('ℹ️  Using environment variables provided by the host (e.g., Render)');
}

console.log('✅ Environment variables check');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');

// Initialize Firebase Admin SDK at startup to catch configuration errors early
console.log('\n🔧 Initializing Firebase Admin SDK...');
try {
  require('./utils/firebaseAdmin');
  console.log('✅ Firebase Admin SDK initialized successfully\n');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  console.error('Check your Firebase configuration in config/.env or Render env vars');
  process.exit(1);
}

// Now import other modules AFTER environment variables are loaded
const app = require('./app');
const connectDatabase = require('./config/db');

connectDatabase();

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port: ${port} in ${process.env.NODE_ENV} mode`);
});
