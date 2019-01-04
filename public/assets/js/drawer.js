// TODO: You can use socket and room here which is set from room_manager.js.
// console.log(socket);
// console.log(room);

// TODO: This is where the socket listeners will go for a drawer.

// TODO: Make sure that only the client with the matching private uid of the public uuid can draw.

const canvas = document.getElementById('drawerCanvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
ctx.strokeStyle = '#000';
ctx.lineWidth = 1;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let direction = true;

setTimeout(() => {
    let gameCode = extractGameCodeFromUrl();
    let socket = io('/game/play/' + gameCode);

    socket.on('connection', function (socket) {
        console.log("drawer is connected");
    })
    
    console.log(socket);
    console.log("timeout done")
}, 5000);

function draw(e) {
    if (!isDrawing) {
        return; // stop the function when not moused down.
    }
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
    getDataAndEmit();
}

function getDataAndEmit() {
    let data = canvas.toDataURL()
    let uuid // =  NEED TO GET UUID 
    // Emit drawing event and send uuid (corresponding canvas ID) and base64 image of canvas

    socket.emit('drawing', data);
}

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false
    getDataAndEmit()
});

canvas.addEventListener('mouseout', () => isDrawing = false);