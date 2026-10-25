import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const kinds = new Set([
  'procedural-model', 'procedural-geometry', 'material-palette', 'shader-material',
  'generated-data-texture', 'effect', 'motion-recipe', 'procedural-audio',
  'generated-audio-buffer', 'lighting-recipe', 'gameplay-indicator',
  'css-component-family', 'dom-component-family', 'svg-icon', 'system-font-family',
  'reference', 'inline-svg-and-glyph', 'reference-image',
]);
const statuses = new Set(['existing-runtime', 'candidate', 'integrated', 'retired', 'reference-only']);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const object = (value: unknown): value is Record<string, any> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

export function validateCatalog(catalog: unknown, root: string): string[] {
  const errors: string[] = [];
  const fail = (owner: string, problem: string) => errors.push(`${owner}: ${problem}`);
  const localFile = (owner: string, path: unknown) => {
    if (!text(path) || isAbsolute(path) || path.includes('\\')) {
      fail(owner, 'expected a repository-relative file path');
      return;
    }
    const target = resolve(root, path);
    const fromRoot = relative(root, target);
    if (fromRoot.startsWith('..') || isAbsolute(fromRoot) || !existsSync(target) || !statSync(target).isFile())
      fail(owner, `missing or outside repository: ${path}`);
  };
  if (!object(catalog) || !Array.isArray(catalog.entries)) return ['catalog: missing entries array'];
  if (catalog.schemaVersion !== 1) fail('catalog', 'unsupported schemaVersion');
  if (!object(catalog.provenanceProfiles)) fail('catalog', 'missing provenance profiles');
  else for (const [name, profile] of Object.entries(catalog.provenanceProfiles)) {
    if (!object(profile) || !Array.isArray(profile.evidencePaths) || !profile.evidencePaths.length)
      fail(name, 'missing local provenance evidence paths');
    else for (const path of profile.evidencePaths) localFile(name, path);
  }
  if (!object(catalog.perTypeRequirements)) fail('catalog', 'missing type requirements');
  const ids = new Set<string>();
  for (const entry of catalog.entries) {
    if (!object(entry)) { fail('entry', 'expected an object'); continue; }
    const id = text(entry.id) ? entry.id : '(missing ID)';
    if (!text(entry.id) || ids.has(id)) fail(id, 'missing or duplicate ID');
    ids.add(id);
    if (!kinds.has(entry.kind)) fail(id, `unrecognized kind ${entry.kind}`);
    if (!statuses.has(entry.status)) fail(id, `unrecognized status ${entry.status}`);
    for (const key of ['name', 'meaning', 'visualSignature', 'reuseAndOwnership', 'behaviorToPreserve'])
      if (!text(entry[key])) fail(id, `missing ${key}`);
    for (const key of ['variants', 'consumers'])
      if (!Array.isArray(entry[key]) || entry[key].some((value: unknown) => !text(value)))
        fail(id, `invalid ${key}`);
    if (!Array.isArray(entry.sources) || entry.sources.length === 0) fail(id, 'missing sources');
    else for (const source of entry.sources) {
      localFile(id, source?.path);
      if (!text(source?.symbol)) fail(id, 'source requires descriptive symbol/selector');
    }
    if (!Array.isArray(entry.evidence) || entry.evidence.length === 0) fail(id, 'missing evidence');
    else for (const evidence of entry.evidence) {
      localFile(id, evidence?.path);
      if (!text(evidence?.role)) fail(id, 'evidence requires role');
    }
    const profile = catalog.provenanceProfiles?.[entry.provenance];
    if (!object(profile) || !text(profile.rights) || !text(profile.evidence)) fail(id, 'missing provenance/rights evidence');
    if (!object(entry.acceptance) || !text(entry.acceptance.state)) fail(id, 'missing human acceptance state');
    if (!object(entry.gallery) || !text(entry.gallery.section) || !text(entry.gallery.preview)) fail(id, 'missing gallery entry');
    const requirements = catalog.perTypeRequirements?.[entry.kind];
    if (!Array.isArray(requirements) || !requirements.length) fail(id, 'missing kind requirements');
    else for (const requirement of requirements)
      if (!text(requirement) || !object(entry.typeSpecific) || !text(entry.typeSpecific[requirement]))
        fail(id, `missing type-specific field ${requirement}`);
    if (entry.status === 'retired' && (!Array.isArray(entry.replacedBy) || !entry.replacedBy.length))
      fail(id, 'retired entry requires replacement IDs');
  }
  for (const entry of catalog.entries)
    if (object(entry)) for (const replacement of entry.replacedBy ?? [])
      if (!ids.has(replacement) || replacement === entry.id) fail(entry.id, `invalid replacement ${replacement}`);
  if (object(catalog.gallery)) localFile('gallery', catalog.gallery.path);
  else fail('catalog', 'missing gallery');
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const catalog = JSON.parse(readFileSync(resolve(root, 'assets/catalog.json'), 'utf8'));
  const errors = validateCatalog(catalog, root);
  if (errors.length) {
    process.stderr.write(`${errors.join('\n')}\n`);
    process.exitCode = 1;
  } else process.stdout.write(`Asset catalog valid: ${catalog.entries.length} unique families.\n`);
}
