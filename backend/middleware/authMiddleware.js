const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                console.log('User not found for token ID:', decoded.id);
                return res.status(401).json({ message: 'User not found' });
            }

            return next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'superadmin' || (req.user.role === 'admin' && req.user.isApproved))) {
        next();
    } else {
        res.status(401).json({ 
            message: req.user && req.user.role === 'admin' && !req.user.isApproved 
                ? 'Your account is pending approval' 
                : 'Not authorized as an admin' 
        });
    }
};

const superadmin = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as superadmin' });
    }
};

module.exports = { protect, admin, superadmin };
