module.exports = function(app){

    // Get routes
    const application = require('./routes/application');
    const game = require('./routes/game');

    // Set app routes
    app.use('/', application);
    app.use('/game', game);
}