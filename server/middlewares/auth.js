const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type === 'guest') {
      req.auth = { type: 'guest', sessionId: payload.sessionId };
    } else {
      req.auth = { type: 'user', userId: payload.id };
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid/expired token' });
  }
};

