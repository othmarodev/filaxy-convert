import { describe, it, expect } from 'vitest';
import { parseStructured, stringifyStructured, xlsxToRows, rowsToXlsxBuffer } from '../src/converters/data.js';

describe('TOML', () => {
  it('round-trips a plain object', () => {
    const data = { name: 'Filaxy Convert', version: 1, tags: ['fast', 'private'] };
    const toml = stringifyStructured('toml', data);
    expect(parseStructured('toml', toml)).toEqual(data);
  });

  it('wraps an array (e.g. from CSV) under "rows" since TOML requires a table root', () => {
    const rows = [{ a: 1 }, { a: 2 }];
    const toml = stringifyStructured('toml', rows);
    expect(parseStructured('toml', toml)).toEqual({ rows });
  });
});

describe('XLSX', () => {
  it('round-trips rows through a real workbook buffer', async () => {
    const rows = [
      { name: 'Ada', age: 36 },
      { name: 'Grace', age: 85 },
    ];
    const buffer = await rowsToXlsxBuffer(rows);
    expect(await xlsxToRows(buffer)).toEqual(rows);
  });
});
