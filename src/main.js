import './style.css';
import { applyLang, setLang, getLang } from './i18n.js';
import { applyTheme, toggleTheme } from './theme.js';
import { initUI } from './ui.js';
import { renderHistory } from './history.js';
import { initColorWidget, initTimestampWidget } from './widgets.js';

document.getElementById('langToggle').addEventListener('click', () => {
  setLang(getLang() === 'es' ? 'en' : 'es');
  renderHistory();
});

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

applyTheme();
applyLang();
initUI();
renderHistory();
initColorWidget();
initTimestampWidget();

// Three.js is ~500KB — load it as a separate chunk after the converter UI
// (the actual product) is interactive, so the hero animation never delays
// first paint or blocks the main thread on load.
const heroVisual = document.getElementById('heroVisual');
const heroStage = document.getElementById('heroStage');
if (heroVisual && heroStage) {
  const mountScene = () =>
    import('./scene/antigravity.js').then(({ initAntigravityScene }) => {
      // Track pointer moves on the whole stage (not just the canvas) so the
      // parallax still works while the cursor is over the dropzone on top.
      initAntigravityScene(heroVisual, heroStage);
    });
  if ('requestIdleCallback' in window) requestIdleCallback(mountScene, { timeout: 2000 });
  else setTimeout(mountScene, 200);
}
