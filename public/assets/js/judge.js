socket.on('connect', function(socket) {
    console.log('A judge has connected');
});

socket.on('drawingToJudge', function(data){
    console.log('drawing event');
 
    let drawerImage = new Image();
    let imgData = data.data;
    const canvas = document.getElementById(data.uuid);
    const ctx = canvas.getContext("2d");
    const cw = canvas.clientWidth/2
    const ch= canvas.clientHeight/2
    drawerImage.src = imgData; 
    ctx.clearRect(0,0, cw, ch)
    ctxDraw(ctx, drawerImage, cw, ch);
    console.log(data);
});
function ctxDraw(ctx, drawerImage, cw, ch){
    ctx.drawImage(drawerImage, 0, 0, cw, ch);
};
