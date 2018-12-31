const express = require('express');
const router = express.Router();

var application_controller = require('../controllers/application_controller');

// Set main app routes
router.get('/', application_controller.index);

router.get('/error', application_controller.error);

module.exports = router;