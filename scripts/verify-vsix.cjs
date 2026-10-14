// Verify actual VSIX archive contents, not only file size.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const pkg = require('../package.json');
const filename = pkg.name + '-' + pkg.version + '.vsix';
assert.ok(fs.existsSync(filename), 'Missing generated ' + filename);
const bytes = fs.readFileSync(filename);
assert.ok(bytes.length > 3000, 'VSIX unexpectedly small');
// Locate ZIP End of Central Directory and parse entries.
let eocd = -1;
for (let p = bytes.length - 22; p >= Math.max(0, bytes.length - 65557); p--) {
  if (bytes.readUInt32LE(p) === 0x06054b50) { eocd = p; break; }
}
assert.ok(eocd >= 0, 'VSIX is not a readable ZIP archive');
const count = bytes.readUInt16LE(eocd + 10);
const centralSize = bytes.readUInt32LE(eocd + 12);
let offset = bytes.readUInt32LE(eocd + 16);
assert.ok(count > 0 && centralSize > 0 && offset + centralSize <= eocd, 'Invalid ZIP directory');
const names = new Set();
for (let i = 0; i < count; i++) {
  assert.equal(bytes.readUInt32LE(offset), 0x02014b50, 'Invalid ZIP entry header');
  const nameLength = bytes.readUInt16LE(offset + 28);
  const extraLength = bytes.readUInt16LE(offset + 30);
  const commentLength = bytes.readUInt16LE(offset + 32);
  names.add(bytes.subarray(offset + 46, offset + 46 + nameLength).toString('utf8'));
  offset += 46 + nameLength + extraLength + commentLength;
}
const required = [
  'extension/package.json',
  'extension/out/extension.js',
  'extension/out/terminalColors.js',
  'extension/scripts/galaxy-prompt.ps1',
  'extension/readme.md',
  'extension/changelog.md',
  'extension/LICENSE.txt',
  'extension/media/icon.png',
  'extension/media/Masum Galaxy Terminal X Showcase.png',
  'extension/media/themes/blue-circuit-bg.png',
  'extension/media/themes/blue-circuit.svg'
];
for (const name of required) {
  assert.ok(names.has(name), 'Missing packaged file: ' + name);
}
assert.ok(![...names].some(name => name.startsWith('extension/src/')), 'TypeScript source should not be packaged');
console.log('PASS: ' + filename + ' (' + bytes.length + ' bytes); ' + required.length + ' required assets verified.');
