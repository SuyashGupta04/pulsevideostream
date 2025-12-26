const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static'); // NEW
ffmpeg.setFfmpegPath(ffmpegPath);            // NEW
// --- HELPER 1: Generate Thumbnail ---
const generateThumbnail = (videoPath, filename) => {
  return new Promise((resolve, reject) => {
    // Check if ffmpeg is available, otherwise skip thumbnail
    resolve(null); 
    
    // Uncomment this block if you have ffmpeg installed and want real thumbnails:
    /*
    ffmpeg(videoPath)
      .on('end', () => resolve(`thumb-${filename}.png`))
      .on('error', (err) => resolve(null)) // Fail silently if ffmpeg error
      .screenshots({
        count: 1,
        folder: path.join(__dirname, '../uploads'),
        filename: `thumb-${filename}.png`,
        size: '320x180'
      });
    */
  });
};

// --- HELPER 2: Mock AI Processing ---
const processVideoSensitivity = (videoId, io) => {
  let progress = 0;
  const interval = setInterval(async () => {
    progress += 20;
    if (io) io.emit('videoProgress', { videoId, progress, status: 'processing' });

    if (progress >= 100) {
      clearInterval(interval);
      const isSensitive = Math.random() < 0.3; // 30% chance of being flagged
      await Video.findByIdAndUpdate(videoId, { 
        status: isSensitive ? 'flagged' : 'safe',
        sensitivityScore: isSensitive ? 0.9 : 0.1
      });
      if (io) io.emit('videoProgress', { videoId, progress: 100, status: isSensitive ? 'flagged' : 'safe' });
    }
  }, 1000);
};

// --- 1. UPLOAD VIDEO ---
exports.uploadVideo = async (req, res) => {
  try {
    // Try to generate thumbnail (optional)
    let thumbName = null;
    try {
       // logic can go here if ffmpeg is enabled
    } catch (e) { console.log("Thumbnail skipped"); }

    const video = new Video({
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      uploader: req.user.id, // Linked to User
      thumbnail: thumbName,
      status: 'processing'
    });
    await video.save();

    // Trigger processing
    processVideoSensitivity(video._id, req.io);

    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 2. GET VIDEOS (With Filtering) ---
exports.getVideos = async (req, res) => {
  try {
    let query = {};

    // OPTION 1 (YouTube Style): Everyone sees everything
    // (We removed the "if user is not admin" check)
    
    // OPTION 2 (Safe Mode - Optional): 
    // If you want Viewers to ONLY see "Safe" videos (hide flagged/processing):
    /* if (req.user.role !== 'admin') {
      query.status = 'safe'; 
    }
    */

    const videos = await Video.find(query)
      .populate('uploader', 'username') // Show who uploaded it
      .sort({ uploadDate: -1 });
      
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 3. STREAM VIDEO ---
exports.streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).send('Video not found');

    const videoPath = path.join(__dirname, '../uploads', video.filename);
    
    if (!fs.existsSync(videoPath)) return res.status(404).send('File missing');

    const videoSize = fs.statSync(videoPath).size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': videoSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

// --- 4. DELETE VIDEO (Admin Only) ---
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (video) {
      const filePath = path.join(__dirname, '../uploads', video.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await Video.findByIdAndDelete(req.params.id);
      res.json({ message: 'Video deleted' });
    } else {
      res.status(404).json({ error: 'Video not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};