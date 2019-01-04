setTimeout(() => {

    socket.on('connection', function(socket){
        console.log('a user connected')     

            socket.on('drawing', function(data) {
                console.log(data);
                console.log("drawing event triggered");
                socket.emit('drawingTojudge', data)
             })

        socket.on('disconnect', function(socket){
          console.log('user disconnected');
        });
      });
      console.log('CANVAS MANAGER')
}, 5000);

