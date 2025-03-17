const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nickname: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    instrument: String,
    isAdmin: { type: Boolean, default: false }, // Track if user is admin
});

module.exports = mongoose.model('User', UserSchema);
