const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, (req, res) => {
    res.status(200).json({ message: 'Get all services' });
});


router.post('/', protect, (req, res) => {
    res.status(200).json({ message: 'Create service' });
});

module.exports = router;
