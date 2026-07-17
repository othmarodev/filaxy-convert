import { describe, it, expect } from 'vitest';
import { parseColor, hexToRgb, rgbToHex, rgbToHsl, hslToRgb, formatRgb, formatHsl } from '../src/converters/color.js';

describe('hexToRgb / rgbToHex', () => {
  it('expands 3-digit hex', () => {
    expect(hexToRgb('#0f8')).toEqual({ r: 0, g: 255, b: 136 });
  });

  it('round-trips 6-digit hex', () => {
    expect(rgbToHex(hexToRgb('#2dd4bf'))).toBe('#2DD4BF');
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('not-a-color')).toBeNull();
  });
});

describe('rgbToHsl / hslToRgb', () => {
  it('converts a known RGB to HSL', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
  });

  it('round-trips RGB -> HSL -> RGB within rounding tolerance', () => {
    // HSL is stored as whole degrees/percentages for display, so a couple of
    // units of drift converting back to RGB is expected, not a bug.
    const rgb = { r: 45, g: 212, b: 191 };
    const back = hslToRgb(rgbToHsl(rgb));
    expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(2);
  });
});

describe('parseColor', () => {
  it('parses hex input', () => {
    expect(parseColor('#2dd4bf').hex).toBe('#2DD4BF');
  });

  it('parses rgb() input', () => {
    const parsed = parseColor('rgb(45, 212, 191)');
    expect(parsed.hex).toBe('#2DD4BF');
    expect(formatRgb(parsed.rgb)).toBe('rgb(45, 212, 191)');
  });

  it('parses hsl() input', () => {
    const parsed = parseColor('hsl(0, 100%, 50%)');
    expect(parsed.rgb).toEqual({ r: 255, g: 0, b: 0 });
    expect(formatHsl(parsed.hsl)).toBe('hsl(0, 100%, 50%)');
  });

  it('returns null for garbage input', () => {
    expect(parseColor('banana')).toBeNull();
  });
});
