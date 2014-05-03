var ball, board, leftpoints, p1, p1conn, p2, p2conn, paused, player, rightpoints, sendBall, sendPoints, socket, spectators, writeInfo;

paused = true;

player = -1;

board = document.getElementById("board");

board.innerHTML = "Connecting...";

spectators = 0;

p1conn = false;

p2conn = true;

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

socket = io.connect();

socket.on("connection", function() {
  return console.log("Connected");
});

writeInfo = function() {
  board.innerHTML = (player === 1 ? "You" : (p1conn ? "Online P1" : "Nobody")) + " vs " + (player === 2 ? "You" : (p2conn ? "Online P2" : "Nobody"));
  return +", spectators: " + spectators;
};

socket.on("players", function(data) {
  spectators = data.spectat;
  p1conn = data.one;
  p2conn = data.two;
  return writeInfo();
});

socket.on("player", function(num) {
  var p;
  if (player === -1) {
    console.log("Player: " + num);
    player = num;
    p = null;
    if (player === 1) {
      p = p1;
      sendBall();
    } else if (player === 2) {
      p = p2;
    }
    if (player === 1 || player === 2) {
      p.multiway(4, {
        UP_ARROW: -90,
        DOWN_ARROW: 90
      });
      return p.bind('Move', function() {
        return socket.emit('move', p.y);
      });
    }
  } else {
    return console.log('WARNING: New player ID received??');
  }
});

sendPoints = function() {
  if (player === 1) {
    return socket.emit('points', {
      left: leftpoints.points,
      right: rightpoints.points
    });
  }
};

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
  if (player === 1) {
    return socket.emit('ball', {
      x: ball.x,
      y: ball.y,
      dX: ball.dX,
      dY: ball.dY
    });
  }
};

socket.on('ball', function(b) {
  if (player !== 1) {
    ball.x = b.x;
    ball.y = b.y;
    ball.dX = b.dX;
    return ball.dY = b.dY;
  }
});

socket.on('points', function(data) {
  if (player !== 1) {
    leftpoints.points = data.left;
    rightpoints.points = data.right;
    rightpoints.text(rightpoints.points + " Points");
    return leftpoints.text(leftpoints.points + " Points");
  }
});

socket.on('reqpoints', function() {
  return sendPoints();
});

socket.on('reqball', function() {
  return sendBall();
});

socket.on('move1', function(pos) {
  if (player !== 1) {
    return p1.y = pos;
  }
});

socket.on('move2', function(pos) {
  if (player !== 2) {
    return p2.y = pos;
  }
});

socket.on('pause', function(data) {
  paused = data;
  writeInfo();
  if (data) {
    ball.x = 300;
    ball.y = 150;
    p1.y = 100;
    p2.y = 100;
    leftpoints.points = 0;
    rightpoints.points = 0;
    leftpoints.text("0 Points");
    rightpoints.text("0 Points");
  }
  return console.log("Game is now " + (paused === true ? "paused" : "resumed"));
});
