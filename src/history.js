import { t } from './i18n.js';

const STORAGE_KEY = 'convertHistory';
const MAX_ENTRIES = 20;

export const categoryIcons = { image: '🖼', data: '📊', text: '📝', encode: '🔐', hash: '🔢' };

let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('justNow');
  if (mins < 60) return t('minAgo', mins);
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('hAgo', hrs);
  const days = Math.floor(hrs / 24);
  return t('dAgo', days);
}

export function addHistoryEntry(originalName, from, to, resultName, category) {
  history.unshift({
    name: originalName,
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    result: resultName,
    category,
    time: Date.now(),
  });
  if (history.length > MAX_ENTRIES) history.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  renderHistory();
}

export function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;

  if (!history.length) {
    list.innerHTML = `<div class="empty-history">${escapeHTML(t('emptyHistory'))}</div>`;
    return;
  }

  list.innerHTML = history
    .map(
      (h) => `
        <div class="history-item">
          <div class="history-item-icon">${categoryIcons[h.category] || '📄'}</div>
          <div class="history-item-info">
            <div class="history-item-name">${escapeHTML(h.name)} → ${escapeHTML(h.result)}</div>
            <div class="history-item-detail">${escapeHTML(h.from)} → ${escapeHTML(h.to)}</div>
          </div>
          <div class="history-item-time">${timeAgo(h.time)}</div>
        </div>`,
    )
    .join('');
}
