const server = require('http').createServer();
const io = require('socket.io')(server);

const game = require('./game/game');

io.on('connection', client => {
  client.on('event', data => {
    console.log('test');
  });
});

server.listen(3000);
