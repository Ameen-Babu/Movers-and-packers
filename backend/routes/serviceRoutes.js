const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createServiceRequest,
    getServiceRequests,
    getServiceRequestById,
    updateServiceStatus,
    deleteServiceRequest
} = require('../controllers/serviceController');

router.route('/')
    .get(protect, getServiceRequests)
    .post(protect, createServiceRequest);

router.route('/:id')
    .get(protect, getServiceRequestById)
    .patch(protect, updateServiceStatus)
    .delete(protect, deleteServiceRequest);

module.exports = router;
