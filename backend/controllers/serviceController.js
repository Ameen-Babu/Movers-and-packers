// service logic
const ServiceRequest = require('../models/ServiceRequest');
const Client = require('../models/Client');
const Provider = require('../models/Provider');



const createServiceRequest = async (req, res) => {
    try {
        const { pickupLocation, dropoffLocation, movingDate, serviceType, estimatedPrice } = req.body;

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
            estimatedPrice,
        });

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
        } else if (req.user.role === 'provider') {
            const provider = await Provider.findOne({ userId: req.user._id });
            requests = await ServiceRequest.find({ providerId: provider._id });
        } else if (req.user.role === 'admin') {
            requests = await ServiceRequest.find({});
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
            .populate('providerId', 'companyName');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

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

        if (req.user.role === 'admin') {
            request.status = status;
        } else if (req.user.role === 'client') {
            const client = await Client.findOne({ userId: req.user._id });

            if (!client || request.clientId.toString() !== client._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this request' });
            }

            if (status !== 'cancelled') {
                return res.status(400).json({ message: 'Clients can only cancel requests' });
            }

            if (request.status !== 'pending' && request.status !== 'accepted') {
                return res.status(400).json({ message: 'Only pending or accepted requests can be cancelled' });
            }

            request.status = 'cancelled';
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
    updateServiceStatus,
    deleteServiceRequest
};
