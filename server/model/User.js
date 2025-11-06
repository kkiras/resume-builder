const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    googleId: { type: String, default: null },
    // Basic profile fields
    name: { type: String, default: '' },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    // Keep old picture field for backward compatibility (e.g., Google login)
    picture: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
