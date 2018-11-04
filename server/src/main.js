const http = require('http');
const socketIo = require('socket.io');
const express = require('express');


const app = express();
const server = http.Server(app);
const io = socketIo(server);

const { Game } = require('./Game');

const games = {};
const FindGame = (gameId) => {
  if (!games[gameId]) {
    games[gameId] = new Game();
  }

  return games[gameId];
};

io.on('connection', (client) => {
  client.on('joinGame', (data) => {
    const { username, gameId } = data;

    client.game = FindGame(gameId);
    client.game.AddPlayer(username, client);
  });
});

app.use('/', express.static('../frontend'));
server.listen(8000);