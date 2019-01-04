function sockets() {
    let socket = global.globalSocketIo;
    socket.on('connection', function(socket){
        console.log('a user connected')
        socket.on('drawing', function(data) {
            console.log(data)
        })
        socket.on('disconnect', function(){
          console.log('user disconnected');
        });
      });
      
}
