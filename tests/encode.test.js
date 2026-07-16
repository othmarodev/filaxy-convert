import { describe, it, expect } from 'vitest';
import { convertEncoding, decodeToBytes, encodeFromBytes } from '../src/converters/encode.js';

describe('encode/decode round-trips (UTF-8 safe)', () => {
  const samples = ['hello world', 'áéíóú ñ — acentos', 'emoji 🚀🔥', 'кириллица'];

  for (const sample of samples) {
    it(`base64 round-trips "${sample}"`, () => {
      const encoded = convertEncoding('url', 'base64', encodeURIComponent(sample));
      const decoded = convertEncoding('base64', 'url', encoded);
      expect(decodeURIComponent(decoded)).toBe(sample);
    });

    it(`hex round-trips "${sample}"`, () => {
      const encoded = convertEncoding('url', 'hex', encodeURIComponent(sample));
      const decoded = convertEncoding('hex', 'url', encoded);
      expect(decodeURIComponent(decoded)).toBe(sample);
    });
  }

  it('decodeToBytes/encodeFromBytes agree on byte length', () => {
    const bytes = decodeToBytes('hex', '48656c6c6f');
    expect(encodeFromBytes('url', bytes)).toBe('Hello');
  });
});
