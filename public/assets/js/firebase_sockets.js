$(document).ready(function(){

    // Get the game code from the url path.
    const gamecode = window.location.pathname.split('/').pop();
    const gameSnap = firebase.database().ref(nodes.games).child(gamecode);
    const maxPlayers = 5; // TODO: This global limit should be placed in one place accessable by client and server.
    
    firebase.auth().onAuthStateChanged((user)=>{
        if (user){
            // Only authenticated users can connect to a game.
            initializeConnection(user);
        }
    });

    function initializeConnection(user){
        gameSnap.once('value')
        .then((snap)=>{
            if (snap.exists()){
                // Update UI parameters that aren't expected to change while in the lobby.
                updateStaticUI(snap.child(nodes.sfw).val(), snap.child(nodes.roundCount).val());

                // Only users enrolled in a game can set client side sockets.
                var players = Object.keys(snap.child(nodes.players).val());
                if (players.includes(user.uid)){
                    setFirebaseSockets();
                }
            }
        }).catch((error)=>{
            LogFirebaseError(error, "Error while checking if user is enrolled in game");
        });
    }

    function setFirebaseSockets(){
        // Store player count used to signal automatic start once room is full.
        var playerCount = 0;

        // Monitor players added to the game.
        gameSnap.child(nodes.players).on('child_added', (childSnap)=>{
            addPlayerToLobby(childSnap.val());

            playerCount++;
            if (playerCount === maxPlayers){
                // TODO: start the game if max players have been reached.
            }
        });

        // Monitor players removed from the game.
        gameSnap.child(nodes.players).on('child_removed', (childSnap)=>{
            removePlayerFromLobby(childSnap.val().uuid);
        });

        // Monitor game start signal.
        gameSnap.child(nodes.round).child(nodes.started).on('value', (dataSnap)=>{
            if(dataSnap.val()){
                startGame();
            }
        });

        // Chat monitor
        // TODO: create listener for chat
    }

    function updateStaticUI(sfw, roundCount){
        // TEMP: This is an example.
        $("#sfw").text(sfw ? "SFW": "NSFW");
        $("#roundCount").text(roundCount);
    }

    function addPlayerToLobby(player){
        // TEMP: This is an example.
        $("#players").append(
            $("<li>")
            .attr("id", player.uuid)
            .text(`Display Name: ${player.displayName} | Judge: ${player.judge} | Score: ${player.score}`)
        );
    }

    function removePlayerFromLobby(playerUuid){
        // TEMP: This is an example.
        $(`#${playerUuid}`).remove();
    }

    function startGame(){
        // TODO: start the game.
    }
})