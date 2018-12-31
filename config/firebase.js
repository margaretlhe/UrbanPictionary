// Require just the firebase services we need
const keys = require('./keys');
const admin = require('firebase-admin');
const uuidv1 = require('uuid/v1');

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

exports.nodes = { // TODO: This should be in one place where accessable by both client and server (not sure where yet..db?).
    games: "games",
    players: "players",
    round: "round",
    started: "started",
    word: "word",
    uuid: "uuid",
    owner: "owner",
    judge: "judge"
};

exports.Game = function(ownerUid, ownerObj, sfw){
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
    this.players =  {
        [ownerUid]: ownerObj
    }
}

exports.Player = function(displayName, owner, judge){
    this.displayName = displayName,
    this.owner = owner,
    this.judge = judge,
    this.score = 0,
    // Difference between the player's uid and uuid:
    // - uid: Player's private auth uid as defined in firebase's authenticated users.
    // - uuid: Generated public unique id to represent the user for a given game.
    //         This is generated to be able to identify the user in a game on the client side
    //         without having to expose the user's private auth uid.
    this.uuid = uuidv1()
};