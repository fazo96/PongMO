var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static('./client'));

var p1 = null, p2 = null;

io.sockets.on('connection', function(socket){
    console.log('connection incoming');
    if(p1 == null) {
        p1 = socket;
        socket.emit('player',1);
        socket.on('ball',function(data){
            io.sockets.emit('ball',data);
            console.log('New ball position: '+data);
        });
        socket.on('points',function(data){
            io.sockets.emit('points',data);
            console.log('Points updated: '+data);
        });
    }
    else if(p2 == null) { p2 = socket; socket.emit('player',2);}
    else {
        socket.emit('player',0);
        p1.emit('reqpoints'); p1.emit('reqball');
    }
    if(p1 != null && p2 != null)
        io.sockets.emit('status',1); //1 is play, 0 is stop

    socket.on('move',function(pos){
        io.sockets.emit((socket===p1?'move1':'move2'),pos);
        console.log('New paddle position: '+pos);
    })
});

server.listen(3000);
