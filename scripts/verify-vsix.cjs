const fs = require('node:fs');
const path = require('node:path');
const files = fs.readdirSync(process.cwd()).filter(x => x.endsWith('.vsix'));
if (!files.length) { console.error('No VSIX file generated'); process.exit(1); }
const expected = 'masum-galaxy-terminal-x-' + require('../package.json').version + '.vsix';
if (!fs.existsSync(path.resolve(expected))) {
  console.error('Missing expected VSIX: ' + expected);
  process.exit(1);
}
const size = fs.statSync(expected).size;
if (size < 3000) { console.error('VSIX looks too small: ' + size); process.exit(1); }
console.log('VSIX generated: ' + expected + ' (' + size + ' bytes)');
