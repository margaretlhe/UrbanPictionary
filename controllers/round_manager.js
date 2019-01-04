const utils = require('./utils');
const canvasManager = require('./canvas_manager');
const Firebase = require('../config/firebase');
const firebase = Firebase.admin;
const nodes = Firebase.nodes;
const gameStartCountdownId = "game-start-countdown";
const roundCountdownId = "round-countdown";
const gameTimerInSeconds = 10; // Timer used to countdown when the game begins.
const roundTimerInSeconds = 30; // Timer used to countdown when the round is over.
 setTimeout(() => {
    exports.startRound('-LVMV3h36OUlcs7Lx-P0','1703dff0-0fe8-11e9-8237-739a2b570d29')
}, 2000); 
exports.startRound = function(gamecode, judgeUuid){
    activateTimer(gamecode);
    setJudgeReconnectSocket(gamecode);
    startGameCountdown(gamecode, judgeUuid);
}

function startGameCountdown(gamecode, judgeUuid){
    
    var gameSocket = utils.getSocketConnection(gamecode);
    var gameCountdown = new utils.CountdownTimer(0, gameTimerInSeconds, 1);

    gameCountdown.start(
        (timeLeft)=>{
            // During each time interval, we want to emit the time left.
            gameSocket.emit(gameStartCountdownId, timeLeft);
        },
        ()=>{
            // At the end of the timer, we want to enable the drawing canvas,
            // emit the word and start the round timer.

            // TODO: Need to instantiate canvas manager HERE.
            console.log("wtf");
            canvasManager.setCanvasManager(gameSocket);

            gameSocket.emit(gameStartCountdownId, "GO!");
            gameSocket.emit('word', "Some Funny Word!"); // TODO: Need to call function that gets word.
            gameSocket.emit(roundCountdownId, {
                active: true,
                timeLeft: utils.getFriendlyTimeLeft(roundTimerInSeconds)
            });
            startRoundCountdown(gamecode, judgeUuid);
        }
    );
}

function startRoundCountdown(gamecode, judgeUuid){

    var gameSocket = utils.getSocketConnection(gamecode);
    var roundCountdown = new utils.CountdownTimer(0,roundTimerInSeconds,1);
    
    roundCountdown.start(
        (timeLeft)=>{
            // During each time interval, we want to emit the time left.
            gameSocket.emit(roundCountdownId, {
                active: true,
                timeLeft: timeLeft
            });
        },
        ()=>{
            // At the end of the round timer, we want to emit a signal to notify all clients
            // that the the round is over and proceed to end the round.
            gameSocket.emit(roundCountdownId, {
                active: false,
                timeLeft: "Stop!",
                judgeUuid: judgeUuid
            });
        }
    );
}

function activateTimer(gamecode){
    // TODO: Set 'timerActive' to true for round
}

function setJudgeReconnectSocket(gamecode){
    // TODO: Set a on 'connection' socket listener that, upon a user connect event,
    //       will check if the user is a judge and if the timerActive is false.
    //       If so, then we'll need to emit a signal to the judge client that will enable all of the judge "select winner" functionality.
}