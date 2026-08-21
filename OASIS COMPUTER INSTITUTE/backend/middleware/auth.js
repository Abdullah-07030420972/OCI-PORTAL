const jwt = require('jsonwebtoken');

function authRequired(role) {
  return function (req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'You must be logged in.' });
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (role && payload.role !== role) {
        return res.status(403).json({ error: 'Not authorized for this action.' });
      }
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
    }
  };
}

module.exports = authRequired;
