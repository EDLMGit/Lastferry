import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateCatalog } from '../../tools/check-assets';

const root = resolve(import.meta.dirname, '../..');
const catalog = () => JSON.parse(readFileSync(resolve(root, 'assets/catalog.json'), 'utf8'));

describe('canonical asset catalog', () => {
  it('keeps actual local sources, provenance, type detail and gallery evidence for each family', () => {
    expect(validateCatalog(catalog(), root)).toEqual([]);
  });

  it('rejects duplicate identities, absent sources, missing detail and unresolved retirements', () => {
    const broken = catalog();
    const entry = broken.entries[0];
    broken.entries.push(structuredClone(entry));
    entry.sources[0].path = '../outside-repository.svg';
    entry.typeSpecific = {};
    entry.provenance = 'missing';
    entry.status = 'retired';
    entry.replacedBy = ['missing.family'];
    const errors = validateCatalog(broken, root).join('\n');
    expect(errors).toContain('duplicate ID');
    expect(errors).toContain('outside repository');
    expect(errors).toContain('missing type-specific field');
    expect(errors).toContain('missing provenance');
    expect(errors).toContain('invalid replacement');
  });
});
