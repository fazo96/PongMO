# PongMO
Multiplayer Online pong web-app using node.js, express and socket.io on the
server side, and Crafty game engine on the client side.

I built this very small project to learn various things, like coffeescript and
socket.io and node.

## Preparation
Clone this repo then in the root folder run `npm install`, then in the
`client` folder run `bower install`. This makes sure you have all the necessary
client and server dependences installed. Of you course you need to install
**bower** and **npm** to do this.

If you change the source, remember to compile it using `cake build`. You need to
install `coffeescript` to to that. You can change the javascript directly of
course, it should be readable.

Run the app on the server with `node app.js` then point your browser to the
machine's IP address/hostname on port `3000` (by default).

## Play
The first user that connects is the player 1, the second user is the player 2, the
rest are spectators and can't interact with the game.

The game wasn't tested much but you should be able to play fine.

## License
MIT
