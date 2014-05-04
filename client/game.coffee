paused = yes
player = -1
player1 = null; player2 = null
spectators = []; spectnum = 0
id = null
server = yes
idTo = window.location.hash[1..]

board = document.getElementById "board"
board.innerHTML = "Connecting to "+idTo
board.innerHTML = "Hosting game. Awaiting for ID" unless idTo isnt ""

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
        packet = {
            msg: 'ball', x: ball.x, y: ball.y, dX: ball.dX, dY: ball.dY
        }
        for p in spectators
            p.send packet
        if player2 isnt null
            player2.send packet

writeInfo = ->
    board.innerHTML = (if player is 1 then "You: #{id}" else
        (if player1 isnt null then "P1: #{idTo}" else "Nobody")) + " vs " +
        (if player is 2 then "You: #{id}" else (if player2 isnt null then "P2: #{idTo}" else "Nobody"))
        + ", spectators: " + if player is 1 then spectators.length else spectnum

sendPoints = ->
    if player is 1
        packet =
            msg: 'points'
            left: leftpoints.points
            right: rightpoints.points
        if player2 isnt null
            player2.send packet
        for p in spectators
            p.send packet

connectTo = (id) ->
    console.log "Trying connection to "+idTo
    server = off
    conn = peer.connect id
    conn.on 'close', ->
        console.log "Closed remote connection"
    conn.on 'data', (data) ->
        if data.msg is 'nope'
            # the peer has refused to player
            player = -1
            console.log 'Connection refused!'
            board.innerHTML = "Connection refused by remote player"
        # 'Ball' packet
        else if data.msg is 'ball'
            console.log "ball packet"
            ball.x = data.x; ball.y = data.y
            ball.dX = data.dX; ball.dY = data.dY
        # 'You' packet
        else if data.msg is 'you'
            player = data.you ; p = null
            console.log "Received info packet, I'm P"+player
            if player is 1
                p = p1
            else if player is p2
                 p = 2
            else p = null
            if p isnt null
                p.multiway 4, { UP_ARROW: -90, DOWN_ARROW: 90 }
                p.bind 'Move', ->
                    conn.send { msg: 'pos', pos: p.y }
        # 'Points' packet
        else if data.msg is 'points'
            leftpoints.points = data.left
            rightpoints.points = data.right
            rightpoints.text "#{rightpoints.points} Points"
            leftpoints.text "#{leftpoints.points} Points"
        # 'Pos' packet
        else if data.msg is 'pos'
            p1.y = data.pos
        # 'Status' packet
        else if data.msg is 'status'
            paused = data.paused
            spectnum = spectators.length
            writeInfo()
            if paused
                ball.x = 300; ball.y = 150
                leftpoints.points = 0
                rightpoints.points = 0
                rightpoints.text "0 Points"
                leftpoints.text "0 Points"
            console.log "Game is now " + if paused is true then "paused" else "resumed"

# Connect
peer = new Peer { key: 'c0ae8qi4pvp4aemi' }

peer.on "open", (data) ->
    id = data
    console.log "My ID is #{id}"
    if idTo is "" or idTo is null or idTo is undefined
        board.innerHTML = "Awaiting connections. ID: #{id}"
    else board.innerHTML = "ID: #{id} - Connecting to #{idTo}"

peer.on "error", (err) ->
    board.innerHTML = "Fatal connection error: "+err
    paused = yes
    peer.close()
peer.on "close", ->
    console.log "Closed peer"

# Incoming connection
peer.on 'connection', (conn) ->
    console.log player+" "+server
    if server is no or player isnt -1
        conn.send { msg: 'nope' }
        console.log 'Refused connection'
        conn.close(); return
    console.log "Incoming connection!"
    player = 1; player1 = -1;
    if player2 is null
        player2 = conn
        conn.send { msg: 'you', you: 2 }
        console.log 'Assigned player 2'
        p1.multiway 4, { UP_ARROW: -90, DOWN_ARROW: 90 }
        p1.bind 'Move', ->
            conn.send { msg: 'pos', pos: p1.y }
        paused = false ; console.log "Game started"
        writeInfo()
        conn.on 'data', (data) ->
            if data.msg is 'pos'
                p2.y = data.pos
    else
        spectators.push conn
        console.log 'Assigned spectator'
        conn.send { msg: 'you', you: 0 }
    for s in spectators
        s.send {
            msg: 'status'
            paused : paused
            p1: player1 isnt null
            p2: player2 isnt null
            spectators: spectators.length
        }

if idTo isnt undefined and idTo isnt "" and idTo isnt null
    connectTo idTo
