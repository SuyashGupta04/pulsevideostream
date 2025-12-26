require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
// ... imports ...

const app = express();

// Allow requests from your future Vercel frontend
app.use(cors({
  origin: process.env.CLIENT_URL || "*", // Allow all or specific client
  methods: ["GET", "POST", "DELETE"]
}));

// ... routes ...

// Change the listen port to use the Cloud's assigned port
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});