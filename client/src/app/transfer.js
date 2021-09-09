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
  document.dispatchEvent(deactivateMenuEvent);
};

const createRoom = ({ detail }) => {
  const { roomName, roomPassword } = detail;
  socket.emit('create-room', { name: roomName, password: roomPassword, drawHistory });
};

const joinRoom = ({ detail }) => {
  const { roomName, roomPassword } = detail;
  socket.emit('join-room', { name: roomName, password: roomPassword });
};

const anotherClientDraws = (drawInfo) => {
  const ghostDrawEvent = new CustomEvent('ghost-draw', {
    detail: {
      drawInfo,
      user: 'drawInfo.user',
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
  document.addEventListener('create-room', createRoom);
  document.addEventListener('join-room', joinRoom);
};

const createRoomHandler = ({ type }) => {
  if (type === 'success') {
    SETTINGS.isConnected = true;
  }
};

const joinRoomHandler = ({ type, message }) => {
  if (type === 'success') {
    if (typeof message === 'object') {
      const { drawHistory: newDrawHistory } = message;
      const clearCanvasEvent = new CustomEvent('clear-canvas');
      document.dispatchEvent(clearCanvasEvent);

      newDrawHistory.forEach((drawInfo) => anotherClientDraws(drawInfo));
      SETTINGS.isConnected = true;
    }
  }
};

const initConnection = () => {
  initCanvasEvents();
  initMenuEvents();

  socket.on('connect', connect);
  socket.on('disconnect', disconnect);
  socket.on('create-room', createRoomHandler);
  socket.on('join-room', joinRoomHandler);
  socket.on('receive-data', ({ drawInfo }) => anotherClientDraws(drawInfo));
};

export default initConnection;
