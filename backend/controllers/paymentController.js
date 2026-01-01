const Payment = require('../models/Payment');
const ServiceRequest = require('../models/ServiceRequest');
const Client = require('../models/Client');

// @desc    Process a payment
// @route   POST /api/payments
// @access  Private (Client)
const processPayment = async (req, res) => {
    try {
        const { requestId, amount, method, transactionId } = req.body;

        const request = await ServiceRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        const client = await Client.findOne({ userId: req.user._id });
        if (!client || request.clientId.toString() !== client._id.toString()) {
            return res.status(403).json({ message: 'You can only pay for your own requests' });
        }

        const payment = await Payment.create({
            requestId,
            clientId: client._id,
            providerId: request.providerId,
            amount,
            method,
            transactionId,
            paymentStatus: 'completed' // Mocking successful payment
        });

        // Update request status if needed
        request.status = 'paid';
        await request.save();

        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
const getPaymentDetails = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('requestId')
            .populate('providerId', 'companyName');

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    processPayment,
    getPaymentDetails,
};
