import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = 'reviews/arrival-bubble/source/2cb42ec4e49efbe62d3f4aa07a5e5d3ec00b08985811fc4485f10c7de58cf0ae.json';
const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
const hash = value => createHash('sha256').update(value).digest('hex');
const files = Object.entries(source.inputs).map(([path, capturedSHA256]) => {
  const working = readFileSync(path);
  const staged = execFileSync('git', ['show', ':' + path], { maxBuffer: 8 * 1024 * 1024 });
  const unchangedCapture = hash(working) === capturedSHA256;
  const exact = staged.equals(working);
  const text = /\.(?:ts|js|mjs|css|svg|json|html|md)$/.test(path);
  const normalized = text && staged.equals(Buffer.from(working.toString('utf8').replace(/\r\n/g, '\n')));
  return { path, capturedSHA256, workingSHA256: hash(working), stagedSHA256: hash(staged),
    status: unchangedCapture && exact ? 'exact' : unchangedCapture && normalized ? 'CRLF-to-LF-only' : 'mismatch' };
});
const report = { sourcePath, runtimeSHA256: source.sha256, files: files.length,
  exact: files.filter(file => file.status === 'exact').length,
  lineEndingsOnly: files.filter(file => file.status === 'CRLF-to-LF-only'),
  mismatches: files.filter(file => file.status === 'mismatch'), entries: files };
writeFileSync('reviews/arrival-bubble/STAGED_SOURCE_VERIFICATION.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ files: report.files, exact: report.exact,
  lineEndingsOnly: report.lineEndingsOnly.map(file => file.path), mismatches: report.mismatches }, null, 2));
if (report.mismatches.length) process.exitCode = 1;
