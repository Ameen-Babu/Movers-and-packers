const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema({
    
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    otpHash: {
        type: String,
        required: true
    },
    userData: {
        name: { type: String, required: true },
        passwordHash: { type: String, required: true },
        phone: { type: String, required: true },
        role: { type: String, enum: ['client', 'admin'], default: 'client' },
        address: { type: String },
        city: { type: String },
        pincode: { type: String },
        companyName: { type: String },
        licenseNo: { type: String }
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5
    },
    resendCount: {
        type: Number,
        default: 0,
        max: 3
    },
    lastSentAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900
    }
}, {
    timestamps: true
});

const PendingRegistration = mongoose.model('PendingRegistration', pendingRegistrationSchema);

module.exports = PendingRegistration;
