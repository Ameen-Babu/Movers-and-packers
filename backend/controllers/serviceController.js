const ServiceRequest = require('../models/ServiceRequest');
const Client = require('../models/Client');
const User = require('../models/User');
const { sendOrderCreatedEmail, sendOrderCancelledEmail } = require('../utils/emailService');



const createServiceRequest = async (req, res) => {
    try {
        const { pickupLocation, dropoffLocation, movingDate, serviceType, weight, estimatedPrice } = req.body;

        if (!pickupLocation || !dropoffLocation || !movingDate || !serviceType) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const client = await Client.findOne({ userId: req.user._id });
        if (!client) {
            return res.status(403).json({ message: 'Only clients can create service requests' });
        }

        const request = await ServiceRequest.create({
            clientId: client._id,
            pickupLocation,
            dropoffLocation,
            movingDate,
            serviceType,
            weight,
            estimatedPrice,
        });

        const clientUser = await User.findById(req.user._id);
        if (clientUser) {
            sendOrderCreatedEmail({ to: clientUser.email, name: clientUser.name, order: request })
                .catch((err) => console.error('Order created email failed:', err.message));
        }

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getServiceRequests = async (req, res) => {
    try {
        let requests;
        if (req.user.role === 'client') {
            const client = await Client.findOne({ userId: req.user._id });
            requests = await ServiceRequest.find({ clientId: client._id });
        } else if (req.user.role === 'admin' || req.user.role === 'superadmin') {
            if (req.user.role === 'admin' && !req.user.isApproved) {
                requests = [];
            } else if (req.query.view === 'claimed') {
                requests = await ServiceRequest.find({ claimedBy: req.user._id })
                    .populate('claimedBy', 'name');
            } else if (req.query.view === 'pending') {
                requests = await ServiceRequest.find({
                    claimedBy: null,
                    status: 'pending'
                });
            } else {
                requests = await ServiceRequest.find({});
            }
        }

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getServiceRequestById = async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id)
            .populate('clientId', 'address city')
            .populate('adminId', 'user');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const claimServiceRequest = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Only admins and superadmins can claim orders' });
        }

        if (req.user.role === 'admin' && !req.user.isApproved) {
            return res.status(403).json({ message: 'Your account is pending approval' });
        }

        const request = await ServiceRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.claimedBy) {
            return res.status(400).json({ message: 'This order has already been claimed' });
        }

        request.claimedBy = req.user._id;
        request.status = 'claimed';
        await request.save();

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateServiceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (req.user.role === 'admin' || req.user.role === 'superadmin') {
            if (req.user.role === 'admin' && !req.user.isApproved) {
                return res.status(403).json({ message: 'Your account is pending approval' });
            }
            if (req.user.role === 'admin' && request.claimedBy && request.claimedBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Only the admin who claimed this order can update its status' });
            }
            request.status = status;
        } else if (req.user.role === 'client') {
            const client = await Client.findOne({ userId: req.user._id });

            if (!client || request.clientId.toString() !== client._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this request' });
            }

            if (status !== 'cancelled') {
                return res.status(400).json({ message: 'Clients can only cancel requests' });
            }

            if (request.status !== 'pending' && request.status !== 'accepted' && request.status !== 'claimed') {
                return res.status(400).json({ message: 'Only pending, claimed or accepted requests can be cancelled' });
            }

            request.status = 'cancelled';

            const clientUser = await User.findById(req.user._id);
            if (clientUser) {
                sendOrderCancelledEmail({ to: clientUser.email, name: clientUser.name, order: request })
                    .catch((err) => console.error('Order cancelled email failed:', err.message));
            }
        } else {
            return res.status(403).json({ message: 'Not authorized to update status' });
        }

        await request.save();
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteServiceRequest = async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        await ServiceRequest.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createServiceRequest,
    getServiceRequests,
    getServiceRequestById,
    claimServiceRequest,
    updateServiceStatus,
    deleteServiceRequest
};
