const express = require('express');
const router = express.Router();

var application_controller = require('../controllers/application_controller');
var mode_controller = require('../controllers/mode_controller');
var join_controller = require('../controllers/join_controller');
var create_controller = require('../controllers/create_controller');

// Set main app routes
router.get('/', application_controller.index);

router.get('/error', application_controller.error);

router.get('/mode', mode_controller.mode_view);

router.get('/join', join_controller.join_view);

router.post('/join', join_controller.join_game);

router.get('/create', create_controller.create_view)

router.post('/create', create_controller.create_game);

module.exports = router;