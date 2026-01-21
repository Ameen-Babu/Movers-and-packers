const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    licenseNo: {
        type: String,
        required: true,
        unique: true,
    },
    serviceAreas: [
        {
            type: String,
        }
    ],
    availabilityStatus: {
        type: Boolean,
        default: true,
    },
    avgRating: {
        type: Number,
        default: 0,
    },
    totalJobsCompleted: {
        type: Number,
        default: 0,
    }
});

const Provider = mongoose.model('Provider', providerSchema);

module.exports = Provider;
