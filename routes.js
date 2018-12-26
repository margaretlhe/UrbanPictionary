module.exports = function(app){

    // Get routes
    const application = require('./routes/application');

    // Set app routes
    app.use('/', application);
}