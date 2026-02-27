// admin side
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

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getPendingAdmins = async (req, res) => {
    try {
        const pendingAdmins = await User.find({ role: 'admin', isApproved: false }).select('-passwordHash');
        res.status(200).json(pendingAdmins);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const approveAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role !== 'admin') return res.status(400).json({ message: 'User is not an admin' });

        user.isApproved = true;
        await user.save();
        res.status(200).json({ message: 'Admin approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Cannot deactivate an admin account' });

        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({ message: `Account ${user.isActive ? 'activated' : 'deactivated'} successfully`, isActive: user.isActive });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getStats,
    deleteUser,
    getPendingAdmins,
    approveAdmin,
    toggleUserStatus,
};

