const keys = require('../config/keys');
const firebase = require('../config/firebase');
const gamesRoot = "games";

// Sign in admin user.
firebase.auth().signInWithEmailAndPassword(
    keys.firebase_admin.email,
    keys.firebase_admin.password
).catch((error)=>{
    // TODO: Need better error handling.
    console.log("COULD NOT LOG IN ADMIN");
    console.log(error);
});

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
    firebase.database().ref(gamesRoot).push({
        active: true,
        sfw: req.body.sfw === 'true',
        roundCount: 0,
        usedWordIds: [0],
        players: {
            [req.body.uid]: {
                judge: true,
                score: 0
            }
        },
        round: {
            timeLeft: "2:00",
            started: false,
            word: "__"
        }
    }).then((snap)=>{
        res.json({ redirect: `lobby/${snap.key}` });
    }).catch((error)=>{
        console.log("ERROR while creating a game");
        console.log(error);
        res.json({ redirect: "/error" });
    });
}

exports.join_game = function(req, res){
    // Post request to join a game.
    console.log(req.body);
    var gamecode = req.body.gamecode;
    var uid = req.body.uid;
    console.log(gamecode);

    // TODO: Redirect user to the lobby with the game code.
    res.json({ result: "Success!" });
}

exports.lobby = function(req, res){

    var gameObj = {
        gamecode: req.params.gamecode
    }

    // Ensure game exists before attempting to render lobby.
    firebase.database().ref(gamesRoot).child(gameObj.gamecode).once('value').then((snap)=>{
        if (snap.val()){
            // TODO: Need to check if the game full!
            res.render('game/lobby', gameObj);
        } else {
            res.render('errors/game-not-found', gameObj);
        }
    }).catch((error)=>{
        // TODO: Better error handling.
        console.log("Error occurred while checking if game exits!");
        console.log(error);
    });
}