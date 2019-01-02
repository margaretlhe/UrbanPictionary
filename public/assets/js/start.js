$(document).ready(function(){

    $("#start-btn").click(()=>{
        // Send post request that will start the game.
        $.post(`/game/start/${extractGameCodeFromUrl()}`, 
        extractQueryParametersFromUrl())
        .catch((error)=>{
            LogFirebaseError(error, "Error occurred while sending a post request to join a new game");
        });
    });      
})