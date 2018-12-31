exports.renderError = function(res, err, consoleMsg){
    // NOTE: This method should only be called from GET requests. If it's called
    //       from any other types of requests, it won't render anything.
    exports.logError(err, consoleMsg);
    res.render('error', { error: err });
}

exports.logError = function(err, consoleMsg){
    // TODO: Better error handling for backend.
    console.log(consoleMsg);
    console.log(err);
}