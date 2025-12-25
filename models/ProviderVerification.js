const mongoose = require('mongoose');

const providerVerificationSchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true,
    },
    adminUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin is a User
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
    },
    remarks: {
        type: String,
    }
}, {
    timestamps: true,
});

const ProviderVerification = mongoose.model('ProviderVerification', providerVerificationSchema);

module.exports = ProviderVerification;
