const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');

router.post('/register', register); // This creates /api/auth/register
router.post('/login', login);       // This creates /api/auth/login

module.exports = router;