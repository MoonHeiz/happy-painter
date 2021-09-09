const DEFAULT_SETTINGS = {
  fillColor: '#ffffff',
  color: '#f44336',
  lineWidth: 5,
  lineCap: 'round',
  lineJoin: 'round',
  isConnected: false,
  port: 3000,
};

const SETTINGS = {
  ...DEFAULT_SETTINGS,
};

const loadSettings = () => {
  SETTINGS.color = localStorage.getItem('color') || DEFAULT_SETTINGS.color;
  SETTINGS.lineWidth = localStorage.getItem('lineWidth') || DEFAULT_SETTINGS.lineWidth;
};

const saveColor = (color) => {
  SETTINGS.color = color;
  localStorage.setItem('color', color);
};

const saveLineWidth = (width) => {
  SETTINGS.lineWidth = width;
  localStorage.setItem('lineWidth', width);
};

export {
  SETTINGS, DEFAULT_SETTINGS, loadSettings, saveColor, saveLineWidth,
};
