const express = require('express');
const router = express.Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exist' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registerd succesfully' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }

});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        //Sai email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        //Sai mat khau
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        //Set token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Issue a temporary 12h guest token
router.post('/guest', (req, res) => {
    try {
        const sessionId = crypto.randomUUID();
        const token = jwt.sign(
            { type: 'guest', sessionId },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );
        return res.json({ token, expiresIn: 12 * 60 * 60 });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Tìm theo email để hợp nhất tài khoản
    let user = await User.findOne({ email });

    if (!user) {
      // User Google lần đầu
      user = await User.create({ email, googleId, name, picture, password: null });
    } else if (!user.googleId) {
      // User local có cùng email → gán googleId để lần sau One Tap vẫn khớp
      user.googleId = googleId;
      if (!user.name) user.name = name;
      if (!user.picture) user.picture = picture;
      await user.save();
    }

    const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      success: true,
      token: appToken,
      user: { email: user.email, name: user.name, picture: user.picture },
    });
  } catch (err) {
    console.error("Google Verify Error:", err);
    return res.status(401).json({ success: false, message: "Invalid Google token" });
  }
});

module.exports = router;
