const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getAllUsers, getStats, deleteUser } = require('../controllers/adminController');

router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/stats', protect, admin, getStats);

module.exports = router;
