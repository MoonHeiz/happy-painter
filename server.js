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
  connectNotify: 'user-connected',
  disconnectNotify: 'user-disconnected',
};
const MESSAGE_TYPES = {
  error: 'error',
  success: 'success',
};

const prefixNames = ['Red', 'Blue', 'Green', 'Gold', 'GoldenRod', 'Gray', 'Grey', 'Green', 'Lime', 'Ivory'];

const animalNames = [
  'Fox',
  'Dinosaur',
  'Dog',
  'Alpaca',
  'Cat',
  'Baboon',
  'Bear',
  'Bee',
  'Boar',
  'Buffalo',
  'Butterfly',
  'Camel',
  'Chicken',
  'Cobra',
  'Crab',
  'Crocodile',
  'Deer',
  'Dolphin',
  'Duck',
  'Eagle',
  'Elephant',
  'Falcon',
  'Ferret',
  'Finch',
  'Fish',
  'Flamingo',
  'Goose',
  'Jaguar',
  'Koala',
  'Kudu',
  'Lark',
  'Lemur',
  'Leopard',
  'Lion',
  'Llama',
  'Mouse',
  'Mule',
  'Octopus',
  'Okapi',
  'Opossum',
  'Owl',
  'Panther',
  'Pelican',
  'Penguin',
  'Pony',
  'Porcupine',
  'Rabbit',
  'Salamander',
  'Scorpion',
  'Zebra',
];

const sendMessage = (socket, event, type, message) => {
  socket.emit(event, { type, message });
};

const notifyAboutConnection = (socket) => {
  const roomName = CONNECTED_USERS[socket.id];
  socket.to(roomName).emit(EVENTS.connectNotify, { connectedUser: ROOMS[roomName].users[socket.id] });
};

const notifyAboutDisconnect = (socket, username) => {
  const roomName = CONNECTED_USERS[socket.id];
  socket.to(roomName).emit(EVENTS.disconnectNotify, { disconnectedUser: username });
};

const disconnect = (socket) => {
  const roomName = CONNECTED_USERS[socket.id];

  if (Object.keys(ROOMS).length < 1 || !roomName) {
    return;
  } else if (Object.keys(ROOMS[roomName].users).length < 2) {
    delete ROOMS[roomName];
  } else {
    const username = ROOMS[roomName].users[socket.id];
    delete ROOMS[roomName].users[socket.id];
    notifyAboutDisconnect(socket, username);
    socket.leave(roomName);
  }

  delete CONNECTED_USERS[socket.id];
};

const connectUserToRoom = (socket, name) => {
  if (socket.rooms.size > 1) {
    disconnect(socket);
  }

  socket.join(name);
  CONNECTED_USERS[socket.id] = name;
  const totalUsersInRoom = Object.keys(ROOMS[name].users).length;
  const prefix = prefixNames[totalUsersInRoom % prefixNames.length];
  const postfix = animalNames[totalUsersInRoom % animalNames.length];
  const generatedName = `${prefix} ${postfix}`;
  ROOMS[name].users[socket.id] = generatedName;
};

const createRoom = (socket, name, password, drawHistory) => {
  if (ROOMS[name]) {
    sendMessage(socket, EVENTS.createRoom, MESSAGE_TYPES.error, 'Oh oh, it looks like such a room already exists😱');
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
    sendMessage(socket, EVENTS.joinRoom, MESSAGE_TYPES.error, 'It seems that such a room does not exist😰');
  } else if (ROOMS[name].password !== '' && ROOMS[name].password !== password) {
    sendMessage(socket, EVENTS.joinRoom, MESSAGE_TYPES.error, 'Oops, it looks like you entered the wrong password⛔');
  } else if (ROOMS[name].users[socket.id]) {
    sendMessage(socket, EVENTS.joinRoom, MESSAGE_TYPES.error, 'You are already in this room😐');
  } else {
    connectUserToRoom(socket, name);
    sendMessage(socket, EVENTS.joinRoom, MESSAGE_TYPES.success, 'You have successfully connected to the room✔️');
    sendMessage(socket, EVENTS.joinRoom, MESSAGE_TYPES.success, {
      drawHistory: ROOMS[name].drawHistory,
      connectedUsers: Object.values(ROOMS[name].users),
    });
    notifyAboutConnection(socket);
  }
};

const exchangeData = (socket, drawInfo) => {
  const roomName = CONNECTED_USERS[socket.id];
  const from = ROOMS[roomName].users[socket.id];
  ROOMS[roomName].drawHistory.push(drawInfo);
  socket.to(roomName).emit(EVENTS.sendData, {
    drawInfo,
    user: from,
  });
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
