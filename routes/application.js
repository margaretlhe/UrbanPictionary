const express = require('express');
const router = express.Router();

var application_controller = require('../controllers/application_controller');

// Set app home route
router.get('/', application_controller.index);

module.exports = router;