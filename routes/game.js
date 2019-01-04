const express = require('express');
const router = express.Router();

var game_controller = require('../controllers/game_controller');

// Set game routes
router.get('/lobby-redirect/:gamecode', game_controller.lobby_redirect);

router.get('/lobby/:gamecode', game_controller.lobby);

router.post('/start/:gamecode', game_controller.start);

router.get('/play/:gamecode', game_controller.play);

router.post('/end-round/:gamecode', game_controller.end_round);

module.exports = router;