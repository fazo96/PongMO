# PongMO
Multiplayer Online pong web-app using node.js, express and socket.io on the
server side, and Crafty game engine on the client side.

I built this a very small project to learn dynamic web-app developement.

## Preparation
Clone this repo then in the root folder run `npm install`, then in the
`client` folder run `bower install`. This makes sure you have all the necessary
client and server dependences installed

If you made changes to the `<name>.coffee` files, please compile them
to `<name>.js`

Run the app on the server with `node app.js` then point your browser to the
machine's IP address/hostname on port `3000` (by default).

For example, if you want to run it on your *nix / Mac OS machine you can connect
to the local machine by navigating your browser to http://localhost:3000/

### Code quality
I'm not good yet with js and coffeescript and I realize things could be done
in better ways.

## Play
The first user that connects is the player 1, the second user is the player 2, the
rest are spectators and can't interact with the game. (spectator function is not
tested).

The game wasn't tested much but you should be able to play fine.

## License
MIT
