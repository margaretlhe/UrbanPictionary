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
                    sfw: sfw.val()
                }).then((res)=>{
                    window.location.replace(res.redirect);
                })
                .catch((error)=>{
                    // TODO: Need to handle errors in a better way.
                    console.log("Error occurred while sending a post request to create a new game");
                    console.log(error);
                })
            });
        }
    });

    joinGameForm.on('submit', (e)=>{
        e.preventDefault();
        if (displayName.val()){
            auth.signInAnonymously((response) => {

                // Since all of our users are anonymous, we need to update their display name each time (for now).
                updateDisplayName(displayName.val());

                // Serialize form input data for post request.
                var data = {};
                data["uid"] = response.user.uid;
                $.each(joinGameForm.serializeArray(), (i, field) => {
                    data[field.name] = field.value;
                });

                $.post("/game/join", data).then((res)=>{
                    window.length.replace(res.redirect);
                })
                .catch((error)=>{
                    // TODO: Need to handle errors in a better way.
                    console.log("Error occurred while sending a post request to join a new game");
                    console.log(error);
                })
            });
        }
    });

    function updateDisplayName(name){
        firebase.auth().currentUser.updateProfile({
            displayName: name
        }).catch((error)=>{
            // TODO: Need to handle errors in a better way.
            console.log("Error Occurred while updating the user's display name");
            console.log(error);
        })
    }
})