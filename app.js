var app, express, io, p1, p2, sendPlayers, server, spectators;

express = require('express');

app = express();

server = require('http').createServer(app);

io = require('socket.io').listen(server);

app.use(express["static"]('./client'));

p1 = null;

p2 = null;

spectators = 0;

sendPlayers = function() {
  return io.sockets.emit('players', {
    one: p1 !== null,
    two: p2 !== null,
    spectat: spectators
  });
};

io.sockets.on('connection', function(socket) {
  console.log('Connection incoming');
  if (p1 === null) {
    p1 = socket;
    socket.emit('player', 1);
    socket.on('ball', function(data) {
      return io.sockets.emit('ball', data);
    });
    socket.on('points', function(data) {
      return io.sockets.emit('points', data);
    });
  } else if (p2 === null) {
    p2 = socket;
    socket.emit('player', 2);
  } else {
    socket.emit('player', 0);
    spectators++;
    p1.emit('reqpoints');
    p1.emit('reqball');
  }
  if (p1 !== null && p2 !== null) {
    io.sockets.emit('pause', false);
  }
  sendPlayers();
  socket.on('disconnect', function() {
    if (socket === p1) {
      p1 = null;
    } else if (socket === p2) {
      p2 = null;
    } else {
      spectators--;
    }
    return sendPlayers();
  });
  return socket.on('move', function(pos) {
    if (socket === p1 || socket === p2) {
      return io.sockets.emit((socket === p1 ? 'move1' : 'move2'), pos);
    }
  });
});

server.listen(process.env.PORT || 3000);
