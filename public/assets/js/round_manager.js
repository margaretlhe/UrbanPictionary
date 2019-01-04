const socket = io.connect(window.location.origin + window.location.pathname);
const gamecode = extractGameCodeFromUrl();
const playerUuid = extractQueryParametersFromUrl().uuid;
const gameStartCountdown = "game-start-countdown";
const roundCountdown = "round-countdown";
const wordId = "word";

// NOTE: Socket connect has to be the parent of the auth state change listener otherwise it won't trigger.
socket.on('connect', function(){
    // TODO: This could later be used to signal all clients when a particular user has 
    //       connected or disconnected (you could build some cool features with this!).

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Only authenticated users can connect to a game.
            setRoundManagerSockets(user);
        }
    });
});

function setRoundManagerSockets(user){
    
    // Notify server a user has connected.
    socket.emit('user', {
        uid: user.uid
    });

    // If a judge looses connection while selecting the winner, the game could be left in a dead lock.
    // This listener will be triggered by the server if a judge reconnects and the current state of the round 
    // is in selecting the winner.
    socket.on('judge-reconnect', (reconnect) => {
        if (reconnect){
            enableJudgeFunctionality(user);
        }
    });
    
    socket.on(gameStartCountdown, (data) => {
        $(`#${gameStartCountdown}`).text(data);
    });
    
    socket.on(roundCountdown, (data) => {
        $(`#${roundCountdown}`).text(data.timeLeft);
    
        // Check if round is still active.
        if (!data.active){
            // Check if client it a judge.
            if (data.judgeUuid !== playerUuid){
                // Reroute client to judge view.
                window.location.replace(`/game/play/${gamecode}?uuid=${data.judgeUuid}`);
            } else {
                enableJudgeFunctionality(user);
            }
        }
    });

    // TODO: Set socket listeners for hover functionality and when the judge selects a winner

    // Firebase socket listener for round word/phrase.
    firebase.database().ref(nodes.games).child(gamecode).child(nodes.round).child(nodes.word)
        .on('value', (snap) => {
            $(`#${wordId}`).text(snap.val());
        });

    // Set firebase socket listener that will notify clients when the round is officially over (after judge selects winner).
    firebase.database().ref(nodes.games).child(gamecode).child(nodes.round).child(nodes.started)
        .on('value', (snap) => {
            if (!snap.val()){
                // Send request to retrieve the proper redirect url for the client based on their private uid.
                $.get(`/game/lobby-redirect/${gamecode}`, {
                    uid: user.uid
                }).then((res)=>{
                    if (res.redirect){
                        window.location.replace(res.redirect);
                    } else {
                        logError("Error", "Failed to route all players back to the lobby");
                    }
                }).catch((error)=>{
                    logError(error, "Error occurred while sending a post request reroute all users back to the lobby.");
                });
            }
        });
}

function enableJudgeFunctionality(user){
    // TODO: Do something that triggers the judge the ability to select the winner.
    //       Also need to ensure that we have the right judge
    console.log("I'm the JUDGE");

    // TODO: Call 'selectWinner' from somewhere here.
    // TEMP FOR TESTING
    // selectWinnner('75930530-0ffe-11e9-83df-65cf7b9ea265');
}

function selectWinnner(winnerUuid){
    $.post(`/game/end-round/${gamecode}`, {
        judgeUuid: playerUuid, // We are on the judges view so we can simply take the current player's uuid.
        winnerUuid: winnerUuid
    }).catch((error) => {
        logError(error, "Error Failed to send post request to end the round");
    });
}