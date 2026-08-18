const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again after 15 minutes.'
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes.'
    }
});

const sensitiveActionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts, please try again later.'
    }
});

const getEmailKey = (req) => {
    const email = req.body && req.body.email ? String(req.body.email).trim().toLowerCase() : '';
    if (email) return `email:${email}`;
    return req.ip || '127.0.0.1';
};

const emailInitiateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
    keyGenerator: getEmailKey,
    message: {
        success: false,
        message: 'Too many signup attempts for this email address. Please try again after 15 minutes.'
    }
});

module.exports = {
    globalLimiter,
    authLimiter,
    sensitiveActionLimiter,
    emailInitiateLimiter,
    getEmailKey
};



