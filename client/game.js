var ball, board, connectTo, id, idTo, leftpoints, p1, p2, paused, peer, player, player1, player2, rightpoints, sendBall, sendPoints, server, spectators, spectnum, writeInfo;

paused = true;

player = -1;

player1 = null;

player2 = null;

spectators = [];

spectnum = 0;

id = null;

server = true;

idTo = window.location.hash.slice(1);

board = document.getElementById("board");

board.innerHTML = "Connecting to " + idTo;

if (idTo === "") {
  board.innerHTML = "Hosting game. Awaiting for ID";
}

Crafty.init(600, 300, document.getElementById("game"));

Crafty.background('rgb(126, 126, 126)');

p1 = Crafty.e("Paddle, 2D, DOM, Color, Multiway").color("rgb(255,0,0)").attr({
  x: 20,
  y: 100,
  w: 10,
  h: 100
});

p2 = Crafty.e("Paddle, 2D, DOM, Color, Multiway").color("rgb(0,255,0)").attr({
  x: 580,
  y: 100,
  w: 10,
  h: 100
});

leftpoints = Crafty.e("DOM, 2D, Text").attr({
  x: 20,
  y: 20,
  w: 100,
  h: 20,
  points: 0
}).text("0 Points");

rightpoints = Crafty.e("DOM, 2D, Text").attr({
  x: 515,
  y: 20,
  w: 100,
  h: 20,
  points: 0
}).text("0 Points");

ball = Crafty.e("2D, DOM, Color, Collision").color('rgb(0,0,255)').attr({
  x: 300,
  y: 150,
  w: 10,
  h: 10,
  dX: Crafty.math.randomInt(2, 5),
  dY: Crafty.math.randomInt(2, 5)
}).bind('EnterFrame', function() {
  if (player === 1) {
    if (this.y <= 0 || this.y >= 290) {
      this.dY *= -1;
      sendBall();
    }
    if (this.x > 600) {
      this.x = 300;
      ++leftpoints.points;
      leftpoints.text(leftpoints.points + " Points");
      sendPoints();
    }
    if (this.x < 10) {
      this.x = 300;
      ++rightpoints.points;
      rightpoints.text(rightpoints.points + " Points");
      sendPoints();
    }
  }
  if (paused === false) {
    this.x += this.dX;
    return this.y += this.dY;
  }
}).onHit('Paddle', function() {
  if (player === 1) {
    this.dX *= -1;
    return sendBall();
  }
});

sendBall = function() {
  var p, packet, _i, _len;
  if (player === 1) {
    packet = {
      msg: 'ball',
      x: ball.x,
      y: ball.y,
      dX: ball.dX,
      dY: ball.dY
    };
    for (_i = 0, _len = spectators.length; _i < _len; _i++) {
      p = spectators[_i];
      p.send(packet);
    }
    if (player2 !== null) {
      return player2.send(packet);
    }
  }
};

writeInfo = function() {
  board.innerHTML = (player === 1 ? "You: " + id : (player1 !== null ? "P1: " + idTo : "Nobody")) + " vs " + (player === 2 ? "You: " + id : (player2 !== null ? "P2: " + idTo : "Nobody"));
  return +", spectators: " + (player === 1 ? spectators.length : spectnum);
};

sendPoints = function() {
  var p, packet, _i, _len, _results;
  if (player === 1) {
    packet = {
      msg: 'points',
      left: leftpoints.points,
      right: rightpoints.points
    };
    if (player2 !== null) {
      player2.send(packet);
    }
    _results = [];
    for (_i = 0, _len = spectators.length; _i < _len; _i++) {
      p = spectators[_i];
      _results.push(p.send(packet));
    }
    return _results;
  }
};

connectTo = function(id) {
  var conn;
  console.log("Trying connection to " + idTo);
  server = false;
  conn = peer.connect(id);
  conn.on('close', function() {
    return console.log("Closed remote connection");
  });
  return conn.on('data', function(data) {
    var p;
    if (data.msg === 'nope') {
      player = -1;
      console.log('Connection refused!');
      return board.innerHTML = "Connection refused by remote player";
    } else if (data.msg === 'ball') {
      console.log("ball packet");
      ball.x = data.x;
      ball.y = data.y;
      ball.dX = data.dX;
      return ball.dY = data.dY;
    } else if (data.msg === 'you') {
      player = data.you;
      p = null;
      console.log("Received info packet, I'm P" + player);
      if (player === 1) {
        p = p1;
      } else if (player === p2) {
        p = 2;
      } else {
        p = null;
      }
      if (p !== null) {
        p.multiway(4, {
          UP_ARROW: -90,
          DOWN_ARROW: 90
        });
        return p.bind('Move', function() {
          return conn.send({
            msg: 'pos',
            pos: p.y
          });
        });
      }
    } else if (data.msg === 'points') {
      leftpoints.points = data.left;
      rightpoints.points = data.right;
      rightpoints.text("" + rightpoints.points + " Points");
      return leftpoints.text("" + leftpoints.points + " Points");
    } else if (data.msg === 'pos') {
      return p1.y = data.pos;
    } else if (data.msg === 'status') {
      paused = data.paused;
      spectnum = spectators.length;
      writeInfo();
      if (paused) {
        ball.x = 300;
        ball.y = 150;
        leftpoints.points = 0;
        rightpoints.points = 0;
        rightpoints.text("0 Points");
        leftpoints.text("0 Points");
      }
      return console.log("Game is now " + (paused === true ? "paused" : "resumed"));
    }
  });
};

peer = new Peer({
  key: 'c0ae8qi4pvp4aemi'
});

peer.on("open", function(data) {
  id = data;
  console.log("My ID is " + id);
  if (idTo === "" || idTo === null || idTo === void 0) {
    return board.innerHTML = "Awaiting connections. ID: " + id;
  } else {
    return board.innerHTML = "ID: " + id + " - Connecting to " + idTo;
  }
});

peer.on("error", function(err) {
  board.innerHTML = "Fatal connection error: " + err;
  paused = true;
  return peer.close();
});

peer.on("close", function() {
  return console.log("Closed peer");
});

peer.on('connection', function(conn) {
  var s, _i, _len, _results;
  console.log(player + " " + server);
  if (server === false || player !== -1) {
    conn.send({
      msg: 'nope'
    });
    console.log('Refused connection');
    conn.close();
    return;
  }
  console.log("Incoming connection!");
  player = 1;
  player1 = -1;
  if (player2 === null) {
    player2 = conn;
    conn.send({
      msg: 'you',
      you: 2
    });
    console.log('Assigned player 2');
    p1.multiway(4, {
      UP_ARROW: -90,
      DOWN_ARROW: 90
    });
    p1.bind('Move', function() {
      return conn.send({
        msg: 'pos',
        pos: p1.y
      });
    });
    paused = false;
    console.log("Game started");
    writeInfo();
    conn.on('data', function(data) {
      if (data.msg === 'pos') {
        return p2.y = data.pos;
      }
    });
  } else {
    spectators.push(conn);
    console.log('Assigned spectator');
    conn.send({
      msg: 'you',
      you: 0
    });
  }
  _results = [];
  for (_i = 0, _len = spectators.length; _i < _len; _i++) {
    s = spectators[_i];
    _results.push(s.send({
      msg: 'status',
      paused: paused,
      p1: player1 !== null,
      p2: player2 !== null,
      spectators: spectators.length
    }));
  }
  return _results;
});

if (idTo !== void 0 && idTo !== "" && idTo !== null) {
  connectTo(idTo);
}
