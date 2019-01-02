// NOTES:
// 1. Method that receives the game code
// 2. Round manager (RM) will need to go and get the game from firebase
// 3. RM will need to know who's the judge to be able to somehow redirect users to the judges view.
const utils = require('./utils');
const gameStartCountdown = "game-start-countdown";
const roundCountdown = "round-countdown";

// setTimeout(testing, 2000);

function testing(){
    var gamecode = '-LV1d95FdTQMRti66se8';
    var gameSocket = globalSocketIo
                    .of(`/game/play/${gamecode}`)
                    .on('connection', function (socket) {
                        // Need to set a connection handler to initilize the socket.
                    });
                
    var gameCountdown = new utils.CountdownTimer(0, 10, 1);
    gameCountdown.start(
        (timeLeft)=>{
            gameSocket.emit(gameStartCountdown, {
                active: true,
                timeLeft: timeLeft
            });
        },
        ()=>{
            gameSocket.emit(gameStartCountdown, {
                active: false,
                timeLeft: 0
            });
            startRound();
        }
    );

    function startRound(){
        console.log("Round is about to start");
        var roundCountdown = new utils.CountdownTimer(2,0,1);
        roundCountdown.start(
            (timeLeft)=>{
                // console.log(timeLeft);
                gameSocket.emit(roundCountdown, {
                    active: true,
                    timeLeft: timeLeft
                });
            },
            ()=>{
                gameSocket.emit(roundCountdown, {
                    active: false,
                    timeLeft: 0
                });
            }
        );
    }

    // setTimeout(()=>{
    //     console.log("This got triggered");
    //     gameSocket.emit('word', "Some funny word");
    // }, 5000);
    
    // socket.emit('testing', {
        //     that: 'only',
        //     '/chat': 'will get'
        // });
        // gameSocket.emit('testing', {
        //     everyone: 'in',
        //     '/chat': 'will get'
        // });
}

exports.startRound = function(gamecode){
    
}