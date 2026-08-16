const express = require('express');
const router = express.Router();
const { createReview, getAdminReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { sensitiveActionLimiter } = require('../middleware/rateLimiter');

router.post('/', protect, sensitiveActionLimiter, createReview);
router.get('/admin/:adminId', getAdminReviews);

module.exports = router;
