const router = require('express').Router();
const auth = require('../middlewares/auth');

// Example of a guest-only temporary endpoint
router.post('/draft', auth, async (req, res) => {
  if (req.auth?.type !== 'guest') {
    return res.status(400).json({ message: 'Use guest token for this endpoint' });
  }

  // Handle temporary/preview work here (no permanent DB writes)
  return res.json({ ok: true, sessionId: req.auth.sessionId });
});

module.exports = router;

