const Firebase = require('../config/firebase');
const firebase = Firebase.admin;
const Game = Firebase.Game;
const Player = Firebase.Player;
const nodes = Firebase.nodes;
const maxPlayersPerGame = 5;

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
        sfw: sfw
    });
}

exports.create_game = function(req, res){
    // Create a game with default info.
    firebase.database().ref(nodes.games)
    .push(new Game(req.body.sfw === 'true', 
            new Player(req.body.uid, true))
    ).then((snap)=>{
        res.json(GetLobbyRedirectObj(snap.key));
    }).catch((error)=>{        
        RenderError(error, "ERROR while creating a game");
    });
}

exports.join_game = function(req, res){
    // Extract required info from request.
    var gamecode = req.body.gamecode;
    var uid = req.body.uid;

    // Attempt to join the player to the game.
    firebase.database().ref(nodes.games).child(gamecode).once('value')
    .then((snap)=>{
        // First we need to ensure the game exists.
        if (snap.exists()){
            // Then we need to ensure there's enough room for another player in the game
            // and the player is not already in the game.
            var playersInLobby = Object.keys(snap.child(nodes.players).val());
            if (playersInLobby.length < maxPlayersPerGame && !playersInLobby.includes(uid)){
                return true;
            }
        }
    }).then((ableToJoin)=>{
        if (ableToJoin){
            // Add the player to the game.
            firebase.database().ref(nodes.games).child(gamecode).child(nodes.players).child(uid)
            .set(new Player(uid, false)[uid])
            .then(()=>{
                res.json(GetLobbyRedirectObj(gamecode));
            }).catch((error)=>{
                RenderError(error, "ERROR while setting player defaults");
            });
        } else {
            res.json(GetLobbyRedirectObj(gamecode));
        }
    }).catch((error)=>{
        RenderError(error, "ERROR while joining a game");
    });
}

exports.lobby = function(req, res){
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
                res.render('game/lobby', gameObj);
            }
        } else {
            res.render('errors/game-not-found', gameObj);
        }
    }).catch((error)=>{
        RenderError(error, "Error occurred while checking if game exits!");
    });
}

function GetLobbyRedirectObj(gamecode){
    return { redirect: `/game/lobby/${gamecode}` };
}

function RenderError(err, consoleMsg){
    // TODO: Better error handling.
    console.log(consoleMsg);
    console.log(error);
    res.render('error', { error: error });
}