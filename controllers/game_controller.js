const Firebase = require('../config/firebase');
const firebase = Firebase.admin;
const Game = Firebase.Game;
const Player = Firebase.Player;
const nodes = Firebase.nodes;
const maxPlayersPerGame = 5; // TODO: This global limit should be placed in one place accessable by client and server.

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
            logError(error, "ERROR while creating a game");
        });
}

exports.join_game = function (req, res) {
    // Create an object from the required post request parameters.
    console.log("WTF");
    console.log(req.body);
    var reqObj = {
        gamecode: req.body.gamecode,
        uid: req.body.uid,
        displayName: req.body.displayName
    }

    // Attempt to join the player to the game.
    firebase.database().ref(nodes.games).child(gamecode).once('value')
        .then((snap) => {
            // First we need to ensure the game exists.
            if (snap.exists()) {
                // Then we need to ensure there's enough room for another player in the game
                // and the player is not already in the game.
                var playersInLobby = Object.keys(snap.child(nodes.players).val());
                if (playersInLobby.length < maxPlayersPerGame && !playersInLobby.includes(reqObj.uid)) {
                    return true;
                }
            }
        }).then((ableToJoin) => {
            if (ableToJoin) {
                // Add the player to the game by creating a new child node with the player's uid in the players node
                // and setting the new child node to the player's object.
                var newPlayer = new Player(displayName, false, false);
                firebase.database().ref(nodes.games).child(gamecode).child(nodes.players).child(reqObj.uid)
                    .set(newPlayer)
                    .then(() => {
                        res.json(getLobbyRedirectObj(reqObj.gamecode, newPlayer.uuid));
                    }).catch((error) => {
                        logError(error, "ERROR while setting player defaults");
                    });
            } else {
                res.json(getLobbyRedirectObj(reqObj.gamecode));
            }
        }).catch((error) => {
            logError(error, "ERROR while joining a game");
        });
}

exports.lobby = function (req, res) {
    // Extract required info from request. This will also be used to pass into some of our views.
    var reqObj = {
        gamecode: req.params.gamecode,
        playerUuid: req.query.uuid
    }

    // Ensure game exists before attempting to render lobby.
    firebase.database().ref(nodes.games).child(reqObj.gamecode).once('value')
        .then((snap) => {
            if (snap.exists()) {
                // Check if game is full.
                if (Object.keys(snap.child(nodes.players).val()).length > maxPlayersPerGame) {
                    res.render('errors/game-full', reqObj);
                } else {
                    // Use the firebase layout to render the lobby.
                    reqObj.layout = 'main-no-jquery';
                    reqObj.owner = isGameOwner(snap.child(nodes.players).val(), reqObj.playerUuid);
                    res.render('game/lobby', reqObj);
                }
            } else {
                res.render('errors/game-not-found', reqObj);
            }
        }).catch((error) => {
            renderError(res, error, "Error occurred while checking if game exits!");
        });
}

exports.start = function (req, res) {
    // Extract required information from request.
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
                        .then(() => res.json({
                            result: "success"
                        }))
                        .catch((error) => {
                            logError(error, "Error occurred while attempting to start the game");
                        });
                } else {
                    logError("Error: You don't have the permission to start the game");
                }
            } else {
                logError('Error: Game not found whie attempting to start the game');
            }
        }).catch((error) => {
            logError(error, "Error occurred while attempting to start the game");
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
                    // Third make sure that the user is enrolled in the game.
                    if (extractPlayerUidFromUuid(snap.child(nodes.players).val(), reqObj.uuid)) {
                        // Fourth check if the player is a judge or a drawer.
                        if (isRoundJudge(snap.child(nodes.players).val(), reqObj.uuid)) {
                            res.render('game/judge');
                        } else {
                            res.render('game/drawer');
                        }
                    } else {
                        renderError(res, "You are not enrolled in this game");
                    }
                } else {
                    renderError(res, "Game has not started");
                }
            } else {
                res.render('errors/game-not-found', gameObj);
            }
        }).catch((error) => {
            renderError(res, error, "Something went wrong while attempting to render the game");
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

function extractPlayerUidFromUuid(players, uuid) {
    // Get player's user uid based on the player's assigned uuid for the given game.
    return Object.keys(players).filter(player => players[player].uuid === uuid).pop();
}

function extractPlayerInfo(players, uuid, property) {
    var playeruid = extractPlayerUidFromUuid(players, uuid);

    // Check if player is owner of the game. Return false is player uid was not found or not provided.
    return playeruid === undefined ? false : players[playeruid][property];
}

/* TODO: These error function should probably be modularized into their own file so then can be used by any controller. */
function renderError(res, err, consoleMsg) {
    // NOTE: This method should only be called from GET requests. If it's called
    //       from any other types of requests, it won't render anything.
    logError(err, consoleMsg);
    res.render('error', {
        error: err
    });
}

function logError(err, consoleMsg) {
    // TODO: Better error handling for backend.
    console.log(consoleMsg);
    console.log(err);
}
/* */