const express = require('express');
const router = express.Router();
const { protect, admin, adminOrProvider } = require('../middleware/authMiddleware');
const { getAllUsers, getStats, deleteUser, getPendingAdmins, approveAdmin, toggleUserStatus } = require('../controllers/adminController');

router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.patch('/users/:id/toggle-status', protect, admin, toggleUserStatus);
router.get('/stats', protect, adminOrProvider, getStats);
router.get('/pending-admins', protect, admin, getPendingAdmins);
router.patch('/approve-admin/:id', protect, admin, approveAdmin);

module.exports = router;

