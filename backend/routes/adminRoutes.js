const express = require('express');
const router = express.Router();
const { protect, admin, superadmin } = require('../middleware/authMiddleware');
const { getAllUsers, getStats, deleteUser, getPendingAdmins, approveAdmin, toggleUserStatus, updateUserRole, getAdminPerformance } = require('../controllers/adminController');

router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.patch('/users/:id/toggle-status', protect, admin, toggleUserStatus);
router.patch('/users/:id/role', protect, superadmin, updateUserRole);
router.get('/stats', protect, admin, getStats);
router.get('/my-performance', protect, admin, getAdminPerformance);
router.get('/pending-admins', protect, superadmin, getPendingAdmins);
router.patch('/approve-admin/:id', protect, superadmin, approveAdmin);

module.exports = router;

