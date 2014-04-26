# PongMO
Multiplayer Online pong web-app using node.js, express and socket.io on the
server side, and Crafty game engine on the client side.

I built this a very small project to learn dynamic web-app developement.

## Preparation
Clone this repo then in the root folder run `npm install`, then in the
`client` folder run `bower install`. This makes sure you have all the necessary
client and server dependences installed

Run the app on the server with `node app.js` then point your browser to the
machine's IP address/hostname on port `3000` (by default).

For example, if you want to run it on your *nix / Mac OS machine you can connect
to the local machine by navigating your browser to http://localhost:3000/

### Code quality
I'm not good yet with javascript and i realize the code is horrible.

## Play
The first user that connects is the player 1, the second user is the player 2, the
rest are spectators and can't interact with the game. (spectator function is not
tested).

The game is **very buggy and incomplete** at the moment but you should be able
to play fine. When you disconnect, you **must restart the server** because the
game doesn't handle disconnection yet. (Very early developement!)

## License
MIT
