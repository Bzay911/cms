const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Extract the Authorization header
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization denied. Missing or malformed token.' });
  }

  // Extract the token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization denied. Missing token.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded.adminId;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
