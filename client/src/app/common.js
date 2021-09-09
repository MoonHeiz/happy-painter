const pencil = document.querySelector('.cursor');

const hidePencil = () => {
  pencil.classList.remove('cursor-show');
};

const showPencil = () => {
  pencil.classList.add('cursor-show');
};

const setPencilPosition = (posX, posY) => {
  pencil.style.left = `${posX}px`;
  pencil.style.top = `${posY - 30}px`;
};

const showControls = () => {
  document.documentElement.style.setProperty('--opacity-of-controls', '1');
  document.documentElement.style.setProperty('--pointer-events-of-controls', 'all');
};

const hideControls = () => {
  document.documentElement.style.setProperty('--opacity-of-controls', '0.2');
  document.documentElement.style.setProperty('--pointer-events-of-controls', 'none');
};

export {
  pencil, hidePencil, showPencil, setPencilPosition, showControls, hideControls,
};
