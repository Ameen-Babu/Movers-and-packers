const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
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
        enum: ['pending', 'accepted', 'completed', 'cancelled'],
        default: 'pending',
    },
    estimatedPrice: {
        type: Number,
    },
    finalPrice: {
        type: Number,
    }
}, {
    timestamps: true,
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;
