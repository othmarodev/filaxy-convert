import { describe, it, expect } from 'vitest';
import { md5, computeHash } from '../src/converters/hash.js';

const enc = (s) => new TextEncoder().encode(s);

describe('md5 (RFC 1321 test vectors)', () => {
  it('hashes the empty string', () => {
    expect(md5(enc(''))).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('hashes "abc"', () => {
    expect(md5(enc('abc'))).toBe('900150983cd24fb0d6963f7d28e17f72');
  });

  it('hashes a message spanning multiple 512-bit blocks', () => {
    expect(md5(enc('The quick brown fox jumps over the lazy dog'))).toBe('9e107d9d372bb6826bd81d3542a419d6');
  });
});

describe('computeHash', () => {
  it('matches md5() for algo "md5"', async () => {
    expect(await computeHash('md5', enc('abc'))).toBe('900150983cd24fb0d6963f7d28e17f72');
  });

  it('computes sha256 via SubtleCrypto', async () => {
    const hash = await computeHash('sha256', enc('abc'));
    expect(hash).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});
