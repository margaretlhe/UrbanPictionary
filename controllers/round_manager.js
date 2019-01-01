// NOTES:
// 1. Method that receives the game code
// 2. Round manager (RM) will need to go and get the game from firebase
// 3. RM will need to know who's the judge to be able to somehow redirect users to the judges view.
const utils = require('./utils');

setTimeout(testing, 2000);

function testing(){
    console.log(globalSocketIo);

    // var chat = io
    // .of('/chat')
    // .on('connection', function (socket) {
    //     socket.emit('a message', {
    //         that: 'only'
    //     , '/chat': 'will get'
    //     });
    //     chat.emit('a message', {
    //         everyone: 'in'
    //     , '/chat': 'will get'
    //     });
    // });

    // var news = io
    // .of('/news')
    // .on('connection', function (socket) {
    //     socket.emit('item', { news: 'item' });
    // })
}

exports.manageRound = function(gamecode){
    
    
}