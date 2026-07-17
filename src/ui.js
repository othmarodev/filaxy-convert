import { t, getLang } from './i18n.js';
import { addHistoryEntry } from './history.js';
import { convertImage } from './converters/image.js';
import { parseStructured, stringifyStructured, xlsxToRows, rowsToXlsxBuffer } from './converters/data.js';
import { convertText } from './converters/text.js';
import { convertEncoding, decodeJWT } from './converters/encode.js';
import { computeHash } from './converters/hash.js';

export const formats = {
  image: {
    from: ['png', 'jpeg', 'jpg', 'webp', 'gif', 'bmp'],
    to: ['png', 'jpeg', 'webp', 'bmp', 'ico'],
  },
  data: {
    from: ['json', 'csv', 'xml', 'yaml', 'toml', 'xlsx'],
    to: ['json', 'csv', 'xml', 'yaml', 'toml', 'xlsx'],
  },
  text: {
    from: ['txt', 'html', 'md', 'rtf'],
    to: ['txt', 'html', 'md', 'rtf'],
  },
  encode: {
    // 'jwt' is decode-only — it's handled as a special case, forced to 'json'.
    from: ['base64', 'url', 'hex', 'jwt'],
    to: ['base64', 'url', 'hex'],
  },
  hash: {
    // Hashing doesn't care about the source format, so there's nothing to
    // pick — the "from" selector is hidden for this category (see setCategory).
    from: ['file'],
    to: ['md5', 'sha1', 'sha256', 'sha384', 'sha512'],
  },
};

const FILE_ICONS = {
  png: '🖼', jpeg: '🖼', jpg: '🖼', webp: '🖼', gif: '🖼', bmp: '🖼', ico: '🖼',
  json: '📋', csv: '📊', xml: '📰', yaml: '📰', yml: '📰', toml: '📰', xlsx: '📗',
  txt: '📝', html: '🌐', htm: '🌐', md: '📝', rtf: '📝',
  base64: '🔐', url: '🔗', hex: '#️⃣', jwt: '🔑',
};

const IMAGE_TYPES = new Set(['png', 'jpeg', 'jpg', 'webp', 'gif', 'bmp', 'ico']);
const BINARY_PREVIEW_TYPES = new Set(['xlsx']);

let currentCategory = 'image';
let selectedFile = null;
let resultBlob = null;
let resultFileName = '';

