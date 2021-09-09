import '../style.css';
import { loadSettings } from './settings';
import { initCanvas } from './canvas';
import initConnection from './transfer';
import initMenu from './menu';
import initToolbar from './toolbar';

const run = () => {
  loadSettings();
  initToolbar();
  initCanvas();
  initMenu();
  initConnection();
};

run();
