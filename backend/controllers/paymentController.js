// payment logic
const Payment = require('../models/Payment');
const ServiceRequest = require('../models/ServiceRequest');
const Client = require('../models/Client');



const Razorpay = require('razorpay');
const crypto = require('crypto');


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// new order
const createOrder = async (req, res) => {
    try {
        const { requestId } = req.body;

        const serviceRequest = await ServiceRequest.findById(requestId);
        if (!serviceRequest) return res.status(404).json({ message: 'Request not found' });

        const options = {
            amount: serviceRequest.estimatedPrice * 100,
            currency: 'INR',
            receipt: `receipt_${requestId}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);

    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ message: 'Order creation failed', error: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, requestId } = req.body;

        const secret = process.env.RAZORPAY_KEY_SECRET;

        if (!secret) {
            console.error('CRITICAL: RAZORPAY_KEY_SECRET is missing in backend/.env');
            return res.status(500).json({ message: 'Backend Secret Key is missing!' });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        console.log('Expected:', expectedSignature);
        console.log('Received:', razorpay_signature);

        if (expectedSignature === razorpay_signature) {
            const serviceReq = await ServiceRequest.findById(requestId);
            if (!serviceReq) {
                console.error('Service Request not found for ID:', requestId);
                return res.status(404).json({ message: 'Service Request not found' });
            }

            const client = await Client.findOne({ userId: req.user._id });
            if (!client) {
                console.error('Client profile not found for user:', req.user._id);
                return res.status(404).json({ message: 'Client profile not found' });
            }

            const payment = await Payment.create({
                requestId,
                clientId: client._id,
                providerId: serviceReq.providerId || null,
                amount: serviceReq.estimatedPrice,
                method: 'razorpay',
                transactionId: razorpay_payment_id,
                paymentStatus: 'completed'
            });

            serviceReq.status = 'accepted';
            await serviceReq.save();

            console.log('Payment Verified and Saved successfully');
            res.status(200).json({ message: 'Payment verified', payment });
        } else {
            console.warn('Signature Mismatch!');
            res.status(400).json({ message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('FATAL VERIFICATION ERROR:', error);
        res.status(500).json({ message: 'Payment verification failed', error: error.message });
    }
};



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
    createOrder,
    verifyPayment,
    getPaymentDetails,
};
