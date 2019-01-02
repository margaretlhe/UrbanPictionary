const express = require('express');
const router = express.Router();

var errors_controller = require('../controllers/errors_controller');

// Set error routes.
router.get('/game-full', errors_controller.game_full);

router.get('/game-not-found', errors_controller.game_not_found);

module.exports = router;