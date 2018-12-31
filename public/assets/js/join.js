$(document).ready(function(){

    var displayName = $("#display-name");
    var startGameBtn = $("#start-btn");
    var joinGameForm = $("#join-game");
    var sfw = $("#sfw");

    startGameBtn.on('click', ()=> {

        // TODO: need BETTER client side validation than this.
        
        if (displayName.val()){
            auth.signInAnonymously((response)=>{

                // Since all of our users are anonymous, we need to update their display name each time (for now).
                updateDisplayName(displayName.val());

                // Create a new game with the User's ID and user is redirected to new game.
                $.post("/game/create", {
                    uid: response.user.uid,
                    displayName: displayName.val(),
                    sfw: sfw.val()
                }).then((res)=>{
                    if (res.redirect){
                        // Redirect only if request returns a url.
                        window.location.replace(res.redirect);
                    }
                }).catch((error)=>{
                    LogFirebaseError(error, "Error occurred while sending a post request to create a new game");
                });
            });
        }
    });

    joinGameForm.on('submit', (e)=>{
        e.preventDefault();

        // TODO: Need BETTER validation here.

        if (displayName.val()){
            auth.signInAnonymously((response) => {

                // Since all of our users are anonymous, we need to update their display name each time (for now).
                updateDisplayName(displayName.val());

                // Serialize form input data for post request.
                var data = {};
                data.uid = response.user.uid;
                data.displayName = displayName.val();
                $.each(joinGameForm.serializeArray(), (i, field) => {
                    data[field.name] = field.value;
                });

                $.post("/game/join", data).then((res)=>{
                    if (res.redirect){
                        window.location.replace(res.redirect);
                    }
                }).catch((error)=>{
                    LogFirebaseError(error, "Error occurred while sending a post request to join a new game");
                });
            });
        }
    });

    function updateDisplayName(name){
        firebase.auth().currentUser.updateProfile({
            displayName: name
        }).catch((error)=>{
            LogFirebaseError(error, "Error Occurred while updating the user's display name");
        })
    }
})