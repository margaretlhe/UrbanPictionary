const express = require('express');
const router = express.Router();

var errors_controller = require('../controllers/errors_controller');

// Set error routes.
router.get('/game-full', errors_controller.game_full);

module.exports = router;