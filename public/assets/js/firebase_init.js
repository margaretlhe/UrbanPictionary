// Initialize Firebase
const config = {
    apiKey: "AIzaSyCASEJXRmR6qkqzmAuH2KLI6eTQbkGWW2g",
    authDomain: "urban-pictionary.firebaseapp.com",
    databaseURL: "https://urban-pictionary.firebaseio.com",
    projectId: "urban-pictionary",
    storageBucket: "urban-pictionary.appspot.com",
    messagingSenderId: "1068241160681"
};
firebase.initializeApp(config);

const nodes = { // TODO: This should be in one place where accessable by both client and server (not sure where yet).
    games: "games",
    players: "players",
    round: "round",
    sfw: "sfw",
    roundCount: "roundCount",
    started: "started",
    uuid: "uuid"
};

const auth = {

    signInAnonymously: (callback) => {
        firebase.auth().signInAnonymously()
        .then(callback)
        .catch((error) => {
            LogFirebaseError(error, "Error while signing in user anonymously");
        });
    }

    // TODO: This can expand into other types of authentication.
}

function extractGameCodeFromUrl(){
    // Get the game code from the url path.
    return window.location.pathname.split('/').pop();
}

function extractQueryParametersFromUrl(){
    // Extract query parameters from url.
    var queryParams = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m,key,value)=>{
        queryParams[key] = value;
    });
    return queryParams;
}

function LogFirebaseError(error, consoleMsg){
    // TODO: Need to handle errors in a better way.
    console.log(consoleMsg);
    console.log(error);
}