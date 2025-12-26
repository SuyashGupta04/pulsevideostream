const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey123';

// 1. Register / Setup (To create the first admin)
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Hash the password so it's secure
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
};

// 2. Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) return res.status(400).json({ error: 'User not found' });

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate Token
    const token = jwt.sign({ id: user._id, role: user.role, name: user.username }, SECRET_KEY, { expiresIn: '1h' });
    
    res.json({ token, user: { name: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};