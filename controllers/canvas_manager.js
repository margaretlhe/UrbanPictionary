const utils = require('./utils');

exports.setCanvasManager = function (gamecode) {
    let socket = utils.getSocketConnection(gamecode);

    socket.on('connection', function (socket) {
        console.log("someone has connected!");  

        socket.on('drawing', function (dataObj) {
            console.log('drawing event triggered');
            updateJudgeCanvas(dataObj);
         //   socket.broadcast.emit('drawingToJudge', dataObj);
        });

        socket.on('disconnect', function (socket) {
            console.log('user disconnected');
        });
        console.log('CANVAS MANAGER');
    });
    
    function updateJudgeCanvas(dataObj){
        socket.emit('drawingToJudge', dataObj);
    };
};