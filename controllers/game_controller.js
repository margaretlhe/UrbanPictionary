const Firebase = require('../config/firebase');
const firebase = Firebase.admin;
const Game = Firebase.Game;
const Player = Firebase.Player;
const nodes = Firebase.nodes;
const maxPlayersPerGame = 5; // TODO: This global limit should be placed in one place accessable by client and server.

exports.mode = function(req, res){
    res.render('game/mode');
}

exports.join_view = function(req, res){
    // SFW set to true by default.
    var sfw = true;
    if (req.params.nsfw){
        sfw = false;
    }
    
    res.render('game/join', {
        layout: 'firebase',
        sfw: sfw
    });
}

exports.create_game = function(req, res){
    // Create an object from the required post request parameters.
    var reqObj = {
        uid: req.body.uid,
        gameOwner: new Player(req.body.displayName, true, true),
        sfw: req.body.sfw === 'true'
    }

    // Create a game with default info.
    firebase.database().ref(nodes.games)
    .push(new Game(reqObj.uid, reqObj.gameOwner, reqObj.sfw))
    .then((snap)=>{
        res.json(GetLobbyRedirectObj(snap.key, reqObj.gameOwner.uuid));
    }).catch((error)=>{        
        RenderError(error, "ERROR while creating a game");
    });
}

exports.join_game = function(req, res){
    // Create an object from the required post request parameters.
    var reqObj = {
        gamecode: req.body.gamecode,
        uid: req.body.uid,
        displayName: req.body.displayName
    }

    // Attempt to join the player to the game.
    firebase.database().ref(nodes.games).child(gamecode).once('value')
    .then((snap)=>{
        // First we need to ensure the game exists.
        if (snap.exists()){
            // Then we need to ensure there's enough room for another player in the game
            // and the player is not already in the game.
            var playersInLobby = Object.keys(snap.child(nodes.players).val());
            if (playersInLobby.length < maxPlayersPerGame && !playersInLobby.includes(reqObj.uid)){
                return true;
            }
        }
    }).then((ableToJoin)=>{
        if (ableToJoin){
            // Add the player to the game by creating a new child node with the player's uid in the players node
            // and setting the new child node to the player's object.
            var newPlayer = new Player(displayName, false, false);
            firebase.database().ref(nodes.games).child(gamecode).child(nodes.players).child(reqObj.uid)
            .set(newPlayer)
            .then(()=>{
                res.json(GetLobbyRedirectObj(reqObj.gamecode, newPlayer.uuid));
            }).catch((error)=>{
                RenderError(error, "ERROR while setting player defaults");
            });
        } else {
            res.json(GetLobbyRedirectObj(reqObj.gamecode));
        }
    }).catch((error)=>{
        RenderError(error, "ERROR while joining a game");
    });
}

exports.lobby = function(req, res){
    // Extract player's uuid from query parameter.
    var playerUuid = req.query.uuid;

    // Create a game object that can be sent our views.
    var gameObj = {
        gamecode: req.params.gamecode
    }

    // Ensure game exists before attempting to render lobby.
    firebase.database().ref(nodes.games).child(gameObj.gamecode).once('value')
    .then((snap)=>{
        if (snap.exists()){
            // Check if game is full.
            if (Object.keys(snap.child(nodes.players).val()).length > maxPlayersPerGame){
                res.render('errors/game-full', gameObj);
            } else {
                // Use the firebase layout to render the lobby.
                gameObj.layout = 'firebase';
                gameObj.owner = isGameOwner(snap.child(nodes.players).val(), playerUuid);
                res.render('game/lobby', gameObj);
            }
        } else {
            res.render('errors/game-not-found', gameObj);
        }
    }).catch((error)=>{
        RenderError(error, "Error occurred while checking if game exits!");
    });
}

exports.start = function(req, res){
    var gameObj = {
        gamecode: req.params.gamecode,
        uuid: req.query.uuid
    }

    firebase.database().ref(nodes.games).child(gameObj.gamecode).once('value')
    .then((snap)=>{
        // First ensure the game exists.
        if (snap.exists()){
            // Second ensure the game has started. 
            if (snap.child(nodes.players)){
                
            }
        } else {
            res.render('errors/game-not-found', gameObj);
        }
    })

}

function GetLobbyRedirectObj(gamecode, playerUuid){
    return { redirect: `/game/lobby/${gamecode}?${nodes.uuid}=${playerUuid}` };
}

function isGameOwner(players, uuid){
    // Get player's user uid based on the player's assigned uuid for the given game.
    var playerId = Object.keys(players).filter(player=>players[player].uuid === uuid).pop();

    // Check if player is owner of the game. Return false is player id was not found or not provided.
    return playerId === undefined ? false : players[playerId].owner;
}

function RenderError(err, consoleMsg){
    // TODO: Better error handling.
    console.log(consoleMsg);
    console.log(error);
    res.render('error', { error: error });
}