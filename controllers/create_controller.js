const utils = require('./utils');
const Firebase = require('../config/firebase');
const firebase = Firebase.admin;
const Game = Firebase.Game;
const Player = Firebase.Player;
const nodes = Firebase.nodes;

exports.create_view = function (req, res) {
    res.render('create/create', {
        layout: 'main-no-jquery',
        SFW: req.query.SFW === 'true'
    });
}

exports.create_game = function (req, res) {
    // Create an object from the required post request parameters.
    var reqObj = {
        uid: req.body.uid,
        gameOwner: new Player(req.body.displayName, true, true),
        SFW: req.body.SFW === 'true'
    }

    // Create a game with default info.
    firebase.database().ref(nodes.games)
        .push(new Game(reqObj.uid, reqObj.gameOwner, reqObj.SFW))
        .then((snap) => {
            res.json(utils.getLobbyRedirectObj(snap.key, reqObj.gameOwner.uuid));
        }).catch((error) => {
            utils.logError(error, "ERROR while creating a game");
        });
}