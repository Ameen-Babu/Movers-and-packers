const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');



router.get('/users', protect, admin, (req, res) => {
    res.status(200).json({ message: 'Get all users' });
});

router.get('/', protect, admin, (req, res) => {
    res.status(200).json({ message: 'Admin API authorized' });
});

module.exports = router;
