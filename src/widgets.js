import { parseColor, formatRgb, formatHsl } from './converters/color.js';
import { timestampToLocalDatetime, localDatetimeToTimestamp } from './converters/timestamp.js';

const $ = (id) => document.getElementById(id);

function wireCopyButton(button, getValue) {
  if (!button) return;
  button.addEventListener('click', async () => {
    const value = getValue();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      const prev = button.textContent;
      button.textContent = '✓';
      setTimeout(() => {
        button.textContent = prev;
      }, 1200);
    } catch {
      // Clipboard permission can be denied silently — nothing useful to do here.
    }
  });
}

export function initColorWidget() {
  const input = $('colorInput');
  if (!input) return;

  const swatch = $('colorSwatch');
  const hexOut = $('colorHex');
  const rgbOut = $('colorRgb');
  const hslOut = $('colorHsl');

  function update() {
    const parsed = parseColor(input.value);
    if (!parsed) {
      swatch.style.background = 'transparent';
      hexOut.value = '';
      rgbOut.value = '';
      hslOut.value = '';
      return;
    }
    swatch.style.background = parsed.hex;
    hexOut.value = parsed.hex;
    rgbOut.value = formatRgb(parsed.rgb);
    hslOut.value = formatHsl(parsed.hsl);
  }

  input.addEventListener('input', update);
  wireCopyButton($('colorHexCopy'), () => hexOut.value);
  wireCopyButton($('colorRgbCopy'), () => rgbOut.value);
  wireCopyButton($('colorHslCopy'), () => hslOut.value);

  input.value = '#2dd4bf';
  update();
}

export function initTimestampWidget() {
  const tsInput = $('timestampInput');
  if (!tsInput) return;

  const dateInput = $('datetimeInput');
  const nowBtn = $('timestampNow');

  function fromTimestamp() {
    const seconds = Number(tsInput.value);
    if (!Number.isFinite(seconds)) return;
    const local = timestampToLocalDatetime(seconds);
    if (local) dateInput.value = local;
  }

  function fromDate() {
    const seconds = localDatetimeToTimestamp(dateInput.value);
    if (seconds !== null) tsInput.value = seconds;
  }

  tsInput.addEventListener('input', fromTimestamp);
  dateInput.addEventListener('input', fromDate);
  nowBtn.addEventListener('click', () => {
    tsInput.value = Math.floor(Date.now() / 1000);
    fromTimestamp();
  });

  tsInput.value = Math.floor(Date.now() / 1000);
  fromTimestamp();
}
