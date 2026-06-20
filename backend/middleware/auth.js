const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET not set');
  process.exit(1);
}

// Verify any token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Verify specific user types
const verifyStudent = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.userType !== 'student') {
      return res.status(403).json({ error: 'Access denied. Student only.' });
    }
    req.studentId = req.user.id;
    next();
  });
};

const verifyParent = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.userType !== 'parent') {
      return res.status(403).json({ error: 'Access denied. Parent only.' });
    }
    req.parentId = req.user.id;
    next();
  });
};

const verifyStaff = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.userType !== 'staff') {
      return res.status(403).json({ error: 'Access denied. Staff only.' });
    }
    req.staffId = req.user.id;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    req.adminId = req.user.id;
    next();
  });
};

// Generate token helper
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Update last login helper
const updateLastLogin = (table, id) => {
  db.query(`UPDATE ?? SET last_login = NOW() WHERE id = ?`, [table, id], (err) => {
    if (err) console.warn('Could not update last_login:', err.message);
  });
};

module.exports = {
  verifyToken,
  verifyStudent,
  verifyParent,
  verifyStaff,
  verifyAdmin,
  generateToken,
  updateLastLogin
};