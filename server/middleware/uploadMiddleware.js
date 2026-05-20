/**
 * Purpose: Middleware for handling multipart/form-data (image uploads).
 * Inputs: HTTP Request with form-data.
 * Outputs: req.file.buffer containing image data.
 */

import multer from 'multer';

// Configure Multer for in-memory storage
const storage = multer.memoryStorage();

// Filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

export default upload.single('foodImage');
