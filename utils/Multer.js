const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Temporary upload folder
const tmpDir = path.join(os.tmpdir(), 'rubbersense_uploads');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, base + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Increased to 10MB per file
    files: 5 // Maximum 5 files
  }
});

// Enhanced middleware that handles both JSON and file uploads
exports.uploadWithJson = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  console.log('🔍 uploadWithJson middleware - Content-Type:', contentType);
  console.log('Method:', req.method);
  
  if (contentType.includes('multipart/form-data')) {
    // Use .fields() to capture file AND text fields from multipart form-data
    // This ensures req.body is populated with text fields
    upload.fields([
      { name: 'profilePicture', maxCount: 1 },
      { name: 'avatar', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        console.error('❌ Multer error:', err.message);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }
      
      console.log('✅ Multipart parsed successfully');
      console.log('Body fields:', Object.keys(req.body || {}));
      console.log('Files received:', req.files ? Object.keys(req.files) : 'none');
      console.log('Single file:', req.file);
      
      // Convert files object to single req.file if only one file
      if (req.files) {
        if (req.files.profilePicture && req.files.profilePicture.length > 0) {
          req.file = req.files.profilePicture[0];
        } else if (req.files.avatar && req.files.avatar.length > 0) {
          req.file = req.files.avatar[0];
        }
      }
      
      next();
    });
  } else {
    // For JSON requests, just parse the body
    // Express.json() should already have parsed it
    console.log('ℹ️ Not multipart, checking if JSON...');
    if (contentType.includes('application/json')) {
      console.log('✅ JSON body parsed:', Object.keys(req.body || {}));
    }
    next();
  }
};

// Keep original for other routes that only need file upload
exports.upload = upload;
