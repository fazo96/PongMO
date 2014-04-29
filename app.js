var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static('./client'));

var p1 = null, p2 = null;
var spectators = 0;

function sendPlayers(){
    io.sockets.emit('players',{one: p1!==null, two: p2!==null, spectat: spectators});
}

io.sockets.on('connection', function(socket){
    console.log('connection incoming');
    // Connection incoming
    if(p1 === null) { // Player 1 is null, so this guy will be P1
        p1 = socket;
        socket.emit('player',1);
        // The Player 1 "commands" the game and provides the data, the server
        // just sends the data to other players.
        socket.on('ball',function(data){
            io.sockets.emit('ball',data);
            console.log('New ball position: '+data);
        });
        socket.on('points',function(data){
            io.sockets.emit('points',data);
            console.log('Points updated: '+data);
        });
    }
    else if(p2 === null) { // Player 2 is null, so this guy will be P2
        p2 = socket; 
        socket.emit('player',2);
    }
    else { // There are already 2 players, so this guy will spectate
        socket.emit('player',0);
        spectators++;
        // Request newest game info
        p1.emit('reqpoints'); p1.emit('reqball');
    }
    if(p1 !== null && p2 !== null)
        //we have enough player to start the game!
        io.sockets.emit('pause',false); //1 is play, 0 is stop

    socket.on('disconnect',function(){
        if(socket === p1 || socket === p2){
            if(socket === p1){
                p1 = null;
            } else if(socket === p2) p2 = null;
            io.sockets.emit('pause',true); //stop the game
        } else {
           spectators--;
        }
        sendPlayers();
    });
    
    sendPlayers();
    
    socket.on('move',function(pos){
        if(socket === p1 || socket === p2)
            io.sockets.emit((socket===p1?'move1':'move2'),pos);
    })
});

server.listen(process.env.PORT || 3000);
