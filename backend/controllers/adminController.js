// admin side
const User = require('../models/User');
const Client = require('../models/Client');
const Admin = require('../models/Admin');
const ServiceRequest = require('../models/ServiceRequest');
const Payment = require('../models/Payment');



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
        const requestCount = await ServiceRequest.countDocuments();

        res.status(200).json({
            users: userCount,
            clients: clientCount,
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
        const pendingAdmins = await User.find({ role: { $in: ['admin', 'superadmin'] }, isApproved: false }).select('-passwordHash');
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
        if (user.role === 'admin' || user.role === 'superadmin') return res.status(400).json({ message: 'Cannot deactivate an admin account' });

        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({ message: `Account ${user.isActive ? 'activated' : 'deactivated'} successfully`, isActive: user.isActive });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['client', 'admin', 'superadmin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Protect superadmin accounts from being downgraded by another superadmin
        if (user.role === 'superadmin' && req.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Cannot change the role of another superadmin in this way' });
        }

        user.role = role;

        // Auto-approve newly promoted admins/superadmins
        if (role === 'admin' || role === 'superadmin') {
            user.isApproved = true;
            
            // Ensure Admin profile exists
            const adminExists = await Admin.findOne({ userId: user._id });
            if (!adminExists) {
                await Admin.create({ userId: user._id });
            }
        }

        // Ensure Client profile exists
        if (role === 'client') {
            const clientExists = await Client.findOne({ userId: user._id });
            if (!clientExists) {
                await Client.create({ userId: user._id });
            }
        }

        await user.save();
        res.status(200).json({ message: `User role updated to ${role} successfully`, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAdminPerformance = async (req, res) => {
    try {
        let targetAdminId = req.user._id;

        // If superadmin requests another admin's stats
        if (req.user.role === 'superadmin' && req.query.adminId) {
             targetAdminId = req.query.adminId;
        }

        // Fetch completed requests claimed by this admin
        const completedRequests = await ServiceRequest.find({
            claimedBy: targetAdminId,
            status: 'completed'
        });

        const totalCompleted = completedRequests.length;

        // Calculate total revenue from these completed requests (using Payments if available, or estimatedPrice)
        let totalRevenue = 0;
        completedRequests.forEach(req => {
            totalRevenue += req.estimatedPrice || 0;
        });

        // Generate simple chart data mapping dates to completed jobs and revenue
        const chartDataMap = {};

        completedRequests.forEach(req => {
            // Using updatedAt as completion date approximation
            const date = new Date(req.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!chartDataMap[date]) {
                chartDataMap[date] = { date, jobs: 0, revenue: 0 };
            }
            chartDataMap[date].jobs += 1;
            chartDataMap[date].revenue += (req.estimatedPrice || 0);
        });

        // Convert map to sorted array
        const chartData = Object.values(chartDataMap).sort((a, b) => new Date(a.date) - new Date(b.date));

        // Create some empty dates if there's no data to make graph look better
        if (chartData.length === 0) {
            const today = new Date();
            for(let i=4; i>=0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                chartData.push({
                    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    jobs: 0,
                    revenue: 0
                });
            }
        }

        res.status(200).json({
            totalCompleted,
            totalRevenue,
            chartData
        });

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
    updateUserRole,
    getAdminPerformance,
};

