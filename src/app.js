const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');
const xxh = require('xxhashjs');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  fs.readFile(`${__dirname}/../client/index.html`, (err, data) => {
    if (err) {
      throw err;
    }
    response.writeHead(200);
    response.end(data);
  });
};

const app = http.createServer(onRequest);
const io = socketio(app);

app.listen(port);

io.on('connection', (sock) => {
  const socket = sock;
  socket.join('room1');

  socket.square = {
    hash: xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16),
    x: 0,
    y: 0,
    height: 200,
    width: 200,
  };

  socket.emit('joined', socket.square);

  socket.on('draw', (data) => {
    socket.square = {
      hash: data.hsh,
      x: data.x,
      y: data.y,
      height: data.height,
      width: data.width,
      imgData: data.imgData,
    };

    socket.broadcast.to('room1').emit('update', socket.square);
  });
});

console.log(`Listening on port: ${port}`);
