// Require just the firebase services we need
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyCASEJXRmR6qkqzmAuH2KLI6eTQbkGWW2g",
    authDomain: "urban-pictionary.firebaseapp.com",
    databaseURL: "https://urban-pictionary.firebaseio.com",
    projectId: "urban-pictionary",
    storageBucket: "urban-pictionary.appspot.com",
    messagingSenderId: "1068241160681"
});

module.exports = firebase;