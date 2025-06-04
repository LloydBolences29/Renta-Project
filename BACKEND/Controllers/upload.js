const multer = require('multer');
const path = require('path');

// Set up storage options for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the directory to store uploaded files
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Append a timestamp to the original file name to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Preserve the file extension
  }
});

// Create the Multer upload instance
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // Limit file size to 2MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File type not supported!'));
  }
});

// Export the upload middleware
module.exports = upload;
