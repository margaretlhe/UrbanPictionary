const socket = io.connect(window.location.origin + window.location.pathname);
const gamecode = extractGameCodeFromUrl();
const playerUuid = extractQueryParametersFromUrl().uuid;
const gameStartCountdown = "game-start-countdown";
const roundCountdown = "round-countdown";
const wordId = "word";

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Only authenticated users can connect to a game.
        setRoundManagerSockets(user);
    }
});

function setRoundManagerSockets(user){

    socket.on('connect', function(){
        // TODO: This could later be used to signal all clients when a particular user has 
        //       connected or disconnected (you could build some cool features with this!).

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

        socket.on(wordId, (word) => {
            $(`#${wordId}`).text(word);
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
                 //   window.location.replace(`/play/${extractGameCodeFromUrl()}?uuid=${data.judgeUuid}`);
                } else {
                    enableJudgeFunctionality(user);
                }
            }
        });
    
        // TODO: Set socket listeners for hover functionality and when the judge selects a winner
    });

    // Set firebase socket listener that will notify clients when the round is officially over (after judge selects winner).
    firebase.database().ref(nodes.game).child(gamecode).child(nodes.round).child(nodes.started)
        .on('value', (snap) => {
            if (!snap.val()){
                // TODO: Send post request to get each client's redirect by using their uid.
                // $.post(``)
            }
        });
}

function enableJudgeFunctionality(user){
    // TODO: Do something that triggers the judge the ability to select the winner.
    //       Also need to ensure that we have the right judge
    console.log("I'm the JUDGE");

    // TODO: Call 'selectWinner' from somewhere here.
}

function selectWinnner(winnerUuid){
    // TODO: Send post request to end the round.
}
