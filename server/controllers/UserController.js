const User = require('../model/User');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary once at module load
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class UserController {
  static async getMe(req, res) {
    try {
      const auth = req.auth || {};
      if (auth.type !== 'user' || !auth.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await User.findById(auth.userId).lean();
      if (!user) return res.status(404).json({ message: 'User not found' });

      return res.json({
        user: {
          id: user._id,
          email: user.email || '',
          name: user.name || '',
          phone: user.phone || '',
          location: user.location || '',
          // Prefer avatar, fallback to picture
          avatar: user.avatar || user.picture || '',
          isGoogle: !!user.googleId,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async updateMe(req, res) {
    try {
      const auth = req.auth || {};
      if (auth.type !== 'user' || !auth.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name = '', phone = '', location = '', avatar = '' } = req.body || {};
      const updated = await User.findByIdAndUpdate(
        auth.userId,
        {
          name,
          phone,
          location,
          avatar,
        },
        { new: true }
      ).lean();

      if (!updated) return res.status(404).json({ message: 'User not found' });

      return res.json({
        user: {
          id: updated._id,
          email: updated.email || '',
          name: updated.name || '',
          phone: updated.phone || '',
          location: updated.location || '',
          avatar: updated.avatar || updated.picture || '',
        },
        message: 'Profile updated',
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async uploadAvatar(req, res) {
    try {
      const auth = req.auth || {};
      if (auth.type !== 'user' || !auth.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { image } = req.body || {};
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ message: 'Missing image' });
      }

      const folder = process.env.CLOUDINARY_FOLDER_PROFILE || 'profile-avatar';
      const result = await cloudinary.uploader.upload(image, {
        folder,
        resource_type: 'image',
        overwrite: true,
      });

      return res.status(200).json({ url: result.secure_url });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

module.exports = UserController;
