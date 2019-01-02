$(document).ready(function() {
    var createGameForm = $("#create-game");
    var displayName = $("#display-name");

    createGameForm.on('submit', (e)=>{
        e.preventDefault();

        // TODO: need BETTER client side validation than this.
        
        if (displayName.val()){
            auth.signInAnonymously((response)=>{
                console.log("WTF");
                // Since all of our users are anonymous, we need to update their display name each time (for now).
                updateDisplayName(displayName.val());

                var data = serializeFormInputs(createGameForm.serializeArray());
                data.uid = response.user.uid;
                data.displayName = displayName.val();

                // Create a new game with the User's ID and user is redirected to new game.
                $.post("/game/create", data)
                .then((res)=>{
                    if (res.redirect){
                        // Redirect only if request returns a url.
                        window.location.replace(res.redirect);
                    }
                }).catch((error)=>{
                    logError(error, "Error occurred while sending a post request to create a new game");
                });
            });
        }
    });
});