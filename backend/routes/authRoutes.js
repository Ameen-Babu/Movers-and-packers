const express = require('express');
const router = express.Router();
const { signupInitiate, verifyOTP, resendOTP, registerUser, loginUser, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, sensitiveActionLimiter, emailInitiateLimiter } = require('../middleware/rateLimiter');

router.post('/signup-initiate', authLimiter, emailInitiateLimiter, signupInitiate);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/resend-otp', sensitiveActionLimiter, resendOTP);
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.put('/update-profile', protect, updateProfile);
router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});
router.get('/me', protect, getMe);

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Auth API is running' });
});

module.exports = router;

