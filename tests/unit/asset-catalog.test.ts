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

  it('checks generated image dimensions, alpha semantics and derived-output provenance', () => {
    const broken = catalog();
    const portrait = broken.entries.find((entry: { id: string }) => entry.id === 'ui.passenger-portraits');
    portrait.generatedOutputs[0].width = 44;
    portrait.generatedOutputs[1].alpha = 'opaque';
    portrait.generatedOutputs[2].sha256 = '0'.repeat(64);
    portrait.generatedOutputs[2].bytes = 1;
    const errors = validateCatalog(broken, root).join('\n');
    expect(errors).toContain('dimensions differ from its PNG header');
    expect(errors).toContain('straight alpha semantics');
    expect(errors).toContain('hash differs from its provenance');
    expect(errors).toContain('byte count differs from its provenance');
  });

  it('registers one distinct current PNG per profile for each of the five appearances', () => {
    const family = catalog().entries.find((entry: {id: string}) => entry.id === 'ui.passenger-portraits');
    const keys = ['rabbit-cream', 'rabbit-tan', 'sheep-wool', 'beaver-brown', 'deer-chestnut'];
    const outputs: {profile: string; appearance: string; path: string; sha256: string}[] = family.generatedOutputs;
    expect(outputs).toHaveLength(10);
    expect(new Set(outputs.map(output => output.sha256)).size).toBe(10);
    for (const profile of ['choice', 'arrival']) {
      expect(outputs.filter(output => output.profile === profile).map(output => output.appearance).sort()).toEqual([...keys].sort());
      for (const appearance of keys) expect(outputs).toContainEqual(expect.objectContaining({
        profile, appearance, path: `assets/portraits/${profile}/${appearance}.png`, width: 256, height: 256,
      }));
    }
  });

  it('rejects missing or duplicated generated variants and unsafe output sources', () => {
    const broken = catalog();
    const portrait = broken.entries.find((entry: { id: string }) => entry.id === 'ui.passenger-portraits');
    portrait.identitySource = '../outside.ts';
    portrait.generatedOutputs[0].path = '../outside.png';
    portrait.generatedOutputs[1].variant = portrait.generatedOutputs[0].variant;
    const errors = validateCatalog(broken, root).join('\n');
    expect(errors).toContain('outside repository');
    expect(errors).toContain('unique variant');
    expect(errors).toContain('variants must match');
  });

  it('requires bounded generated image outputs instead of reference-only labels', () => {
    const broken = catalog();
    const portrait = broken.entries.find((entry: { id: string }) => entry.id === 'ui.passenger-portraits');
    portrait.generatedOutputs = [];
    portrait.typeSpecific = {};
    const errors = validateCatalog(broken, root).join('\n');
    expect(errors).toContain('1–16 bounded outputs');
    expect(errors).toContain('missing type-specific field');
  });
});
