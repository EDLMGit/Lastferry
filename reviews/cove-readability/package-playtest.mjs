import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const output = process.argv[2];
if (!output) throw new Error('Supply an output HTML path.');
const dist = 'dist';
const index = await readFile(join(dist, 'index.html'), 'utf8');
const scriptTag = index.match(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/);
const styleTag = index.match(/<link\b[^>]*\bhref="([^"]+\.css)"[^>]*>/);
assert.ok(scriptTag && styleTag, 'Expected one Vite entry and one stylesheet.');
let script = await readFile(join(dist, scriptTag[1]), 'utf8');
const style = await readFile(join(dist, styleTag[1]), 'utf8');

for (const name of await readdir(join(dist, 'assets'))) {
  if ([basename(scriptTag[1]), basename(styleTag[1])].includes(name)) continue;
  assert.ok(name.endsWith('.png'), 'Unexpected external asset: ' + name);
  const bytes = await readFile(join(dist, 'assets', name));
  const reference = ['`', '"', "'"].map(quote => quote + name + quote).find(value => script.includes(value));
  assert.ok(reference, 'Missing portrait reference: ' + name);
  script = script.replaceAll(reference, () => JSON.stringify('data:image/png;base64,' + bytes.toString('base64')));
}

const page = index
  .replace(scriptTag[0], () => '<script type="module">' + script.replaceAll(/<\/script/gi, '<\\/script') + '</script>')
  .replace(styleTag[0], () => '<style>' + style + '</style>');
await writeFile(output, page);
