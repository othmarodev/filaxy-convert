export const translations = {
  es: {
    pageTitle: 'Filaxy Convert™ — Conversor de Archivos Gratis',
    pageDesc: 'Convierte archivos entre formatos directo en tu navegador. Sin subidas, sin servidor, 100% privado.',
    badge: 'Nuevo · 100% en tu navegador',
    heroTitle: 'Convierte cualquier archivo, al instante',
    tagline: 'Sin subidas, sin servidor, sin límites. Tus archivos nunca salen de tu dispositivo.',
    formatsLink: 'Ver todos los formatos compatibles ↓',
    dropzoneStrong: 'Haz clic para elegir',
    dropzoneRest: 'o arrastra un archivo aquí',
    remove: 'Eliminar',
    formats: 'Formatos',
    catImage: 'Imágenes',
    catData: 'Datos',
    catText: 'Texto',
    catEncode: 'Codificación',
    catHash: 'Hash',
    catUtilities: 'Utilidades',
    fromFormat: 'Desde Formato',
    toFormat: 'A Formato',
    algorithm: 'Algoritmo',
    swap: 'Intercambiar',
    quality: 'Calidad:',
    width: 'Ancho:',
    height: 'Alto:',
    auto: 'auto',
    convert: 'Convertir',
    result: 'Resultado',
    download: 'Descargar Archivo',
    copy: 'Copiar',
    newConversion: 'Nueva Conversión',
    supportedFormats: 'Formatos Compatibles',
    descImage: 'Convierte entre formatos gráficos populares',
    descData: 'Transforma estructuras de datos',
    descText: 'Formatos de texto y marcado',
    descEncode: 'Codifica y decodifica',
    descHash: 'Huellas digitales de archivos',
    descUtilities: 'Herramientas instantáneas, sin archivo',
    binaryPreviewNote: '📗 Archivo binario listo — descárgalo para verlo.',
    quickUtilities: 'Utilidades Rápidas',
    colorConverter: 'Color',
    colorPlaceholder: '#2dd4bf, rgb(...), hsl(...)',
    timestampConverter: 'Unix Timestamp',
    now: 'Ahora',
    history: 'Historial de Conversiones',
    emptyHistory: 'Aún no hay conversiones',
    footer: 'Filaxy Convert™ — todas las conversiones se ejecutan localmente en tu navegador. Los archivos nunca se suben a ningún servidor.',
    statusDone: '✅ ¡Conversión completa!',
    statusError: '❌ Error: ',
    statusParseError: (n) => `Error al analizar ${n}: `,
    statusCopied: '📋 Copiado al portapapeles',
    statusCopyFailed: '❌ No se pudo copiar',
    errImageCreate: 'No se pudo crear la imagen',
    errImageLoad: 'No se pudo cargar la imagen',
    justNow: 'justo ahora',
    minAgo: (n) => `hace ${n} min`,
    hAgo: (n) => `hace ${n} h`,
    dAgo: (n) => `hace ${n} d`,
    statAllLocal: '100% local',
    statFormats: '27 formatos',
    statZeroUpload: '0 subidas',
  },
  en: {
    pageTitle: 'Filaxy Convert™ — Free File Converter',
    pageDesc: 'Convert files between formats right in your browser. No uploads, no server, 100% private.',
    badge: 'New · 100% in your browser',
    heroTitle: 'Convert any file, instantly',
    tagline: 'No uploads, no server, no limits. Your files never leave your device.',
    formatsLink: 'See all supported formats ↓',
    dropzoneStrong: 'Click to choose',
    dropzoneRest: 'or drag a file here',
    remove: 'Remove',
    formats: 'Formats',
    catImage: 'Images',
    catData: 'Data',
    catText: 'Text',
    catEncode: 'Encoding',
    catHash: 'Hash',
    catUtilities: 'Utilities',
    fromFormat: 'From Format',
    toFormat: 'To Format',
    algorithm: 'Algorithm',
    swap: 'Swap',
    quality: 'Quality:',
    width: 'Width:',
    height: 'Height:',
    auto: 'auto',
    convert: 'Convert',
    result: 'Result',
    download: 'Download File',
    copy: 'Copy',
    newConversion: 'New Conversion',
    supportedFormats: 'Supported Formats',
    descImage: 'Convert between popular graphic formats',
    descData: 'Transform data structures',
    descText: 'Text formats and markup',
    descEncode: 'Encode and decode',
    descHash: 'File fingerprints',
    descUtilities: 'Instant tools, no file needed',
    binaryPreviewNote: '📗 Binary file ready — download it to view.',
    quickUtilities: 'Quick Utilities',
    colorConverter: 'Color',
    colorPlaceholder: '#2dd4bf, rgb(...), hsl(...)',
    timestampConverter: 'Unix Timestamp',
    now: 'Now',
    history: 'Conversion History',
    emptyHistory: 'No conversions yet',
    footer: 'Filaxy Convert™ — all conversions run locally in your browser. Files are never uploaded to any server.',
    statusDone: '✅ Conversion complete!',
    statusError: '❌ Error: ',
    statusParseError: (n) => `${n} parse error: `,
    statusCopied: '📋 Copied to clipboard',
    statusCopyFailed: '❌ Could not copy',
    errImageCreate: 'Could not create image',
    errImageLoad: 'Could not load image',
    justNow: 'just now',
    minAgo: (n) => `${n} min ago`,
    hAgo: (n) => `${n}h ago`,
    dAgo: (n) => `${n}d ago`,
    statAllLocal: '100% local',
    statFormats: '27 formats',
    statZeroUpload: '0 uploads',
  },
};

let currentLang = localStorage.getItem('filaxyConvertLang') || 'es';

export function getLang() {
  return currentLang;
}

export function t(key, ...args) {
  const entry = translations[currentLang][key];
  return typeof entry === 'function' ? entry(...args) : entry;
}

export function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('filaxyConvertLang', lang);
  applyLang();
}

export function applyLang(onApplied) {
  document.documentElement.lang = currentLang;
  document.title = t('pageTitle');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = t('pageDesc');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.textContent = currentLang === 'es' ? 'EN' : 'ES';

  if (typeof onApplied === 'function') onApplied();
}
