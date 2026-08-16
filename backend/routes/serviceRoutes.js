const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sensitiveActionLimiter } = require('../middleware/rateLimiter');
const {
    createServiceRequest,
    getServiceRequests,
    getServiceRequestById,
    claimServiceRequest,
    updateServiceStatus,
    deleteServiceRequest
} = require('../controllers/serviceController');

router.route('/')
    .get(protect, getServiceRequests)
    .post(protect, sensitiveActionLimiter, createServiceRequest);

router.route('/:id')
    .get(protect, getServiceRequestById)
    .patch(protect, updateServiceStatus)
    .delete(protect, deleteServiceRequest);

router.post('/:id/claim', protect, claimServiceRequest);

module.exports = router;
