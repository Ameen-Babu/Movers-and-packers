const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, changePassword, changeEmail } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.put('/change-email', protect, changeEmail);

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Auth API is running' });
});

module.exports = router;
