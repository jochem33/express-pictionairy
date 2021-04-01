const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/frontend/index.html');
});

app.get('/main.js', (req, res) => {
    res.sendFile(__dirname + '/frontend/main.js');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('message', (msg) => {
        console.log('message: ' + msg);
      });

      socket.on('buttonDown', (button, x, y) => {
        console.log('message: ' + button + ", " + x + ", " + y);
      });
  });

http.listen(3000, () => {
    console.log('listening on *:3000');
});