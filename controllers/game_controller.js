const utils = require('./utils');
const roundManager = require('./round_manager');
const Firebase = require('../config/firebase');
const firebase = Firebase.admin;
const nodes = Firebase.nodes;
const maxPlayersPerGame = Firebase.maxPlayersPerGame;

exports.lobby_redirect = function(req, res){
    // Create an object from the required post request parameters
    var reqObj = {
        gamecode: req.params.gamecode,
        uid: req.body.uid,
    }

    firebase.database().ref(nodes.games).child(reqObj.gamecode).child(reqObj.uid).child(node.uuid).once('value')
        .then((snap) => {
            if (snap.exists()){
                res.json(utils.getLobbyRedirectObj(reqObj.gamecode, snap.val()));
            } else {
                utils.logError("ERROR: player UUID does not exists");
            }
        }).catch((error) => {
            utils.logError(error, "ERROR while attempting to get player UUID");
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
                // Get all players enrolled in game.
                var allPlayers = snap.child(nodes.players).val();
                // Ensure user that submitted post request to start the game is the game owner (only owners can start a game).
                if (isGameOwner(allPlayers, reqObj.uuid)) {
                    firebase.database().ref(nodes.games).child(reqObj.gamecode).child(nodes.round).child(nodes.started)
                        .set(true)
                        .then(() => {
                            // Use round manager to start the round!
                            roundManager.startRound(reqObj.gamecode, getJudgeUuid(allPlayers));
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
                            res.render('game/drawer');  
                        }
                    } else {
                        utils.renderError(res, "You are not enrolled in this game");
                    }
                } else {
                    utils.renderError(res, "Game has not started");
                }
            } else {
                res.render('errors/game-not-found', gameObj);
            }
        }).catch((error) => {
            utils.renderError(res, error, "Something went wrong while attempting to render the game");
        });
}

exports.end_round = function(req, res){
    // Extract required information from post request.
    var reqObj = {
        gamecode: req.params.gamecode,
        judgeUuid: req.body.judgeUuid,
        winnerUuid: req.body.winnerUuid,
    }

    var gameRef = firebase.database().ref(nodes.games).child(reqObj.gamecode);

    gameRef.child(nodes.players).once('value')
        .then((snap) => {
            if (snap.exists()){
                var allPlayers = snap.val();
                // Ensure that player that submitted post request to end the round is the current judge.
                if (reqObj.judgeUuid === getJudgeUuid(allPlayers)){
                    // Attemt to stop the game.
                    gameRef.child(nodes.round).child(nodes.started)
                        .set(false)
                        .then(() => {
                            // Incrememt winner score.
                            var winnerUid = getPlayerIfEnrolledInGame(allPlayers, reqObj.winnerUuid);
                            incrementWinnerScore(reqObj.gamecode, winnerUid);

                            // Assign the judge for the next round.
                            assignNextJudge(allPlayers, reqObj.gamecode);

                            // Reset word to defeault.
                            resetGameWord(reqObj.gamecode);
                        }).catch((error) => {
                            utils.logError(error, "Error: FAILED to stop the round!");
                            res.json({
                                result: 'Error: Failed to stop the round'
                            });
                        });
                } else {
                    res.json({
                        result: `Error: '${reqObj.uuid}' is not currently a judge and cannot end the round`
                    });
                }
            } else {
                res.json({ 
                    result: "Error: Game not found"
                });
            }
        }).catch((error) => {
            utils.logError(error, "Error: Something bad happened while attempting to stop the round");
            res.json({
                result: 'Error: Failed to stop the round'
            });
        });
}

function isGameOwner(players, uuid) {
    return extractPlayerInfo(players, uuid, nodes.owner);
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

function getJudgeUuid(players){
    // Find the judge player and return the judge's public uuid.
    var judgeUid = Object.keys(players).filter(player => players[player].judge === true).pop();
    return players[judgeUid].uuid;
}

function assignNextJudge(allPlayers, gamecode){
    // Get all players' private uids.
    var playerKeys = Object.keys(allPlayers);

    for (let i = 0; i < playerKeys.length; i++) {
        const player = allPlayers[playerKeys[i]];
        // Check if that player is the judge.
        if (player.judge){
            // If the player is a judge, toggle the judge value to false.
            setJudgeField(gamecode, playerKeys[i], false);

            // Check if we're in the last player.
            if ((i+1) < playerKeys.length){
                // If we're not the last player, toggle the next player's judge value to true.
                setJudgeField(gamecode, playerKeys[i+1], true);
            } else {
                // Else go back and toggle the first player's judge value to true.
                setJudgeField(gamecode, playerKeys[0], true);
            }
            break;
        }
    }
}

function incrementWinnerScore(gamecode, winnerUid){
    firebase.database().ref(nodes.games).child(gamecode).child(nodes.players).child(winnerUid).child(nodes.score)
        .transaction((score) => {
            return score++;
        });
}

function setJudgeField(gamecode, uid, isJudge){
    firebase.database().ref(nodes.games).child(gamecode).child(nodes.players).child(uid).child(nodes.judge)
        .set(isJudge)
        .catch((error) => {
            utils.logError(error, "Error: Failed to set judge field");
        });
}

function resetGameWord(gamecode){
    firebase.database().ref(nodes.games).child(gamecode).child(nodes.round).child(nodes.word)
        .set("*")
        .catch((error) => {
            utils.logError(error, "Error: Failed to reset the word back to default");
        });
}