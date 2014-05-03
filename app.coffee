express = require 'express'
app = express()
server = require('http').createServer app
io = require('socket.io').listen server

app.use express.static('./client')

p1 = null; p2 = null
spectators = 0

sendPlayers = ->
    io.sockets.emit 'players', {
        one: p1 isnt null,
        two: p2 isnt null,
        spectat: spectators
    }

io.sockets.on 'connection', (socket) ->
    console.log 'Connection incoming'
    if p1 is null
        p1 = socket
        socket.emit 'player', 1
        socket.on 'ball', (data) ->
            io.sockets.emit 'ball', data
        socket.on 'points', (data) ->
            io.sockets.emit 'points', data
    else if p2 is null
        p2 = socket
        socket.emit 'player', 2
    else
        socket.emit 'player', 0
        spectators++
        p1.emit 'reqpoints'; p1.emit 'reqball'

    if p1 isnt null and p2 isnt null
        io.sockets.emit 'pause', false

    sendPlayers()

    socket.on 'disconnect', ->
        if socket is p1
            p1 = null
        else if socket is p2
            p2 = null
        else
            spectators--
        sendPlayers()

    socket.on 'move', (pos) ->
        if socket is p1 or socket is p2
            io.sockets.emit (if socket is p1 then'move1' else 'move2'), pos

server.listen process.env.PORT or 3000
