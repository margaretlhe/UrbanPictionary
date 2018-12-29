// Dependencies
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');

// Instantiate app
const app = express();

// Set path to views directory
app.set('views', path.join(__dirname, 'views'));

// Set up handlebars as rendering engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Serve static content from our public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set up middleware to parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up app routes
require('./routes')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    res.render('error', {
      message: err.message,
      error: err
    })
  });

// Export our app
module.exports = app;