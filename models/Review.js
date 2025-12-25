const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
    }
}, {
    timestamps: true,
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
