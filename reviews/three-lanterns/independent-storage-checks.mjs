import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; };
const root = path.resolve(option('--repo', process.cwd()));
const output = option('--out', null);
if (!output) throw new Error('Pass --out <scratch-directory>; --repo defaults to the working directory.');
const modulePath = path.join(root, 'src/game/mastery.ts');
const bytes = fs.readFileSync(modulePath);
const blob = crypto.createHash('sha1').update('blob ' + bytes.length).update(Buffer.from([0])).update(bytes).digest('hex');
assert.equal(blob, '9502378ce494c1b3d12fa7bddc0aa6d01016d360', 'The reviewed mastery source must match exactly.');
const { MasteryStore, MASTERY_STORAGE_KEY: key, resultFor, masteryTargets } = await import(pathToFileURL(modulePath));
const checks = [];
function check(name, fn) { fn(); checks.push({ name, passed: true }); }
const score = (a = 8, u = 0) => resultFor('first-crossing', a, u);
const encode = results => JSON.stringify({ version: 1, results });
function backing(raw = null) {
  return { raw, writes: 0, getItem(k) { assert.equal(k, key); return this.raw; }, setItem(k, v) { assert.equal(k, key); this.writes++; this.raw = v; } };
}
check('Exact eight targets and revision identities', () => {
  assert.deepEqual(masteryTargets, Object.fromEntries(Object.entries({ 'first-crossing': 8, 'holding-pier': 9, bellwater: 10, 'driftwood-yard': 12, 'two-shelters': 12, 'wide-berth': 14, 'reef-return': 11, 'orchard-landing': 13 }).map(([id, target]) => [id, { revision: 1, target }])));
});
check('Numeric bounds and prototype-looking identities are rejected', () => {
  for (const n of [-1, 0, 0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, '8', null, undefined]) assert.equal(resultFor('first-crossing', n, 0), null);
  for (const n of [-1, 0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, '0', null, undefined]) assert.equal(resultFor('first-crossing', 8, n), null);
  for (const id of ['__proto__', 'constructor', 'toString', 'missing', '']) assert.equal(resultFor(id, 8, 0), null);
});
check('Malformed numeric/shape/current-rating records preserve raw bytes and permit only visit results', () => {
  const invalid = [];
  for (const change of [{ revision: 0 }, { revision: 1.5 }, { revision: '1' }, { revision: Number.MAX_SAFE_INTEGER + 1 }, { actions: 0 }, { actions: 7.5 }, { actions: null }, { successfulUndos: -1 }, { lanterns: 0 }, { lanterns: 4 }, { lanterns: '3' }, { extra: true }, { coveId: '__proto__' }, { successfulUndos: 1 }]) invalid.push(encode({ 'first-crossing@1': { ...score(), ...change } }));
  invalid.push('[]', 'null', encode({ 'first-crossing@2': score() }), JSON.stringify({ version: 1, results: {}, extra: true }), JSON.stringify({ version: 1, results: [] }), encode({}).padEnd(32769, ' '));
  for (const raw of invalid) {
    const b = backing(raw), s = new MasteryStore(() => b);
    assert.equal(s.persistent, false); assert.equal(s.best('first-crossing'), null);
    assert.equal(s.accept(score()), true); assert.deepEqual(s.best('first-crossing'), score());
    assert.equal(b.raw, raw); assert.equal(b.writes, 0); assert.match(s.issue, /visit/);
  }
});
check('Unknown revisions remain preserved without appearing as current best', () => {
  const old = { ...score(8, 8), revision: 2, lanterns: 3 }, other = { ...score(9, 1), revision: 3, lanterns: 2 };
  const b = backing(encode({ 'first-crossing@2': old, 'first-crossing@3': other })), s = new MasteryStore(() => b);
  assert.equal(s.persistent, true); assert.equal(s.best('first-crossing'), null); assert.equal(s.accept(old), false);
  assert.equal(s.accept(score()), true); assert.deepEqual(s.best('first-crossing'), score());
  const saved = JSON.parse(b.raw).results; assert.deepEqual(saved['first-crossing@2'], old); assert.deepEqual(saved['first-crossing@3'], other);
});
check('Corruption after initialization retains existing best and does not overwrite unreadable bytes', () => {
  const b = backing(encode({ 'first-crossing@1': score(8, 0) })), s = new MasteryStore(() => b);
  b.raw = '{'; assert.equal(s.accept(score(7, 1)), false);
  assert.equal(s.persistent, false); assert.deepEqual(s.best('first-crossing'), score(8, 0));
  const holding = resultFor('holding-pier', 9, 1); assert.equal(s.accept(holding), true); assert.deepEqual(s.best('holding-pier'), holding);
  assert.equal(b.raw, '{'); assert.equal(b.writes, 0);
});
check('Read failure after initialization retains prior and new current-visit bests', () => {
  const b = backing(encode({ 'first-crossing@1': score(8, 1) })), s = new MasteryStore(() => b);
  b.getItem = () => { throw new Error('read denied'); };
  assert.equal(s.accept(score(8, 0)), true); assert.equal(s.persistent, false); assert.deepEqual(s.best('first-crossing'), score(8, 0)); assert.equal(b.writes, 0);
});
check('Failed write verification preserves one actual best and switches to visit-only mode', () => {
  const b = backing(), s = new MasteryStore(() => b);
  b.setItem = function() { this.writes++; this.raw = encode({}); };
  assert.equal(s.accept(score(7, 5)), true); assert.equal(s.persistent, false); assert.deepEqual(s.best('first-crossing'), score(7, 5));
  assert.equal(s.accept(score(8, 0)), true); assert.equal(s.accept(score(7, 1)), false); assert.deepEqual(s.best('first-crossing'), score(8, 0)); assert.equal(b.writes, 1);
});
check('Current best returns defensive copies and tie/worse runs cause no writes', () => {
  const b = backing(), s = new MasteryStore(() => b), candidate = score(8, 0);
  assert.equal(s.accept(candidate), true); candidate.actions = 1; candidate.successfulUndos = 99;
  const returned = s.best('first-crossing'); returned.actions = 2; assert.deepEqual(s.best('first-crossing'), score(8, 0));
  assert.equal(s.accept(score(8, 0)), false); assert.equal(s.accept(score(7, 1)), false); assert.equal(b.writes, 1);
});
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'independent-storage-results.json'), JSON.stringify({ reviewedCommit: '14f128619267e2da81b4108ece2de4da07b50359', sourceGitBlobSha: blob, node: process.version, checks }, null, 2) + '\n');
console.log(JSON.stringify({ passed: checks.length, failed: 0, checks: checks.map(x => x.name) }, null, 2));
