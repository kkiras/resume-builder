const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    googleId: { type: String, default: null },
    name: String,
    picture: String
});
module.exports = mongoose.model('User', userSchema);