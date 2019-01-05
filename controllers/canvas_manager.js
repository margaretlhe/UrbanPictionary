const utils = require('./utils');

exports.setCanvasManager = function (gamecode) {
    let socket = utils.getSocketConnection(gamecode);

    socket.on('connection', function (socket) {

        socket.on('drawing', function (dataObj) {
            updateJudgeCanvas(dataObj);
        });

        socket.on('disconnect', function (socket) {
            console.log('user disconnected');
        });
    });
    
    function updateJudgeCanvas(dataObj){
        socket.emit('drawingToJudge', dataObj);
    };
};
