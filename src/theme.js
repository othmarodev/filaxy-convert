let currentTheme = localStorage.getItem('filaxyConvertTheme') || 'dark';
const listeners = [];

export function getTheme() {
  return currentTheme;
}

export function onThemeChange(fn) {
  listeners.push(fn);
}

export function applyTheme() {
  document.documentElement.dataset.theme = currentTheme;
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  listeners.forEach((fn) => fn(currentTheme));
}

export function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('filaxyConvertTheme', currentTheme);
  applyTheme();
}
