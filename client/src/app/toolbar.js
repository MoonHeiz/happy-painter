import { SETTINGS, saveColor, saveLineWidth } from './settings';

const colorList = document.querySelector('.color-list');
const customColor = document.querySelector('.custom-color');
const lineWidth = document.querySelector('.line-width-input');

const setColor = (color) => {
  const newColor = colorList.querySelector(`[data-color="${color}"]`);
  const prevColor = colorList.querySelector('.color-active');

  if (prevColor) {
    prevColor.classList.remove('color-active');
  }
  if (newColor) {
    newColor.parentElement.classList.add('color-active');
  } else {
    customColor.value = color;
    customColor.parentElement.classList.add('color-active');
  }

  saveColor(color);
};

const changeColor = ({ target }) => {
  if (target.classList.contains('color-cell')) {
    const selectedColor = target.getAttribute('data-color');
    setColor(selectedColor);
  }
};

const enableChangeColors = () => {
  setColor(SETTINGS.color);
  colorList.addEventListener('click', changeColor);
  customColor.addEventListener('input', ({ target }) => setColor(target.value));
  customColor.addEventListener('click', ({ target }) => setColor(target.value));
};

const changeLineWidth = () => {
  const width = Math.round(lineWidth.value / 10);
  saveLineWidth(width);
};

const enableChangeLineWidth = () => {
  lineWidth.value = SETTINGS.lineWidth * 10;
  lineWidth.addEventListener('input', changeLineWidth);
};

const initToolbar = () => {
  enableChangeColors();
  enableChangeLineWidth();
};

export default initToolbar;
