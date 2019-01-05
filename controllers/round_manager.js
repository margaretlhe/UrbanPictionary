const utils = require('./utils');
const canvasManager = require('./canvas_manager');
const Firebase = require('../config/firebase');
const firebase = Firebase.admin;
const nodes = Firebase.nodes;
const gameStartCountdownId = "game-start-countdown";
const roundCountdownId = "round-countdown";
const gameTimerInSeconds = 10; // Timer used to countdown when the game begins.
const roundTimerInSeconds = 30; // Timer used to countdown when the round is over.
const wordLibrary = ['Coat hanger abortions',
                     'Man meat',
                     'Autocannibalism',
                     'Vigorous jazz hands',
                     'Flightless birds',
                     'Pictures of boobs',
                     'Doing the right thing',
                     'The violation of our most basic human rights',
                     'Viagra&reg;',
                     'Self-loathing',
                     'Spectacular abs',
                     'A balanced breakfast',
                     'Roofies',
                     'Concealing a boner',
                     'Amputees',
                     'The Big Bang',
                     'Former President George W, Bush',
                     'The Rev, Dr, Martin Luther King, Jr',
                     'Smegma',
                     'Being marginalized',
                     'Cuddling',
                     'Laying an egg',
                     'The Pope',
                     'Aaron Burr',
                     'Genital piercings',
                     'Fingering',
                     'A bleached asshole',
                     'Horse meat',
                     'Fear itself',
                     'Science',
                     'Elderly Japanese men',
                     'Stranger danger',
                     'The terrorists',
                     'Praying the gay away',
                     'Same-sex ice dancing',
                     'Ethnic cleansing',
                     'Cheating in the Special Olympics',
                     'German dungeon porn',
                     'Bingeing and purging',
                     'Making a pouty face',
                     'William Shatner'] // temporary word library
let wordIndex = 0; //temperorary wordINdex to serve words after each round

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
            canvasManager.setCanvasManager(gamecode);
            let newWord = getNewWord();
            setGameWord(gamecode, newWord); // TODO: Need to call function that gets word (maybe even before so we have the word ready to go on this step).
            gameSocket.emit(gameStartCountdownId, "GO!");
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

function setGameWord(gamecode, word){
    firebase.database().ref(nodes.games).child(gamecode).child(nodes.round).child(nodes.word)
        .set(word)
        .catch((error) => {
            utils.logError(error, "Error: Failed to set the game word!");
        });
}

function activateTimer(gamecode){
    // TODO: Set 'timerActive' to true for round
}

function setJudgeReconnectSocket(gamecode){
    // TODO: Set a on 'connection' socket listener that, upon a user connect event,
    //       will check if the user is a judge and if the timerActive is false.
    //       If so, then we'll need to emit a signal to the judge client that will enable all of the judge "select winner" functionality.
}

// temperoray words for the demo
function getNewWord() {
    wordIndex++;
    return wordLibrary[wordIndex];
}