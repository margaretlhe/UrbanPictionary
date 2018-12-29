var auth = {

    signInAnonymously: (callback) => {
        firebase.auth().signInAnonymously()
        .then(callback)
        .catch((error) => {
            // TODO: Need better error handling.
            console.log("Error Occurred");
            console.log(error);
        });
    }

    // TODO: This can expand into other types of authentication.
}
