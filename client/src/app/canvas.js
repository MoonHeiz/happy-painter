import { SETTINGS } from './settings';
import {
  setPencilPosition, showPencil, hidePencil, showControls, hideControls,
} from './common';

const canvasWrapper = document.querySelector('.draw');
const canvas = document.querySelector('canvas.draw-content');
const context = canvas.getContext('2d', { alpha: false });

const drawHistory = [];
const connectedUsers = {};

const currentPointerPosition = {
  x: -999,
  y: -999,
};

let isDrawing = false;

const draw = (x0, y0, x1, y1, color, lineWidth) => {
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = SETTINGS.lineCap;
  context.lineJoin = SETTINGS.lineJoin;
  context.stroke();
  context.closePath();
};

const changeGhostCursorPosition = (user, x, y) => {
  if (user) {
    connectedUsers[user].style.left = `${x}px`;
    connectedUsers[user].style.top = `${y}px`;
  }
};

const ghostDraw = ({ detail }) => {
  const { drawInfo, user } = detail;
  const {
    x0, y0, x1, y1, color, lineWidth,
  } = drawInfo;
  draw(x0, y0, x1, y1, color, lineWidth);
  changeGhostCursorPosition(user, x1, y1);
  drawHistory.push(drawInfo);
};

const saveDrawPositions = (x0, y0, x1, y1, color, lineWidth) => {
  const drawPositions = {
    x0,
    y0,
    x1,
    y1,
    color,
    lineWidth,
    lineCap: SETTINGS.lineCap,
    lineJoin: SETTINGS.lineJoin,
  };
  drawHistory.push(drawPositions);

  if (SETTINGS.isConnected) {
    const sendDataEvent = new CustomEvent('send-draw-info', {
      detail: {
        drawInfo: drawPositions,
      },
    });
    document.dispatchEvent(sendDataEvent);
  }
};

const clientDraw = (x0, y0, x1, y1) => {
  draw(x0, y0, x1, y1, SETTINGS.color, SETTINGS.lineWidth);
  saveDrawPositions(x0, y0, x1, y1, SETTINGS.color, SETTINGS.lineWidth);
};

const changeDrawPosition = ({
  offsetX, offsetY, clientX, clientY,
}) => {
  setPencilPosition(clientX, clientY);

  if (!isDrawing) return;

  clientDraw(currentPointerPosition.x, currentPointerPosition.y, offsetX, offsetY);
  currentPointerPosition.x = offsetX;
  currentPointerPosition.y = offsetY;
};

const drawStart = ({
  offsetX, offsetY, clientX, clientY,
}) => {
  hideControls();
  isDrawing = true;
  currentPointerPosition.x = offsetX;
  currentPointerPosition.y = offsetY;
  changeDrawPosition({
    offsetX,
    offsetY,
    clientX,
    clientY,
  });
};

const drawStop = () => {
  if (!isDrawing) return;

  showControls();
  isDrawing = false;
};

const fillCanvas = () => {
  context.fillStyle = SETTINGS.fillColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
};

const clearCanvas = () => {
  fillCanvas();
  drawHistory.length = 0;
};

const addUser = (username) => {
  connectedUsers[username] = document.createElement('div');
  connectedUsers[username].classList.add('ghost');
  connectedUsers[username].innerHTML = `<div class="cursor-image ghost-cursor-image"></div><span>${username}</span>`;
  canvasWrapper.append(connectedUsers[username]);
};

const removeUser = (username) => {
  connectedUsers[username].remove();
  delete connectedUsers[username];
};

const removeAllUsers = () => {
  const arrayOfUsers = Object.keys(connectedUsers);

  if (arrayOfUsers.length > 0) {
    for (let i = 0; i < arrayOfUsers.length; i += 1) {
      removeUser(arrayOfUsers[i]);
    }
  }
};

const updateUsers = ({ detail }) => {
  removeAllUsers();
  const { users } = detail;
  for (let i = 0; i < users.length - 1; i += 1) {
    if (!connectedUsers[users[i]]) {
      addUser(users[i]);
    }
  }
};

const enableCanvas = () => {
  showPencil();
  canvas.addEventListener('pointermove', changeDrawPosition);
  canvas.addEventListener('pointerup', drawStop);
  canvas.addEventListener('pointerdown', drawStart);

  canvas.addEventListener('pointerleave', () => {
    drawStop();
    hidePencil();
  });
  canvas.addEventListener('pointerenter', showPencil);
};

const initCanvas = () => {
  fillCanvas();
  enableCanvas();
  document.addEventListener('ghost-draw', ghostDraw);
  document.addEventListener('clear-canvas', clearCanvas);
  document.addEventListener('update-users', updateUsers);
  document.addEventListener('add-user', ({ detail }) => addUser(detail.username));
  document.addEventListener('remove-user', ({ detail }) => removeUser(detail.username));
  document.addEventListener('remove-users', removeAllUsers);
};

export { initCanvas, drawHistory };
