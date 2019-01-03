
function sockets(){
    var gamecode = '-LV2jTcUX3273QIjX4hv';
    var gameSocket = global.globalSocketIo
                    .of(`/game/play/${gamecode}`)
                    .on('connection', function (socket) {
                        // Need to set a connection handler to initilize the socket.
                        console.log(socket);
                        console.log("test")
                    });
                
}

