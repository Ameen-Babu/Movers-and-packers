const express = require('express');
const router = express.Router();
const { createReview, getAdminReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/admin/:adminId', getAdminReviews);

module.exports = router;
