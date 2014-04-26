// PongMO Client
// Requires crafty.js and socket.io
// http://github.com/fazo96/PongMO

var paused = true;
var player = -1;

Crafty.init(600, 300, document.getElementById('game'));
Crafty.background('rgb(127,127,127)');
//Paddles
var p1 = Crafty.e("Paddle, 2D, DOM, Color, Multiway")
    .color('rgb(255,0,0)')
    .attr({ x: 20, y: 100, w: 10, h: 100 });
    //.multiway(4, { W: -90, S: 90 });
var p2 = Crafty.e("Paddle, 2D, DOM, Color, Multiway")
    .color('rgb(0,255,0)')
    .attr({ x: 580, y: 100, w: 10, h: 100 });
    //.multiway(4, { UP_ARROW: -90, DOWN_ARROW: 90 });

//Score boards
var leftpoints = Crafty.e("LeftPoints, DOM, 2D, Text")
    .attr({ x: 20, y: 20, w: 100, h: 20, points: 0 })
    .text("0 Points");
var rightpoints = Crafty.e("RightPoints, DOM, 2D, Text")
    .attr({ x: 515, y: 20, w: 100, h: 20, points: 0 })
    .text("0 Points");

var socket = io.connect('http://localhost:3000');

socket.on('connection',function(){
    console.log("connected");
});

socket.on('player',function(num){
    if(player == -1){
        console.log('Player: '+num);
        player = num;
        var p;
        if(player == 1) p = p1;
        else if (player == 2) p = p2;
        if(player == 1 || player == 2){
            p.multiway(4, { UP_ARROW: -90, DOWN_ARROW: 90 });
            p.bind('Move',function(){
                socket.emit('move',p.y);
            })
        }
    } else console.log('WARNING: new player ID received??')
});

function sendPoints(){
    if(player == 1){
        socket.emit('points',
        {left: leftpoints.points,
        right: rightpoints.points});
        console.log('points sent');
    }
}

//Ball
var ball = Crafty.e("2D, DOM, Color, Collision")
    .color('rgb(0,0,255)')
    .attr({ x: 300, y: 150, w: 10, h: 10,
            dX: Crafty.math.randomInt(2, 5),
            dY: Crafty.math.randomInt(2, 5) })
    .bind('EnterFrame', function () {
        //hit floor or roof
        if (this.y <= 0 || this.y >= 290){
            if(player==1){
                this.dY *= -1;
                sendBall();
            }
        }
        if (this.x > 600) {
            this.x = 300;
            if(player==1) ++leftpoints.points;
            leftpoints.text(leftpoints.points + " Points");
            sendPoints();
        }
        if (this.x < 10) {
            this.x = 300;
            if(player==1) ++rightpoints.points;
            rightpoints.text(rightpoints.points + " Points");
            sendPoints();
        }
        if(!paused){
            this.x += this.dX;
            this.y += this.dY;
        }
    })
    .onHit('Paddle', function () {
    if(player==1){
        this.dX *= -1;
        sendBall();
    }
});

function sendBall(){
    if(player==1){
        socket.emit('ball',{x : ball.x, y: ball.y, dX: ball.dX, dY: ball.dY });
        console.log('sent ball data');
    }
}

socket.on('ball', function(b){
    if(player != 1){
        ball.x = b.x; ball.y = b.y;
        ball.dX = b.dX; ball.dY = b.dY;
        console.log("received ball data");
    }
});

socket.on('points',function(data){
    if(player!= 1){
        leftpoints.points = data.left;
        rightpoints.points = data.right;
        rightpoints.text(rightpoints.points + " Points");
        leftpoints.text(leftpoints.points + " Points");
        console.log("Points received: "+data.left+" "+data.right);
    }
});

socket.on('reqpoints', function(){
    sendPoints();
})

socket.on('reqball',function(){
    sendBall();
})

socket.on('move1',function(pos){
    if(player!=1){
        p1.y = pos;
        console.log("Received paddle1 pos: "+pos);
    }
});

socket.on('move2',function(pos){
    if(player!=2){
        p2.y = pos;
        console.log("Received paddle2 pos: "+pos);
    }
});

socket.on('status',function(num){
    paused = (num==0);
    if(paused == false) sendBall();
    console.log("Game is now "+(paused?"paused":"resumed"));
});
