const nodes = require('../config/firebase').nodes;

exports.getLobbyRedirectObj = function(gamecode, playerUuid) {
    return {
        redirect: `/game/lobby/${gamecode}?${nodes.uuid}=${playerUuid}`
    };
}

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

exports.CountdownTimer = function(timeInMinutes, timeInSeconds, intervalInSeconds){
    this.duration = (60 * timeInMinutes) + timeInSeconds;
    this.interval = (intervalInSeconds * 1000); // Convert to milliseconds.
    
    this.start = (intervalCallback, endCallback)=>{
        // Start function takes 2 callbacks:
        // intervalCallback: 
        //      - Function that gets executed after each interval. 
        //      - The time left value will be passed into this function.
        // endCallback:
        //      - Function that gets executed after the countdown has expired.

        // Set required parameters at the function scope level.
        let interval = this.interval
        let duration = this.duration;
        let nextExpectedTime = Date.now() + interval;
        
        // Start countdown.
        setTimeout(decrementCountdown, interval);

        function decrementCountdown() {
            // Reference: https://stackoverflow.com/questions/29971898/how-to-create-an-accurate-timer-in-javascript

            // Calculate the time drift by subtracting the current time by our previous expected time (this could be postive or negative drift).
            let dt = Date.now() - nextExpectedTime;
            if (dt > interval) {
                // This is really bad. If this happens, that means that the 'setTimeout' function was somehow 
                // interrupted. Our server might be overloaded or something.
                // TODO: special handling to avoid futile "catch up" run
                exports.logError("ERROR: Time drift was greater than expected interval (server potentially overloaded...)");
            }
            
            // Update start method scope level parameters.
            --duration;
            nextExpectedTime += interval;
            
            // Create a new async promise that executes the given interval function.
            // This is a promise so that it never interferes with the countdown. 
            new Promise((resolve)=>{
                var timeLeft = exports.getFriendlyTimeLeft(duration);
                resolve(intervalCallback(timeLeft));
            });
            
            // If the countdown has reached 0 then end the countdown by calling the end callback.
            if (duration === 0){
                endCallback();
            } else {
                // Continue the countdown by setting the next interval timeout
                // after taking into account the time drift.
                setTimeout(decrementCountdown, Math.max(0, interval - dt));
            }
        }
    }
}

exports.getFriendlyTimeLeft = function(timeInSeconds){
    var minutes = parseInt(timeInSeconds / 60, 10);
    var seconds = parseInt(timeInSeconds % 60, 10);

    minutes = exports.addLeadingZeroToSingleDigitNumber(minutes);
    seconds = exports.addLeadingZeroToSingleDigitNumber(seconds);
    return `${minutes}:${seconds}`;
}

exports.addLeadingZeroToSingleDigitNumber = function(num){
    // Add leading zero to any numbers that are single digits.
    return num < 10 ? `0${num}` : num;
}

exports.testTimer = function(){
    // Function used to test or demonstrate how the countdown timer works.
    var t1 = new exports.CountdownTimer(1, 0, 1);
    t1.start(
        (timeLeft)=> console.log("T1: " + timeLeft),
        ()=>console.log("T1 STOPPED")
    );

    var t2 = new exports.CountdownTimer(0, 30, 1);
    t2.start(
        (timeLeft)=>console.log("T2: " + timeLeft),
        ()=>console.log("T2 STOPPED")
    );
}