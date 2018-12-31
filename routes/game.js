const express = require('express');
const router = express.Router();

var game_controller = require('../controllers/game_controller');

// Set game routes
router.get('/', game_controller.mode);

router.get('/join/:nsfw?', game_controller.join_view);

router.post('/join', game_controller.join_game);

router.post('/create', game_controller.create_game);

// TODO: Determine whether we'll need to have lobby and start game all in the same namespace to persist chat.
router.get('/lobby/:gamecode', game_controller.lobby);

router.get('/start/:gamecode/:uuid', game_controller.start);

module.exports = router;