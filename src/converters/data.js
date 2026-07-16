import jsyaml from 'js-yaml';

// Splits a CSV line on commas that are outside double-quoted fields.
export function splitCsvLine(line) {
  const cells = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      cells.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  cells.push(cur);
  return cells.map((v) => v.trim());
}

export function csvParse(text) {
  const lines = text.trim().split('\n');
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = splitCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      let val = vals[i] || '';
      if (val !== '' && !isNaN(val)) val = Number(val);
      obj[h] = val;
    });
    return obj;
  });
}

export function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function csvStringify(data) {
  if (!Array.isArray(data) || !data.length) return '';
  const headers = Object.keys(data[0]);
  const rows = [headers.map(csvEscape).join(',')];
  data.forEach((row) => {
    rows.push(headers.map((h) => csvEscape(row[h])).join(','));
  });
  return rows.join('\n');
}

export function xmlParse(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const err = doc.querySelector('parsererror');
  if (err) throw new Error(err.textContent);

  function xmlToObj(node) {
    const obj = {};
    if (node.attributes) {
      for (let a = 0; a < node.attributes.length; a++) {
        obj['@' + node.attributes[a].name] = node.attributes[a].value;
      }
    }

    const elementChildren = [];
    let text = '';
    for (const child of node.childNodes) {
      if (child.nodeType === 1) elementChildren.push(child);
      else if (child.nodeType === 3) text += child.textContent;
    }
    text = text.trim();

    if (!elementChildren.length) {
      // Leaf node: no nested elements, so its text content is the value.
      if (!Object.keys(obj).length) return text;
      if (text) obj['#text'] = text;
      return obj;
    }

    // A repeated tag name becomes an array; a single occurrence stays scalar.
    elementChildren.forEach((child) => {
      const key = child.tagName;
      const value = xmlToObj(child);
      if (obj[key] === undefined) obj[key] = value;
      else if (Array.isArray(obj[key])) obj[key].push(value);
      else obj[key] = [obj[key], value];
    });
    return obj;
  }
  return xmlToObj(doc.documentElement);
}

function escapeXML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function objToXML(obj, rootTag) {
  let xml = `<${rootTag}>\n`;
  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      xml += objToXML(item, 'item');
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, val] of Object.entries(obj)) {
      if (key.startsWith('@')) continue;
      if (Array.isArray(val)) {
        val.forEach((v) => {
          xml += objToXML(v, key);
        });
      } else if (typeof val === 'object' && val !== null) {
        xml += objToXML(val, key);
      } else {
        xml += `  <${key}>${escapeXML(String(val))}</${key}>\n`;
      }
    }
  } else {
    xml += `  ${escapeXML(String(obj))}\n`;
  }
  xml += `</${rootTag}>\n`;
  return xml;
}

export function toXML(data) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + objToXML(data, 'root');
}

export function parseStructured(from, text) {
  if (from === 'json') return JSON.parse(text);
  if (from === 'csv') return csvParse(text);
  if (from === 'xml') return xmlParse(text);
  if (from === 'yaml') return jsyaml.load(text);
  throw new Error(`Unsupported data format: ${from}`);
}

export function stringifyStructured(to, data) {
  if (to === 'json') return JSON.stringify(data, null, 2);
  if (to === 'csv') return csvStringify(data);
  if (to === 'xml') return toXML(data);
  if (to === 'yaml') return jsyaml.dump(data);
  throw new Error(`Unsupported data format: ${to}`);
}
