import { describe, it, expect } from 'vitest';
import { decodeJWT } from '../src/converters/encode.js';

// Header {"alg":"HS256","typ":"JWT"}, payload {"sub":"1234567890","name":"Ada Lovelace"}
const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSJ9.dGVzdC1zaWduYXR1cmU';

describe('decodeJWT', () => {
  it('decodes header and payload', () => {
    const decoded = JSON.parse(decodeJWT(SAMPLE_JWT));
    expect(decoded.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(decoded.payload).toEqual({ sub: '1234567890', name: 'Ada Lovelace' });
  });

  it('throws on malformed input', () => {
    expect(() => decodeJWT('not-a-jwt')).toThrow(/Not a valid JWT/);
  });
});
