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

        if (user.role === 'superadmin' && req.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Cannot change the role of another superadmin in this way' });
        }

        user.role = role;

        if (role === 'admin' || role === 'superadmin') {
            user.isApproved = true;
            
            const adminExists = await Admin.findOne({ userId: user._id });
            if (!adminExists) {
                await Admin.create({ userId: user._id });
            }
        }

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
        const { timeRange = '7d' } = req.query;

        let daysToLoop = 7;
        let dateFilter = {};

        if (timeRange === '7d') {
            daysToLoop = 7;
            const d = new Date();
            d.setDate(d.getDate() - 6);
            dateFilter = { $gte: d };        } else if (timeRange === '30d') {
            daysToLoop = 30;
            const d = new Date();
            d.setDate(d.getDate() - 29);
            dateFilter = { $gte: d };
        } else if (timeRange === '6m') {
            const d = new Date();
            d.setMonth(d.getMonth() - 5);
            d.setDate(1); 
            dateFilter = { $gte: d };
        }

        const query = {
            claimedBy: targetAdminId,
            status: 'completed',
            updatedAt: dateFilter
        };

        const completedRequests = await ServiceRequest.find(query).sort({ updatedAt: 1 });

        const totalCompleted = completedRequests.length;

        let totalRevenue = 0;
        completedRequests.forEach(req => {
            totalRevenue += req.estimatedPrice || 0;
        });

        const chartDataMap = {};
        const today = new Date();
        if (timeRange === '6m') {
            let startMonth = new Date(today.getFullYear(), today.getMonth() - 5, 1); 

            const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            let loopDate = new Date(startMonth);
            
            while (loopDate <= currentMonth) {
                const key = `${loopDate.getFullYear()}-${String(loopDate.getMonth() + 1).padStart(2, '0')}`;
                const dateStr = loopDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                chartDataMap[key] = { date: dateStr, jobs: 0, revenue: 0, sortKey: key };
                
                loopDate.setMonth(loopDate.getMonth() + 1);
            }

            completedRequests.forEach(req => {
                const d = new Date(req.updatedAt);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                
                if (chartDataMap[key]) {
                     chartDataMap[key].jobs += 1;
                     chartDataMap[key].revenue += (req.estimatedPrice || 0);
                }
            });
        } else {
            for (let i = daysToLoop - 1; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0]; 
                const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                chartDataMap[key] = { date: dateStr, jobs: 0, revenue: 0, sortKey: key };
            }

            completedRequests.forEach(req => {
                const d = new Date(req.updatedAt);
                const key = d.toISOString().split('T')[0];
                
                if (chartDataMap[key]) {
                    chartDataMap[key].jobs += 1;
                    chartDataMap[key].revenue += (req.estimatedPrice || 0);
                }
            });
        }

        const chartData = Object.values(chartDataMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

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

