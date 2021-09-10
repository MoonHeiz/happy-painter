import { hideControls, showControls } from './common';

const createRoomButton = document.querySelector('.room-create');
const joinRoomButton = document.querySelector('.room-join');

const popUp = {
  wrapper: null,
  form: null,
  title: null,
  labels: {
    roomName: null,
    roomPassword: null,
  },
  fields: {
    roomName: null,
    roomPassword: null,
  },
  info: null,
  submit: null,
  activeCallback: null,
};

const setupPopUp = () => {
  popUp.wrapper.classList.add('pop-up');
  popUp.form.classList.add('pop-up-form');
  popUp.title.classList.add('pop-up-title');

  popUp.labels.roomName.classList.add('pop-up-label');
  popUp.labels.roomName.htmlFor = 'name';
  popUp.labels.roomName.innerText = 'room name';
  popUp.labels.roomPassword.classList.add('pop-up-label');
  popUp.labels.roomPassword.htmlFor = 'password';
  popUp.labels.roomPassword.innerText = 'room password';

  popUp.fields.roomName.classList.add('pop-up-field');
  popUp.fields.roomName.type = 'text';
  popUp.fields.roomName.id = 'name';
  popUp.fields.roomName.minLength = '3';
  popUp.fields.roomName.required = true;
  popUp.fields.roomPassword.classList.add('pop-up-field');
  popUp.fields.roomPassword.type = 'text';
  popUp.fields.roomPassword.id = 'password';
  popUp.fields.roomPassword.placeholder = '(optional)';

  popUp.submit.classList.add('btn', 'btn-strech', 'btn-margin-bottom');
  popUp.submit.type = 'submit';

  popUp.info.classList.add('pop-up-info');
};

const createPopUp = () => {
  popUp.wrapper = document.createElement('div');
  popUp.form = document.createElement('form');
  popUp.title = document.createElement('h2');
  popUp.labels.roomName = document.createElement('label');
  popUp.labels.roomPassword = document.createElement('label');
  popUp.fields.roomName = document.createElement('input');
  popUp.fields.roomPassword = document.createElement('input');
  popUp.info = document.createElement('p');
  popUp.submit = document.createElement('input');

  popUp.wrapper.append(popUp.form);
  popUp.form.append(popUp.title);
  popUp.form.append(popUp.labels.roomName);
  popUp.form.append(popUp.fields.roomName);
  popUp.form.append(popUp.labels.roomPassword);
  popUp.form.append(popUp.fields.roomPassword);
  popUp.form.append(popUp.info);
  popUp.form.append(popUp.submit);
};

const closePopUp = ({ target, key }) => {
  if (target.classList.contains('pop-up') || key === 'Escape') {
    popUp.wrapper.removeEventListener('click', closePopUp);
    window.removeEventListener('keydown', closePopUp);
    popUp.form.removeEventListener('submit', popUp.activeCallback);
    popUp.wrapper.remove();
    popUp.info.innerText = '';
    showControls();
  }
};

const setPopUpHandlers = () => {
  popUp.wrapper.addEventListener('click', closePopUp);
  window.addEventListener('keydown', closePopUp);
  popUp.form.addEventListener('submit', popUp.activeCallback);
};

const showPopUp = (popUpTitle, popUpSubmitText, callback) => {
  if (!popUp.wrapper) {
    createPopUp();
    setupPopUp();
  }

  popUp.title.innerText = popUpTitle;
  popUp.submit.value = popUpSubmitText;
  popUp.activeCallback = callback;
  document.body.append(popUp.wrapper);
  hideControls();
  setPopUpHandlers();
};

const handleSubmit = (e) => {
  e.preventDefault();
  const formElements = e.target.elements;
  const roomName = formElements.name.value;
  const roomPassword = formElements.password.value;

  if (roomName.length < 3) {
    return { roomName: '', roomPassword };
  }

  return { roomName, roomPassword };
};

const sendRequestToCreateRoom = (e) => {
  const { roomName, roomPassword } = handleSubmit(e);
  const sendCreateRoomEvent = new CustomEvent('create-room', {
    detail: {
      roomName,
      roomPassword,
    },
  });

  document.dispatchEvent(sendCreateRoomEvent);
};

const sendRequestToJoin = (e) => {
  const { roomName, roomPassword } = handleSubmit(e);
  const sendJoinRoomEvent = new CustomEvent('join-room', {
    detail: {
      roomName,
      roomPassword,
    },
  });

  document.dispatchEvent(sendJoinRoomEvent);
};

const showCreateRoom = () => {
  showPopUp('Create room', 'create', sendRequestToCreateRoom);
};

const showJoinRoom = () => {
  showPopUp('Join room', 'join', sendRequestToJoin);
};

const activateMenu = () => {
  createRoomButton.disabled = false;
  joinRoomButton.disabled = false;
  createRoomButton.addEventListener('click', showCreateRoom);
  joinRoomButton.addEventListener('click', showJoinRoom);
};

const deactivateMenu = () => {
  createRoomButton.disabled = true;
  joinRoomButton.disabled = true;
  createRoomButton.removeEventListener('click', showCreateRoom);
  joinRoomButton.removeEventListener('click', showJoinRoom);
};

const showInfo = ({ detail }) => {
  const { message } = detail;
  popUp.info.innerText = message;
};

const initMenu = () => {
  document.addEventListener('activate-menu', activateMenu);
  document.addEventListener('deactivate-menu', deactivateMenu);
  document.addEventListener('show-info', showInfo);
};

export default initMenu;
