const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true },
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'safe', 'flagged'], 
    default: 'processing' 
  },
  sensitivityScore: { type: Number, default: 0 },
  // NEW FIELDS
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to User
  thumbnail: { type: String } // Path to image
});

module.exports = mongoose.model('Video', VideoSchema);