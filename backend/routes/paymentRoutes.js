const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentDetails } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { sensitiveActionLimiter } = require('../middleware/rateLimiter');

router.post('/create-order', protect, sensitiveActionLimiter, createOrder);
router.post('/verify', protect, sensitiveActionLimiter, verifyPayment);
router.get('/:id', protect, getPaymentDetails);

module.exports = router;
