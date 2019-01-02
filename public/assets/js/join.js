$(document).ready(function(){

    var displayName = $("#display-name");
    var joinGameForm = $("#join-game");

    
    joinGameForm.on('submit', (e)=>{
        e.preventDefault();

        // TODO: Need BETTER validation here.

        if (displayName.val()){
            auth.signInAnonymously((response) => {

                // Since all of our users are anonymous, we need to update their display name each time (for now).
                updateDisplayName(displayName.val());

                // Serialize form input data for post request.
                var data = serializeFormInputs(joinGameForm.serializeArray());
                data.uid = response.user.uid;
                data.displayName = displayName.val();
              
                $.post("/join", data).then((res)=>{
                    if (res.redirect){
                        window.location.replace(res.redirect);
                    }
                }).catch((error)=>{
                    logError(error, "Error occurred while sending a post request to join a new game");
                });
            });
        }
    });
})