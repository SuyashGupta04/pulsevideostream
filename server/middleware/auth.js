const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey123';

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified; // Attaches {id, role, name} to the request
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};