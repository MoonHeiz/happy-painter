import { SETTINGS } from './settings';
import {
  setPencilPosition, showPencil, hidePencil, showControls, hideControls,
} from './common';

const canvas = document.querySelector('canvas.draw');
const context = canvas.getContext('2d', { alpha: false });

const drawHistory = [];

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

const ghostDraw = ({ detail }) => {
  const { drawInfo } = detail;
  const {
    x0, y0, x1, y1, color, lineWidth,
  } = drawInfo;
  draw(x0, y0, x1, y1, color, lineWidth);

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
  pageX, pageY, clientX, clientY,
}) => {
  setPencilPosition(clientX, clientY);

  if (!isDrawing) return;

  clientDraw(currentPointerPosition.x, currentPointerPosition.y, pageX, pageY);
  currentPointerPosition.x = pageX;
  currentPointerPosition.y = pageY;
};

const drawStart = ({ pageX, pageY }) => {
  hideControls();
  isDrawing = true;
  currentPointerPosition.x = pageX;
  currentPointerPosition.y = pageY;
  changeDrawPosition({ pageX, pageY });
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

const enableCanvas = () => {
  showPencil();
  canvas.addEventListener('mousemove', changeDrawPosition);
  canvas.addEventListener('mouseup', drawStop);
  canvas.addEventListener('mousedown', drawStart);

  canvas.addEventListener('mouseleave', () => {
    drawStop();
    hidePencil();
  });
  canvas.addEventListener('mouseenter', showPencil);
};

const initCanvas = () => {
  fillCanvas();
  enableCanvas();
  document.addEventListener('ghost-draw', ghostDraw);
  document.addEventListener('clear-canvas', clearCanvas);
};

export { initCanvas, drawHistory };
