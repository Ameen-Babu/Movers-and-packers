const mongoose = require('mongoose');

// Base User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'client', 'provider'],
        required: true,
    }
}, {
    timestamps: true, // Adds createdAt
});

const User = mongoose.model('User', userSchema);

module.exports = User;
