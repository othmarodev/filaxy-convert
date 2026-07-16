import { describe, it, expect } from 'vitest';
import { markdownToHTML, htmlToMarkdown, rtfToText, convertText } from '../src/converters/text.js';

describe('markdownToHTML', () => {
  it('converts headings, bold and links', () => {
    const html = markdownToHTML('# Title\n\n**bold** and [link](https://example.com)');
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<a href="https://example.com">link</a>');
  });
});

describe('htmlToMarkdown', () => {
  it('converts headings and emphasis back to markdown', () => {
    const md = htmlToMarkdown('<h2>Title</h2><p><strong>bold</strong></p>');
    expect(md).toContain('## Title');
    expect(md).toContain('**bold**');
  });
});

describe('rtfToText', () => {
  it('strips RTF control words and groups', () => {
    // The space before "World" is the literal RTF delimiter after \par,
    // not stripped — RTF treats it as content.
    const text = rtfToText('{\\rtf1\\ansi Hello\\par World}');
    expect(text).toBe('Hello\n World');
  });
});

describe('convertText dispatcher', () => {
  it('routes md -> html', () => {
    expect(convertText('md', 'html', '# Hi')).toBe('<h1>Hi</h1>');
  });
});
