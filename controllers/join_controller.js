const utils = require('./utils');
const roundManager = require('./round_manager');
const Firebase = require('../config/firebase');
const firebase = Firebase.admin;
const Player = Firebase.Player;
const nodes = Firebase.nodes;
const maxPlayersPerGame = Firebase.maxPlayersPerGame;

exports.join_view = function (req, res) {
    res.render('join/join', {
        layout: 'main-no-jquery'
    });
}

exports.join_game = function (req, res) {
    // Create an object from the required post request parameters
    var reqObj = {
        gamecode: req.body.gamecode,
        uid: req.body.uid,
        displayName: req.body.displayName
    }

    // Attempt to join the player to the game.
    firebase.database().ref(nodes.games).child(reqObj.gamecode).once('value')
        .then((snap) => {
            // First we need to ensure the game exists.
            if (snap.exists()) {
                // Grab all of the players enrolled in the game.
                var playersInLobby = Object.keys(snap.child(nodes.players).val());

                // Second check if the player is already enrolled in the game.
                if (playersInLobby.includes(reqObj.uid)){
                    // If player is already enrolled then simply return the lobby redirect json.
                    var playerUuid = snap.child(nodes.players).child(reqObj.uid).child(nodes.uuid).val();
                    res.json(utils.getLobbyRedirectObj(reqObj.gamecode, playerUuid));
                } else if (playersInLobby.length < maxPlayersPerGame) {
                    // Add the player to the game by creating a new child node with the player's uid in the players node
                    // and setting the new child node to the player's object.
                    var newPlayer = new Player(reqObj.displayName, false, false);
                    firebase.database().ref(nodes.games).child(reqObj.gamecode).child(nodes.players).child(reqObj.uid)
                        .set(newPlayer)
                        .then(() => {
                            res.json(utils.getLobbyRedirectObj(reqObj.gamecode, newPlayer.uuid));
                        }).catch((error) => {
                            utils.logError(error, "ERROR while setting player defaults");
                        });
                } else {
                    // Game is full so redirect user to the game full view.
                    res.json({
                        redirect: `/errors/game-full?gamecode=${reqObj.gamecode}`
                    });
                }
            }
        }).catch((error) => {
            utils.logError(error, "ERROR while joining a game");
        });
}