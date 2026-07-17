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

function base64UrlToBytes(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const bin = atob(padded + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

// Decodes a JWT's header and payload (both base64url JSON). This is a
// decoder, not a verifier — the signature is not checked, matching what
// tools like jwt.io show without the signing secret.
export function decodeJWT(token) {
  const parts = token.trim().split('.');
  if (parts.length < 2) throw new Error('Not a valid JWT (expected header.payload.signature)');
  const decodePart = (part) => JSON.parse(new TextDecoder().decode(base64UrlToBytes(part)));
  return JSON.stringify({ header: decodePart(parts[0]), payload: decodePart(parts[1]) }, null, 2);
}
