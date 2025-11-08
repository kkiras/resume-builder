const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    // Legacy field (kept for backward compatibility)
    password: { type: String, default: null },
    // New canonical password field
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null },
    // Basic profile fields
    name: { type: String, default: '' },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    // Keep old picture field for backward compatibility (e.g., Google login)
    picture: { type: String, default: '' },

    // Sessions/versioning for invalidating old sessions
    sessionsVersion: { type: Number, default: 0 },

    // Reset password metadata
    resetPassword: {
        tokenHash: { type: String, default: null },
        expiresAt: { type: Date, default: null },
        usedAt: { type: Date, default: null },
        attempts: { type: Number, default: 0 },
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
