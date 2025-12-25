const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String, // e.g., 'booking_update', 'payment'
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
