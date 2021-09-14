import { io } from 'socket.io-client';
import { drawHistory } from './canvas';
import { SETTINGS } from './settings';

const HOST = window.location.origin.replace(/^http/, 'ws');
const socket = io(HOST);

const connect = () => {
  console.log(`Connected with id: ${socket.id}`);
  const activateMenuEvent = new CustomEvent('activate-menu');
  document.dispatchEvent(activateMenuEvent);
};

const disconnect = () => {
  SETTINGS.isConnected = false;
  const deactivateMenuEvent = new CustomEvent('deactivate-menu');
  const removeConnectedUsers = new CustomEvent('remove-users');
  document.dispatchEvent(deactivateMenuEvent);
  document.dispatchEvent(removeConnectedUsers);
};

const sendRequestToCreateRoom = ({ detail }) => {
  const { roomName, roomPassword } = detail;
  socket.emit('create-room', { name: roomName, password: roomPassword, drawHistory });
};

const sendRequestToJoinRoom = ({ detail }) => {
  const { roomName, roomPassword } = detail;
  socket.emit('join-room', { name: roomName, password: roomPassword });
};

const anotherClientDraws = (drawInfo, user = null) => {
  const ghostDrawEvent = new CustomEvent('ghost-draw', {
    detail: {
      drawInfo,
      user,
    },
  });

  document.dispatchEvent(ghostDrawEvent);
};

const sendDrawInfo = ({ detail }) => {
  socket.emit('send-data', { drawInfo: detail.drawInfo });
};

const initCanvasEvents = () => {
  document.addEventListener('send-draw-info', sendDrawInfo);
};

const initMenuEvents = () => {
  document.addEventListener('create-room', sendRequestToCreateRoom);
  document.addEventListener('join-room', sendRequestToJoinRoom);
};

const showUserInfo = (message) => {
  const showInfoEvent = new CustomEvent('show-info', {
    detail: {
      message,
    },
  });
  document.dispatchEvent(showInfoEvent);
};

const createRoomHandler = ({ type, message }) => {
  if (type === 'success') {
    SETTINGS.isConnected = true;

    const removeConnectedUsers = new CustomEvent('remove-users');
    document.dispatchEvent(removeConnectedUsers);
  }

  showUserInfo(message);
};

const joinRoomHandler = ({ message, type }) => {
  if (typeof message === 'object' && type === 'success') {
    const { drawHistory: newDrawHistory, connectedUsers } = message;
    const clearCanvasEvent = new CustomEvent('clear-canvas');
    document.dispatchEvent(clearCanvasEvent);
    newDrawHistory.forEach((drawInfo) => anotherClientDraws(drawInfo));
    const updateConnectedUsers = new CustomEvent('update-users', { detail: { users: connectedUsers } });
    document.dispatchEvent(updateConnectedUsers);
    SETTINGS.isConnected = true;
  } else {
    showUserInfo(message);
  }
};

const connectedUserHandler = (connectedUser) => {
  const newUserEvent = new CustomEvent('add-user', {
    detail: {
      username: connectedUser,
    },
  });
  document.dispatchEvent(newUserEvent);
};

const disconnectedUserHandler = (disconnectedUser) => {
  const newUserEvent = new CustomEvent('remove-user', {
    detail: {
      username: disconnectedUser,
    },
  });
  document.dispatchEvent(newUserEvent);
};

const initConnection = () => {
  initCanvasEvents();
  initMenuEvents();

  socket.on('connect', connect);
  socket.on('disconnect', disconnect);
  socket.on('create-room', createRoomHandler);
  socket.on('join-room', joinRoomHandler);
  socket.on('user-connected', ({ connectedUser }) => connectedUserHandler(connectedUser));
  socket.on('user-disconnected', ({ disconnectedUser }) => disconnectedUserHandler(disconnectedUser));
  socket.on('receive-data', ({ drawInfo, user }) => anotherClientDraws(drawInfo, user));
};

export default initConnection;
