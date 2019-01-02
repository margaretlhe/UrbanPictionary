const express = require('express');
const router = express.Router();

var game_controller = require('../controllers/game_controller');

// Set game routes
router.get('/', game_controller.mode);

router.get('/join', game_controller.join_view);

router.post('/join', game_controller.join_game);

router.get('/create', game_controller.create_view)

router.post('/create', game_controller.create_game);

router.get('/lobby/:gamecode', game_controller.lobby);

router.post('/start/:gamecode', game_controller.start);

router.get('/play/:gamecode', game_controller.play);

module.exports = router;