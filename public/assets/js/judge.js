let allcanvas = document.getElementsByClassName("judgeViewCanvas");
let allCanvas = Array.from(allcanvas);
socket.on('connect', function(socket) {
    console.log('A judge has connected');
});

socket.on('drawingToJudge', function(data){
    let drawerImage = new Image();
    let imgData = data.data;
    const canvas = document.getElementById(data.uuid);
    const ctx = canvas.getContext("2d");
    const cw = canvas.clientWidth;
    const ch= canvas.clientHeight;
    drawerImage.src = imgData; 
    ctx.clearRect(0,0, cw, ch)
    ctxDraw(ctx, drawerImage, cw, ch);
    console.log(data);
});

function ctxDraw(ctx, drawerImage, cw, ch){
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(drawerImage, 0, 0, cw/1.9, ch/2.2);
};
//Judging state
enableJudgingFunctionality();
function enableJudgingFunctionality(){
    for (let i = 0; i < allCanvas.length; i++) {
        allCanvas[i].classList.add("judgeState");
        allCanvas[i].addEventListener("click", chooseWinner, false);
    };
};

function chooseWinner(event){
    let winner = event.target; 

    winner.classList.add("winner");
    winner.classList.remove('judgeState');
    setTimeout(() => {
        $("#slideInWinner").stop().animate({
            right: 725
        }, 1000);
    }, 1500);

    allCanvas.forEach(function(i){
        i.classList.remove("judgeState");   
        if(!i.classList.contains("winner")){
            i.classList.add('losers');
        };
    });
};