const $ = (id) => document.getElementById(id);

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function getExt(name) {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function initUI() {
  const dropzone = $('dropzone');
  const fileInput = $('fileInput');
  const fileInfo = $('fileInfo');
  const fileNameEl = $('fileName');
  const fileSizeEl = $('fileSize');
  const fileInfoIcon = $('fileInfoIcon');
  const fileRemove = $('fileRemove');
  const fromFormatGroup = $('fromFormatGroup');
  const fromFormat = $('fromFormat');
  const toFormat = $('toFormat');
  const toFormatLabel = $('toFormatLabel');
  const convertBtn = $('convertBtn');
  const statusMsg = $('statusMsg');
  const resultCard = $('resultCard');
  const resultPreview = $('resultPreview');
  const downloadBtn = $('downloadBtn');
  const copyBtn = $('copyBtn');
  const newConvertBtn = $('newConvertBtn');
  const swapBtn = $('swapBtn');
  const imageOptions = $('imageOptions');

  function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = 'status-msg visible ' + type;
    setTimeout(() => {
      statusMsg.className = 'status-msg';
    }, 4000);
  }

  function updateConvertBtn() {
    convertBtn.disabled = !selectedFile || fromFormat.value === toFormat.value;
  }

  function populateToFormat() {
    const cfg = formats[currentCategory];
    const fromVal = fromFormat.value;
    const isJwt = currentCategory === 'encode' && fromVal === 'jwt';
    const options = isJwt ? ['json'] : cfg.to.filter((f) => f !== fromVal);
    toFormat.innerHTML = options.map((f) => `<option value="${f}">${f.toUpperCase()}</option>`).join('');
  }

  function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.cat === cat));

    const cfg = formats[cat];
    fromFormat.innerHTML = cfg.from.map((f) => `<option value="${f}">${f.toUpperCase()}</option>`).join('');

    if (selectedFile) {
      const fileExt = getExt(selectedFile.name);
      if (cfg.from.includes(fileExt)) fromFormat.value = fileExt;
    }
    populateToFormat();

    imageOptions.style.display = cat === 'image' ? 'flex' : 'none';

    const isHash = cat === 'hash';
    fromFormatGroup.style.display = isHash ? 'none' : '';
    swapBtn.style.display = isHash ? 'none' : '';
    toFormatLabel.dataset.i18n = isHash ? 'algorithm' : 'toFormat';
    toFormatLabel.textContent = t(toFormatLabel.dataset.i18n);

    updateConvertBtn();
  }

  function handleFile(file) {
    selectedFile = file;
    const ext = getExt(file.name);

    fileInfoIcon.textContent = FILE_ICONS[ext] || '📄';
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatSize(file.size);
    fileInfo.classList.add('visible');
    dropzone.classList.add('has-file');

    for (const [cat, cfg] of Object.entries(formats)) {
      if (cfg.from.includes(ext)) {
        setCategory(cat);
        break;
      }
    }

    updateConvertBtn();
  }

  function showResult(blob, type) {
    resultPreview.innerHTML = '';

    if (IMAGE_TYPES.has(type)) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(blob);
      img.style.maxWidth = '100%';
      resultPreview.appendChild(img);
      copyBtn.style.display = 'none';
    } else if (BINARY_PREVIEW_TYPES.has(type)) {
      const note = document.createElement('div');
      note.textContent = t('binaryPreviewNote');
      resultPreview.appendChild(note);
      copyBtn.style.display = 'none';
    } else {
      copyBtn.style.display = '';
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.createElement('div');
        preview.textContent = e.target.result;
        resultPreview.appendChild(preview);
      };
      reader.readAsText(blob);
    }

    resultCard.classList.add('visible');
    showStatus(t('statusDone'), 'success');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // File handling
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
  });

  fileRemove.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.classList.remove('visible');
    dropzone.classList.remove('has-file');
    resultCard.classList.remove('visible');
    updateConvertBtn();
  });

  document.querySelectorAll('.cat-tab').forEach((tab) => {
    tab.addEventListener('click', () => setCategory(tab.dataset.cat));
  });

  swapBtn.addEventListener('click', () => {
    const tmp = fromFormat.value;
    fromFormat.value = toFormat.value;
    toFormat.value = tmp;
    updateConvertBtn();
  });

  fromFormat.addEventListener('change', () => {
    populateToFormat();
    updateConvertBtn();
  });
  toFormat.addEventListener('change', updateConvertBtn);

  convertBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    convertBtn.classList.add('loading');
    convertBtn.disabled = true;

    try {
      const from = fromFormat.value;
      const to = toFormat.value;
      const cat = currentCategory;
      const baseName = selectedFile.name.replace(/\.[^.]+$/, '');
      let historyFrom = from;

      if (cat === 'image') {
        const blob = await convertImage(
          selectedFile,
          to,
          {
            width: parseInt($('widthInput').value) || null,
            height: parseInt($('heightInput').value) || null,
            quality: parseInt($('qualityInput').value) || 92,
          },
          t('errImageCreate'),
          t('errImageLoad'),
        );
        resultBlob = blob;
        resultFileName = baseName + '.' + (to === 'jpg' ? 'jpeg' : to);
        showResult(blob, to);
      } else if (cat === 'data') {
        let data;
        try {
          data = from === 'xlsx' ? await xlsxToRows(await selectedFile.arrayBuffer()) : parseStructured(from, await selectedFile.text());
        } catch (e) {
          throw new Error(t('statusParseError', from.toUpperCase()) + e.message);
        }

        if (to === 'xlsx') {
          resultBlob = new Blob([await rowsToXlsxBuffer(data)], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
        } else {
          resultBlob = new Blob([stringifyStructured(to, data)], { type: 'text/plain;charset=utf-8' });
        }
        resultFileName = baseName + '.' + to;
        showResult(resultBlob, to);
      } else if (cat === 'text') {
        const text = await selectedFile.text();
        const result = convertText(from, to, text);
        resultBlob = new Blob([result], { type: 'text/plain;charset=utf-8' });
        resultFileName = baseName + '.' + to;
        showResult(resultBlob, to);
      } else if (cat === 'encode') {
        const text = await selectedFile.text();
        let result;
        if (from === 'jwt') {
          try {
            result = decodeJWT(text);
          } catch (e) {
            throw new Error(t('statusParseError', 'JWT') + e.message);
          }
        } else {
          result = convertEncoding(from, to, text);
        }
        resultBlob = new Blob([result], { type: 'text/plain;charset=utf-8' });
        resultFileName = baseName + '.' + to;
        showResult(resultBlob, to);
      } else if (cat === 'hash') {
        const bytes = new Uint8Array(await selectedFile.arrayBuffer());
        const hex = await computeHash(to, bytes);
        resultBlob = new Blob([hex], { type: 'text/plain;charset=utf-8' });
        resultFileName = baseName + '.' + to;
        showResult(resultBlob, to);
        historyFrom = getExt(selectedFile.name).toUpperCase() || 'FILE';
      }

      addHistoryEntry(selectedFile.name, historyFrom, to, resultFileName, cat);
    } catch (err) {
      showStatus(t('statusError') + err.message, 'error');
      console.error(err);
    }

    convertBtn.classList.remove('loading');
    updateConvertBtn();
  });

  downloadBtn.addEventListener('click', () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resultFileName;
    a.click();
    URL.revokeObjectURL(url);
  });

  copyBtn.addEventListener('click', async () => {
    if (!resultBlob) return;
    try {
      const text = await resultBlob.text();
      await navigator.clipboard.writeText(text);
      showStatus(t('statusCopied'), 'success');
    } catch {
      showStatus(t('statusCopyFailed'), 'error');
    }
  });

  newConvertBtn.addEventListener('click', () => {
    resultCard.classList.remove('visible');
    resultBlob = null;
    resultFileName = '';
    fileRemove.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  setCategory('image');
}

export { escapeHTML, getLang };
