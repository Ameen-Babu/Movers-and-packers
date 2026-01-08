const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Auth API is running' });
});

module.exports = router;
