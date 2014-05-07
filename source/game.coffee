paused = yes
player = -1
board = document.getElementById "board"
board.innerHTML = "Connecting..."
spectators = 0
p1conn = false; p2conn = true

Crafty.init 600, 300, document.getElementById "game"
Crafty.background 'rgb(126, 126, 126)'

# Paddles
p1 = Crafty.e "Paddle, 2D, DOM, Color, Multiway"
    .color "rgb(255,0,0)"
    .attr { x: 20, y: 100, w: 10, h: 100 }

p2 = Crafty.e "Paddle, 2D, DOM, Color, Multiway"
    .color "rgb(0,255,0)"
    .attr { x: 580, y: 100, w: 10, h: 100 }

# Score Boards
leftpoints = Crafty.e "DOM, 2D, Text"
    .attr { x: 20, y: 20, w: 100, h: 20, points: 0 }
    .text "0 Points"

rightpoints = Crafty.e "DOM, 2D, Text"
    .attr { x: 515, y: 20, w: 100, h: 20, points: 0 }
    .text "0 Points"

# Ball
ball = Crafty.e "2D, DOM, Color, Collision"
    .color 'rgb(0,0,255)'
    .attr {
        x: 300, y: 150, w:10, h:10,
        dX: Crafty.math.randomInt(2,5),
        dY: Crafty.math.randomInt(2,5) }
    .bind 'EnterFrame', ->
        if player is 1
            if @y <= 0 or @y >= 290
                @dY *= -1
                sendBall()
            if @x > 600
                @x = 300
                ++leftpoints.points
                leftpoints.text leftpoints.points+" Points"
                sendPoints()
            if @x < 10
                @x = 300
                ++rightpoints.points
                rightpoints.text rightpoints.points+" Points"
                sendPoints()
        if paused is off
            @x += @dX
            @y += @dY
    .onHit 'Paddle', ->
        if player is 1
            @dX *= -1
            sendBall()

# Utility Functions

sendBall = ->
    if player is 1
        socket.emit 'ball', {
            x: ball.x, y: ball.y, dX: ball.dX, dY: ball.dY
        }

writeInfo = ->
    board.innerHTML = (if player is 1 then "You" else
        (if p1conn then "Online P1" else "Nobody")) + " vs " +
        (if player is 2 then "You" else (if p2conn then "Online P2" else "Nobody"))
        + ", spectators: "+spectators

sendPoints = ->
    if player is 1
        socket.emit 'points', {
            left: leftpoints.points
            right: rightpoints.points
        }

# Connect

socket = io.connect()


# React to incoming events

socket.on "connection", ->
    console.log "Connected"

socket.on 'ball', (b) ->
    if player isnt 1
        ball.x = b.x; ball.y = b.y
        ball.dX = b.dX; ball.dY = b.dY

socket.on 'points', (data) ->
    if player isnt 1
        leftpoints.points = data.left
        rightpoints.points = data.right
        rightpoints.text rightpoints.points + " Points"
        leftpoints.text leftpoints.points + " Points"

socket.on 'reqpoints', ->
    sendPoints()

socket.on 'reqball', ->
    sendBall()

socket.on 'move1', (pos) ->
    if player isnt 1
        p1.y = pos

socket.on 'move2', (pos) ->
    if player isnt 2
        p2.y = pos

socket.on "players", (data) ->
    spectators = data.spectat
    p1conn = data.one; p2conn = data.two
    writeInfo()

socket.on "player", (num) ->
    if player is -1
        console.log "Player: "+num
        player = num
        p = null
        if player is 1
            p = p1; sendBall()
        else if player is 2
            p = p2
        if player is 1 or player is 2
            p.multiway 4, { UP_ARROW: -90, DOWN_ARROW: 90 }
            p.bind 'Move', ->
                socket.emit 'move', p.y
    else console.log 'WARNING: New player ID received??'

socket.on 'pause', (data) ->
    paused = data
    writeInfo()
    if data
        ball.x = 300; ball.y = 150
        p1.y = 100; p2.y = 100
        leftpoints.points = 0; rightpoints.points = 0
        leftpoints.text "0 Points" ; rightpoints.text "0 Points"
    console.log "Game is now " + if paused is true then "paused" else "resumed"
