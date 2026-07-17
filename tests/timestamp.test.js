import { describe, it, expect } from 'vitest';
import { timestampToISO, localDatetimeToTimestamp, timestampToLocalDatetime } from '../src/converters/timestamp.js';

describe('timestampToISO', () => {
  it('converts a known Unix timestamp to UTC ISO', () => {
    expect(timestampToISO(0)).toBe('1970-01-01T00:00:00.000Z');
    expect(timestampToISO(1700000000)).toBe('2023-11-14T22:13:20.000Z');
  });

  it('returns null for non-finite input', () => {
    expect(timestampToISO(NaN)).toBeNull();
  });
});

describe('timestampToLocalDatetime / localDatetimeToTimestamp', () => {
  it('round-trips through the local datetime format', () => {
    const seconds = 1700000000;
    const local = timestampToLocalDatetime(seconds);
    expect(localDatetimeToTimestamp(local)).toBe(seconds);
  });

  it('returns null for empty input', () => {
    expect(localDatetimeToTimestamp('')).toBeNull();
  });
});
