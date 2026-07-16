import './style.css';
import { applyLang, setLang, getLang } from './i18n.js';
import { applyTheme, toggleTheme } from './theme.js';
import { initUI } from './ui.js';
import { renderHistory } from './history.js';

document.getElementById('langToggle').addEventListener('click', () => {
  setLang(getLang() === 'es' ? 'en' : 'es');
  renderHistory();
});

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

applyTheme();
applyLang();
initUI();
renderHistory();

// Three.js is ~500KB — load it as a separate chunk after the converter UI
// (the actual product) is interactive, so the hero animation never delays
// first paint or blocks the main thread on load.
const heroVisual = document.getElementById('heroVisual');
if (heroVisual) {
  const mountScene = () =>
    import('./scene/antigravity.js').then(({ initAntigravityScene }) => {
      initAntigravityScene(heroVisual, { accent: 0x2dd4bf, accent2: 0xf59e0b });
    });
  if ('requestIdleCallback' in window) requestIdleCallback(mountScene, { timeout: 2000 });
  else setTimeout(mountScene, 200);
}
