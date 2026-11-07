const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { effectiveRole } = require('../utils/role');
module.exports = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authenticated' });
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    if (!user.isActive) return res.status(403).json({ message: 'This account has been disabled.' });
    user.role = effectiveRole(user); // enforced on every request
    req.user = user;
    next();
  } catch { res.status(401).json({ message: 'Session expired. Please log in again.' }); }
};
