const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createServiceRequest,
    getServiceRequests,
    getServiceRequestById
} = require('../controllers/serviceController');

router.route('/')
    .get(protect, getServiceRequests)
    .post(protect, createServiceRequest);

router.route('/:id')
    .get(protect, getServiceRequestById);

module.exports = router;
