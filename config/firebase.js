// Require just the firebase services we need
const keys = require('./keys');
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
        type: keys.firebase_admin.type,
        projectId: keys.firebase_admin.project_id,
        private_key_id: keys.firebase_admin.private_key_id,
        private_key: keys.firebase_admin.private_key,
        client_email: keys.firebase_admin.client_email,
        client_id: keys.firebase_admin.client_id,
        auth_uri: keys.firebase_admin.auth_uri,
        token_uri: keys.firebase_admin.token_uri,
        auth_provider_x509_cert_url: keys.firebase_admin.auth_provider_x509_cert_url,
        client_x509_cert_url: keys.firebase_admin.client_x509_cert_url
    }),
    databaseURL: "https://urban-pictionary.firebaseio.com/",
    databaseAuthVariableOverride: {
        uid: keys.firebase_admin.service_uid
      }
});

exports.admin = admin;

exports.nodes = {
    games: "games",
    players: "players"
};

exports.Game = function(sfw, players){
    // Set default values.
    this.active = true,
    this.roundCount = 0,
    this.usedWordIds = [0],
    this.round = {
        started: false,
        word: "_"
    }

    // Set variable parameters
    this.sfw = sfw,
    this.players = players
}

exports.Player = function(id, judge){
    return {
        [id]: {
            judge: judge,
            score: 0
        }
    }
};