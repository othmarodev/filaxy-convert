// Base64/Hex/URL are byte-oriented; encode/decode through UTF-8 bytes so
// non-Latin1 text (accents, emoji, Cyrillic, etc.) round-trips correctly.

export function decodeToBytes(from, text) {
  if (from === 'base64') {
    const bin = atob(text);
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  }
  if (from === 'url') {
    return new TextEncoder().encode(decodeURIComponent(text));
  }
  if (from === 'hex') {
    const clean = text.replace(/\s+/g, '');
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
    return bytes;
  }
  throw new Error(`Unsupported encoding: ${from}`);
}

export function encodeFromBytes(to, bytes) {
  if (to === 'base64') {
    let bin = '';
    bytes.forEach((b) => {
      bin += String.fromCharCode(b);
    });
    return btoa(bin);
  }
  if (to === 'url') {
    return encodeURIComponent(new TextDecoder().decode(bytes));
  }
  if (to === 'hex') {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  throw new Error(`Unsupported encoding: ${to}`);
}

export function convertEncoding(from, to, text) {
  const bytes = decodeToBytes(from, text.trim());
  return encodeFromBytes(to, bytes);
}
