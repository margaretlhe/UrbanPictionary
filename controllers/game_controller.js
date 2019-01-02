const utils = require('./utils');
const roundManager = require('./round_manager');
const Firebase = require('../config/firebase');
const firebase = Firebase.admin;
const Game = Firebase.Game;
const Player = Firebase.Player;
const nodes = Firebase.nodes;
const maxPlayersPerGame = Firebase.maxPlayersPerGame;

exports.mode = function (req, res) {
    res.render('game/mode');
}

exports.join_view = function (req, res) {
    res.render('game/join', {
        layout: 'main-no-jquery'
    });
}

exports.create_view = function (req, res) {
    res.render('game/create', {
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
            res.json(getLobbyRedirectObj(snap.key, reqObj.gameOwner.uuid));
        }).catch((error) => {
            utils.logError(error, "ERROR while creating a game");
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
                    res.json(getLobbyRedirectObj(reqObj.gamecode, playerUuid));
                } else if (playersInLobby.length < maxPlayersPerGame) {
                    // Add the player to the game by creating a new child node with the player's uid in the players node
                    // and setting the new child node to the player's object.
                    var newPlayer = new Player(reqObj.displayName, false, false);
                    firebase.database().ref(nodes.games).child(reqObj.gamecode).child(nodes.players).child(reqObj.uid)
                        .set(newPlayer)
                        .then(() => {
                            res.json(getLobbyRedirectObj(reqObj.gamecode, newPlayer.uuid));
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

exports.lobby = function (req, res) {
    // Extract required info from request. This will also be used to pass into some of our views.
    var reqObj = {
        gamecode: req.params.gamecode,
        playerUuid: req.query.uuid
    }

    // Attempt to render lobby.
    firebase.database().ref(nodes.games).child(reqObj.gamecode).once('value')
        .then((snap) => {
            // First ensure the game exists.
            if (snap.exists()) {
                // Get all players enrolled in game.
                var allPlayers = snap.child(nodes.players).val();

                // Ensure player count has not surpassed limits and the player that submitted request is enrolled in game.
                if (Object.keys(allPlayers).length > maxPlayersPerGame){
                    utils.renderError(res, "ERROR: There are more players in this game than maximum limit...something went wrong!");
                } else if (!getPlayerIfEnrolledInGame(allPlayers, reqObj.playerUuid)) {
                    utils.renderError(res, "Error: You are not enrolled in this game!");
                } else {
                    // Use the firebase layout to render the lobby.
                    reqObj.layout = 'main-no-jquery';
                    reqObj.owner = isGameOwner(allPlayers, reqObj.playerUuid);
                    res.render('game/lobby', reqObj);
                }
            } else {
                res.render('errors/game-not-found', reqObj);
            }
        }).catch((error) => {
            utils.renderError(res, error, "Error occurred while checking if game exits!");
        });
}

exports.start = function (req, res) {
    // Extract required information from post request.
    var reqObj = {
        gamecode: req.params.gamecode,
        uuid: req.body.uuid
    }

    firebase.database().ref(nodes.games).child(reqObj.gamecode).once('value')
        .then((snap) => {
            // Ensure game actually exists.
            if (snap.exists()) {
                // Ensure user that submitted post request to start the game is the game owner (only owners can start a game).
                if (isGameOwner(snap.child(nodes.players).val(), reqObj.uuid)) {
                    firebase.database().ref(nodes.games).child(reqObj.gamecode).child(nodes.round).child(nodes.started)
                        .set(true)
                        .then(() => {
                            roundManager.startRound();
                        })
                        .catch((error) => {
                            utils.logError(error, "Error occurred while attempting to start the game");
                        });
                } else {
                    utils.logError("Error: You don't have the permission to start the game");
                }
            } else {
                utils.logError('Error: Game not found whie attempting to start the game');
            }
        }).catch((error) => {
            utils.logError(error, "Error occurred while attempting to start the game");
        });
}

exports.play = function (req, res) {
    // Extract required information from request.
    var reqObj = {
        gamecode: req.params.gamecode,
        uuid: req.query.uuid
    }

    firebase.database().ref(nodes.games).child(reqObj.gamecode).once('value')
        .then((snap) => {
            // First ensure the game exists.
            if (snap.exists()) {
                // Second ensure the game has started.
                if (snap.child(nodes.round).child(nodes.started).val()) {
                    // Get all players enrolled in game.
                    var allPlayers = snap.child(nodes.players).val();
                    // Third make sure that the user is enrolled in the game.
                    if (getPlayerIfEnrolledInGame(allPlayers, reqObj.uuid)) {
                        // Fourth check if the player is a judge or a drawer.
                        if (isRoundJudge(allPlayers, reqObj.uuid)) {
                            res.render('game/judge');
                        } else {
                            renderError(res, "You are not enrolled in this game");
                        }
                    } else {
                        utils.renderError(res, "Game has not started");
                    }
                } else {
                    res.render('errors/game-not-found', gameObj);
                }
            }
        }).catch((error) => {
            utils.renderError(res, error, "Something went wrong while attempting to render the game");
        });
}

function getLobbyRedirectObj(gamecode, playerUuid) {
    return {
        redirect: `/game/lobby/${gamecode}?${nodes.uuid}=${playerUuid}`
    };
}

function isGameOwner(players, uuid) {
    return extractPlayerInfo(players, uuid, nodes.owner)
}

function isRoundJudge(players, uuid) {
    return extractPlayerInfo(players, uuid, nodes.judge);
}

function extractPlayerInfo(players, uuid, property) {
    var playeruid = getPlayerIfEnrolledInGame(players, uuid);

    // Check if player is owner of the game. Return false is player uid was not found or not provided.
    return playeruid === undefined ? false : players[playeruid][property];
}

function getPlayerIfEnrolledInGame(players, uuid) {
    // Get player's auth uid based on the player's assigned uuid for the given game.
    return Object.keys(players).filter(player => players[player].uuid === uuid).pop();
}