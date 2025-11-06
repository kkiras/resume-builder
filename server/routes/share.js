const express = require('express');
const router = express.Router();
const Resume = require('../model/Resume');
const auth = require('../middlewares/auth');
const { generateShareToken } = require('../utils/share');
const mongoose = require('mongoose');

// Public: get resume by share token
router.get('/shares/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const doc = await Resume.findOne({ 'share.token': token, 'share.enabled': true })
      .select({ name: 1, basics: 1, sections: 1, styles: 1, visibility: 1, 'share.expiresAt': 1 })
      .lean();

    if (!doc) return res.sendStatus(404);
    if (doc.share?.expiresAt && new Date() > new Date(doc.share.expiresAt)) {
      return res.sendStatus(404);
    }
    if (doc.visibility === 'private') return res.sendStatus(404);

    return res.json({ resume: doc });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Change visibility: private | public | link
router.patch('/resumes/:id/visibility', auth, async (req, res) => {
  try {
    if (!req.auth || req.auth.type !== 'user') {
      return res.status(401).json({ message: 'Login required' });
    }
    const { id } = req.params;
    
    const { visibility } = req.body || {};
    console.log(id, visibility)
    console.log(new mongoose.Types.ObjectId(id), new mongoose.Types.ObjectId(req.auth.userId))
    if (!['private', 'public', 'link'].includes(visibility)) {
      return res.status(400).json({ message: 'Invalid visibility' });
    }

    const doc = await Resume.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(req.auth.userId)
    });

    if (!doc) return res.sendStatus(404);

    doc.visibility = visibility;
    if (visibility === 'private') {
      doc.share = { ...(doc.share || {}), enabled: false };
    }
    await doc.save();

    res.json({ ok: true, visibility: doc.visibility, shareEnabled: !!doc.share?.enabled });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Enable share (create token if missing)
router.post('/resumes/:id/share/enable', auth, async (req, res) => {
  try {
    if (!req.auth || req.auth.type !== 'user') {
      return res.status(401).json({ message: 'Login required' });
    }
    const { id } = req.params;
    const doc = await Resume.findOne({ _id: id, userId: req.auth.userId });
    if (!doc) return res.sendStatus(404);

    const now = new Date();
    if (!doc.share?.token) {
      doc.share = { ...(doc.share || {}), token: generateShareToken(18) };
    }

    doc.share.enabled = true;
    doc.share.expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    doc.share.lastRotatedAt = now;
    await doc.save();

    res.json({ ok: true, token: doc.share.token, expiresAt: doc.share.expiresAt });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Rotate token
router.post('/resumes/:id/share/rotate', auth, async (req, res) => {
  try {
    if (!req.auth || req.auth.type !== 'user') {
      return res.status(401).json({ message: 'Login required' });
    }
    const { id } = req.params;
    const doc = await Resume.findOne({ _id: id, userId: req.auth.userId });
    if (!doc) return res.sendStatus(404);

    const now = new Date();
    doc.share = { ...(doc.share || {}) };
    doc.share.token = generateShareToken(18);
    doc.share.enabled = true;
    doc.share.lastRotatedAt = now;
    doc.share.expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    await doc.save();

    res.json({ ok: true, token: doc.share.token, expiresAt: doc.share.expiresAt });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
