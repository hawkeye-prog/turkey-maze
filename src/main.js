import './style.css'
import { Game } from './game/Game.js'

window.onerror = function (message, source, lineno, colno, error) {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.top = '0';
  div.style.left = '0';
  div.style.width = '100%';
  div.style.backgroundColor = 'red';
  div.style.color = 'white';
  div.style.padding = '20px';
  div.style.zIndex = '9999';
  div.innerText = `Error: ${message}\nSource: ${source}:${lineno}:${colno}\nStack: ${error ? error.stack : 'N/A'}`;
  document.body.appendChild(div);
};

window.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new Game();
  } catch (e) {
    console.error(e);
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '50px';
    div.style.left = '0';
    div.style.color = 'red';
    div.style.zIndex = '9999';
    div.innerText = `Init Error: ${e.message}\n${e.stack}`;
    document.body.appendChild(div);
  }
});
