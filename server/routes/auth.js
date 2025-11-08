const express = require('express');
const router = express.Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exist' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: null, passwordHash: hashedPassword });
        await newUser.save();

        // Issue token on successful registration
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: 'User registerd succesfully', token });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }

});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        // Prefer new passwordHash; fallback to legacy password
        const storedHash = user.passwordHash || user.password;
        if (!storedHash) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, storedHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

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
      user = await User.create({ email, googleId, name, picture, avatar: picture, password: null });
    } else if (!user.googleId) {
      // User local có cùng email → gán googleId để lần sau One Tap vẫn khớp
      user.googleId = googleId;
      if (!user.name) user.name = name;
      if (!user.picture) user.picture = picture;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      success: true,
      token: appToken,
      user: { email: user.email, name: user.name, avatar: user.avatar || user.picture },
    });
  } catch (err) {
    console.error("Google Verify Error:", err);
    return res.status(401).json({ success: false, message: "Invalid Google token" });
  }
});

// Forgot password - blind response, rate-limited, email validated
router.post('/forgot-password', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), async (req, res) => {
  const SAFE_RESPONSE = { message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' };

  try {
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.json(SAFE_RESPONSE);

    const email = parsed.data.email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.json(SAFE_RESPONSE);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPassword = { tokenHash, expiresAt, usedAt: null, attempts: 0 };
    await user.save();

    const base = process.env.CLIENT_BASE_URL || req.headers.origin || 'http://localhost:5173';
    const resetUrl = `${base.replace(/\/$/, '')}/reset-password?uid=${user._id}&token=${token}`;
    await sendResetEmail(user.email, resetUrl);

    return res.json(SAFE_RESPONSE);
  } catch (err) {
    // Always return safe response to avoid leaking existence
    return res.json(SAFE_RESPONSE);
  }
});

async function sendResetEmail(to, url) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Resume Builder" <no-reply@resume-builder>',
    to,
    subject: 'Đặt lại mật khẩu',
    html: `<p>Bạn vừa yêu cầu đặt lại mật khẩu.</p>
           <p>Nhấn vào <a href="${url}">liên kết này</a> (hết hạn sau 15 phút).</p>`,
  });
}

// Reset password using uid+token and set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { uid, token, newPassword } = req.body;

    const user = await User.findById(uid);
    if (!user || !user.resetPassword?.tokenHash) {
      return res.status(400).json({ message: 'Token không hợp lệ' });
    }

    if (user.resetPassword.usedAt) {
      return res.status(400).json({ message: 'Token đã được sử dụng' });
    }
    if (new Date() > new Date(user.resetPassword.expiresAt)) {
      return res.status(400).json({ message: 'Token đã hết hạn' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (tokenHash !== user.resetPassword.tokenHash) {
      user.resetPassword.attempts = (user.resetPassword.attempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: 'Token không hợp lệ' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.password = null; // clear legacy field
    user.resetPassword.usedAt = new Date();
    user.sessionsVersion = (user.sessionsVersion || 0) + 1;
    await user.save();

    return res.json({ message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
