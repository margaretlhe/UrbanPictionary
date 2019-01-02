const express = require('express');
const router = express.Router();

var game_controller = require('../controllers/game_controller');

// Set game routes
router.get('/lobby/:gamecode', game_controller.lobby);

router.post('/start/:gamecode', game_controller.start);

router.get('/play/:gamecode', game_controller.play);

module.exports = router;