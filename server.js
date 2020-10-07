const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');
// PeerJS wraps the browser's WebRTC implementation to provide a complete, configurable, and easy-to-use peer-to-peer connection API
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

// set properties
app.set('view engine', 'ejs');

// script(s) and stylesheet
app.use(express.static('public'));

app.use('/peerjs', peerServer);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/create-room/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });

    socket.on('message', message => {
      // send message to the same room
      io.to(roomId).emit('createdMessage', message);
    });
  })
});


const PORT = process.env.PORT || 3310;
server.listen(PORT, () => console.log(`Server Started on ${PORT}`));
