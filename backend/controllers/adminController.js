const User = require('../models/User');
const Client = require('../models/Client');
const Provider = require('../models/Provider');
const ServiceRequest = require('../models/ServiceRequest');



const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-passwordHash');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



const getStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const clientCount = await Client.countDocuments();
        const providerCount = await Provider.countDocuments();
        const requestCount = await ServiceRequest.countDocuments();

        res.status(200).json({
            users: userCount,
            clients: clientCount,
            providers: providerCount,
            serviceRequests: requestCount,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getStats,
};
