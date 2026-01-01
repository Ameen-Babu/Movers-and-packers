const Review = require('../models/Review');
const ServiceRequest = require('../models/ServiceRequest');
const Client = require('../models/Client');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Client)
const createReview = async (req, res) => {
    try {
        const { requestId, rating, comment } = req.body;

        // Verify request exists
        const request = await ServiceRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        // Verify client owns the request
        const client = await Client.findOne({ userId: req.user._id });
        if (!client || request.clientId.toString() !== client._id.toString()) {
            return res.status(403).json({ message: 'You can only review your own requests' });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ requestId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this request' });
        }

        const review = await Review.create({
            requestId,
            clientId: client._id,
            providerId: request.providerId,
            rating,
            comment,
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
const getProviderReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ providerId: req.params.providerId })
            .populate('clientId', 'userId')
            .sort('-createdAt');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createReview,
    getProviderReviews,
};
