const express = require('express');
const router = express.Router();
const multer = require('multer'); // Import Multer
const path = require('path');
const auth = require('../middleware/auth'); // Import Auth Middleware
const { uploadVideo, streamVideo, getVideos, deleteVideo } = require('../controllers/videocontroller');

// --- 1. CONFIGURE MULTER (This was missing!) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this matches your folder name
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp + original name
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage }); // Define the 'upload' variable

// --- 2. DEFINE ROUTES ---

// Protected Routes (Require Login)
router.post('/upload', auth, upload.single('video'), uploadVideo); // Now 'upload' exists
router.get('/', auth, getVideos);     
router.delete('/:id', auth, deleteVideo);

// Public Routes
router.get('/stream/:id', streamVideo); 

module.exports = router;