const express = require('express');
const router = express.Router();
const { processPayment, getPaymentDetails } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, processPayment);
router.get('/:id', protect, getPaymentDetails);

module.exports = router;
