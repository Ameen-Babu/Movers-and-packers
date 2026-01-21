const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: true,
        unique: true,
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
    },
    amount: {
        type: Number,
        required: true,
    },
    method: {
        type: String,
        enum: ['card', 'cash', 'upi', 'razorpay'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    releaseStatus: {
        type: String, // e.g., 'held', 'released'
        default: 'held',
    },
    transactionId: {
        type: String,
    }
}, {
    timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
