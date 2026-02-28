const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
    },
    pickupLocation: {
        type: String,
        required: true,
    },
    dropoffLocation: {
        type: String,
        required: true,
    },
    movingDate: {
        type: Date,
        required: true,
    },
    serviceType: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'claimed', 'accepted', 'completed', 'cancelled'],
        default: 'pending',
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    estimatedPrice: {
        type: Number,
    },
    weight: {
        type: Number,
    },
    finalPrice: {
        type: Number,
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid',
    }
}, {
    timestamps: true,
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;
