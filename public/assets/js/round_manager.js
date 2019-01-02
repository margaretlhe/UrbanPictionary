const socket = io.connect(window.location.origin + window.location.pathname);
const room = extractQueryParametersFromUrl().uuid;
const gameStartCountdown = "game-start-countdown";
const roundCountdown = "round-countdown";

socket.on('connect', function(){
    socket.emit('user-connected', {
        room: room
    });
});

socket.on(gameStartCountdown, function(data){
    if (data.active){
        $(`#${gameStartCountdown}`).text(data.timeLeft);
        console.log(data.timeLeft);
    } else {
        $(`#${gameStartCountdown}`).remove();
        console.log("Game is starting!");
    }
});

socket.on(roundCountdown, function(data){
    if (data.active){
        $(`#${roundCountdown}`).text(data.timeLeft);
        console.log(data.timeLeft);
    } else {
        $(`#${roundCountdown}`).remove();
        console.log("Round is ending");
    }
});

socket.on('word', function(word){
    console.log("Word: " + word);
});