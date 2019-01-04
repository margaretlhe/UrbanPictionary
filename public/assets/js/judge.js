socket.on('connection', function (socket) {
    console.log('A judge has connected');
    socket.on('drawingToJudge', function (data) {
        // Draw image to correct canvas 
        /*
        let canvas = document.getElementById(data.uuid);
        let ctx = canvas.getContext("2d");
        ctx.drawImage(data.data, 0, 0);
        */
       console.log(data);
        
    });
});