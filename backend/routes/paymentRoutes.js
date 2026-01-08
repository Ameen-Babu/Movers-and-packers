const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentDetails } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:id', protect, getPaymentDetails);

module.exports = router;
