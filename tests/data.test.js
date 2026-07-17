import { describe, it, expect } from 'vitest';
import { csvParse, csvStringify, xmlParse, toXML, parseStructured, stringifyStructured } from '../src/converters/data.js';

describe('csvParse / csvStringify', () => {
  it('parses basic rows into typed objects', () => {
    const rows = csvParse('name,age\nAda,36\nGrace,85');
    expect(rows).toEqual([
      { name: 'Ada', age: 36 },
      { name: 'Grace', age: 85 },
    ]);
  });

  it('round-trips a value containing a comma and quotes', () => {
    const data = [{ name: 'Doe, John "The Dev"', age: 40 }];
    const csv = csvStringify(data);
    expect(csvParse(csv)).toEqual(data);
  });

  it('returns an empty string for empty input', () => {
    expect(csvStringify([])).toBe('');
  });
});

describe('xmlParse / toXML', () => {
  it('round-trips a simple object through XML', () => {
    const xml = toXML({ name: 'Ada', age: 36 });
    expect(xmlParse(xml)).toEqual({ name: 'Ada', age: '36' });
  });
});

describe('parseStructured / stringifyStructured', () => {
  it('converts JSON to YAML and back', () => {
    const data = { a: 1, b: ['x', 'y'] };
    const yaml = stringifyStructured('yaml', data);
    expect(parseStructured('yaml', yaml)).toEqual(data);
  });

  it('throws a helpful error for unsupported formats', () => {
    expect(() => parseStructured('ini', '')).toThrow(/Unsupported/);
  });
});
