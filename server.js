const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static(path.resolve(__dirname, 'client', 'dist')));
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

const ROOMS = {};
const CONNECTED_USERS = {};

const EVENTS = {
  joinRoom: 'join-room',
  createRoom: 'create-room',
  disconnect: 'disconnect',
  exchangeData: 'send-data',
  sendData: 'receive-data',
};
const MESSAGE_TYPES = {
  error: 'error',
  success: 'success',
};

const sendMessage = (socket, event, type, message) => {
  socket.emit(event, { type, message });
};

const disconnect = (socket) => {
  const roomName = CONNECTED_USERS[socket.id];

  if (Object.keys(ROOMS).length < 1 || !roomName) {
    return;
  } else if (Object.keys(ROOMS[roomName].users).length < 2) {
    delete ROOMS[roomName];
    console.log(`Nobody in room ${roomName} removing it`);
  } else {
    delete ROOMS[roomName].users[socket.id];
    console.log(`User ${socket.id} was leave from room ${roomName}`);
  }

  delete CONNECTED_USERS[socket.id];
};

const connectUserToRoom = (socket, name) => {
  if (CONNECTED_USERS[socket.id]) {
    disconnect(socket);
  }

  socket.join(name);
  CONNECTED_USERS[socket.id] = name;
  ROOMS[name].users[socket.id] = true;
};

const createRoom = (socket, name, password, drawHistory) => {
  if (ROOMS[name]) {
    sendMessage(socket, EVENTS.createRoom, MESSAGE_TYPES.error, 'Oh oh, it looks like such a room already exists');
  } else {
    ROOMS[name] = {
      password: password || '',
      users: {},
      drawHistory: drawHistory,
    };

    connectUserToRoom(socket, name);
    sendMessage(
      socket,
      EVENTS.createRoom,
      MESSAGE_TYPES.success,
      'Congratulations✨ your room has been successfully created!'
    );
  }
};

const joinRoom = (socket, name, password) => {
  if (!ROOMS[name]) {
    sendMessage(socket, EVENTS.joinRoom, MESSAGE_TYPES.error, 'It seems that such a room does not exist');
  } else if (ROOMS[name].password !== '' && ROOMS[name].password !== password) {
    sendMessage(socket, EVENTS.joinRoom, MESSAGE_TYPES.error, 'Oops, it looks like you entered the wrong password⛔');
  } else if (ROOMS[name].users[socket.id]) {
    sendMessage(socket, EVENTS.joinRoom, MESSAGE_TYPES.error, 'You are already in this room😐');
  } else {
    connectUserToRoom(socket, name);
    console.log(`USER ${socket.id} was connected to -> ${name}`);
    sendMessage(socket, EVENTS.joinRoom, MESSAGE_TYPES.success, 'You have successfully connected to the room✔️');
    sendMessage(socket, EVENTS.joinRoom, MESSAGE_TYPES.success, { drawHistory: ROOMS[name].drawHistory });
  }
};

const exchangeData = (socket, drawInfo) => {
  const roomName = CONNECTED_USERS[socket.id];
  ROOMS[roomName].drawHistory.push(drawInfo);
  const users = Object.keys(ROOMS[roomName].users);
  for (let i = 0; i < users.length; i += 1) {
    socket.to(roomName).emit(EVENTS.sendData, {
      drawInfo,
    });
  }
};

const handleConnection = (socket) => {
  socket.on(EVENTS.createRoom, ({ name, password, drawHistory }) => createRoom(socket, name, password, drawHistory));
  socket.on(EVENTS.joinRoom, ({ name, password }) => joinRoom(socket, name, password));
  socket.on(EVENTS.disconnect, () => disconnect(socket));
  socket.on(EVENTS.exchangeData, ({ drawInfo }) => exchangeData(socket, drawInfo));
};

io.on('connection', handleConnection);

server.listen(PORT, () => {
  console.log(`listening on port:${PORT}`);
});
