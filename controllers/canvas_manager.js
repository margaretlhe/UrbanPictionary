const utils = require('./utils');

exports.setCanvasManager = function (gamecode) {
    let socket = utils.getSocketConnection(gamecode);
    socket.on('connection', function () {
        console.log("someone has connected!")

            socket.on('drawing', function(dataObj) {
                console.log(dataObj);
                console.log("drawing event triggered");
                socket.emit('drawingTojudge', dataObj);
            });
        socket.on('disconnect', function (socket) {
            console.log('user disconnected');
        });
        console.log('CANVAS MANAGER');
    });
};