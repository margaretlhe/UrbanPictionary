const express = require('express');
const router = express.Router();

var game_controller = require('../controllers/game_controller');

// Set game routes
router.get('/', game_controller.mode);

router.get('/join/:nsfw?', game_controller.join_view);

router.post('/join', game_controller.join_game);

router.post('/create', game_controller.create_game);

router.get('/lobby/:gamecode', game_controller.lobby);

router.get('/start/:gamecode', game_controller.start);

module.exports = router;