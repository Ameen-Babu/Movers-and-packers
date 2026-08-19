const Payment = require('../models/Payment');
const ServiceRequest = require('../models/ServiceRequest');
const Client = require('../models/Client');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw new Error('Razorpay credentials missing in environment variables');
    }

    return new Razorpay({ key_id, key_secret });
};

const createOrder = async (req, res) => {
    try {
        const { requestId } = req.body;

        if (!requestId) {
            return res.status(400).json({ message: 'Request ID is required' });
        }

        const serviceRequest = await ServiceRequest.findById(requestId);
        if (!serviceRequest) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        const razorpay = getRazorpayInstance();
        const amount = Math.round((serviceRequest.estimatedPrice || 0) * 100);

        if (amount <= 0) {
            return res.status(400).json({ message: 'Invalid price for payment' });
        }

        const options = {
            amount,
            currency: 'INR',
            receipt: `receipt_${requestId.toString().slice(-12)}`
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error('Razorpay Order Creation Error:', error);
        res.status(500).json({ message: 'Order creation failed', error: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, requestId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !requestId) {
            return res.status(400).json({ message: 'Missing required payment verification details' });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return res.status(500).json({ message: 'Server configuration error: missing secret key' });
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        const bufA = Buffer.from(expectedSignature, 'utf-8');
        const bufB = Buffer.from(razorpay_signature, 'utf-8');
        const isSignatureValid = bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);

        if (!isSignatureValid) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        const serviceReq = await ServiceRequest.findById(requestId);
        if (!serviceReq) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        const client = await Client.findOne({ userId: req.user._id });
        if (!client) {
            return res.status(404).json({ message: 'Client profile not found' });
        }

        const payment = await Payment.findOneAndUpdate(
            { requestId },
            {
                requestId,
                clientId: client._id,
                adminId: serviceReq.claimedBy || null,
                amount: serviceReq.estimatedPrice,
                method: 'razorpay',
                transactionId: razorpay_payment_id,
                paymentStatus: 'completed'
            },
            { upsert: true, new: true, runValidators: true }
        );

        serviceReq.paymentStatus = 'paid';
        await serviceReq.save();

        res.status(200).json({ message: 'Payment verified successfully', payment });
    } catch (error) {
        console.error('Razorpay Verification Error:', error);
        res.status(500).json({ message: 'Payment verification failed', error: error.message });
    }
};

const getPaymentDetails = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('requestId')
            .populate('adminId', 'user');

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getPaymentDetails
};

