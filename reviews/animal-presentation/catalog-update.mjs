import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const base = 'd7884445c35fc24ebdabc2790b168b68294bf0bd';
const catalog = JSON.parse(execFileSync('git', ['show', `${base}:assets/catalog.json`], { encoding: 'utf8' }));
const entries = Object.fromEntries(catalog.entries.map(entry => [entry.id, entry]));
const report = 'reviews/animal-presentation/REVIEW.md';
const source = 'src/scene/animals.ts';
const record = 'assets/portraits/animal-profiles.json';
const generator = 'tools/bake-animal-profiles.mjs';
const keys = ['rabbit-cream', 'rabbit-tan', 'sheep-wool', 'beaver-brown', 'deer-chestnut'];
const profiles = ['choice', 'arrival'];
const portraits = entries['ui.passenger-portraits'];
const affected = ['model.rabbit', 'model.sheep', 'model.beaver', 'model.deer', portraits.id, 'ui.component.passenger-choice', 'ui.dialogs'];
for (const id of affected) {
  const entry = entries[id];
  const { history = [], ...previous } = entry.acceptance;
  entry.acceptance = { state: 'integrated-awaiting-human-visual-review', reviewedBaseline: 'a2740e61ec5a782f558ea6caad4181466d04e9f7', basis: report, history: [...history, previous] };
  entry.evidence.push({ path: report, role: 'Animal presentation implementation: actual model/UI comparisons, scoped checks and limitations.' });
  entry.gallery = { section: 'animal-profiles', preview: 'Five original appearances, with a choice portrait and a complete arrival figurine for each. Design specimens are separate from actual-play evidence.' };
}
for (const [id, signature] of Object.entries({ rabbit: 'Compact cream or tan coat, joined cheeks, tapered upright ears with integral pink paint and breed-specific splay.', sheep: 'Cream fleece with rounded curls, dark outspread ears, a lighter muzzle and four planted feet.', beaver: 'Warm brown coat, cheek pads, light teeth, shaped forepaws and broad flat tail.', deer: 'Spotted chestnut coat, continuous neck and muzzle forms, forked antlers and four dark hooves.' })) {
  const entry = entries[`model.${id}`];
  entry.visualSignature = signature;
  entry.sources.push({ path: source, symbol: `animal: shared ${id} construction, animal-local geometry and paint` });
  entry.typeSpecific['factory/source symbol'] = `${source}: animal(species, variant); re-exported by src/scene/models.ts`;
  entry.typeSpecific['material references'] = 'Animal-local matte vertex paint; shared ferry, world and lighting helpers are unchanged.';
  entry.typeSpecific['named attachment points when relevant'] = id === 'sheep' ? 'sheep-head group moves the eyes, ears, muzzle and forelock together during the existing Moss acknowledgment.' : id === 'deer' ? 'deer-hoof contact meshes and deer-antler groups.' : id === 'beaver' ? 'beaver-flat-tail and independent foot contact forms.' : 'Root is the existing ground/seat anchor; both rabbit coats retain supported feet.';
}
const oldSources = portraits.sources;
Object.assign(portraits, {
  name: 'Model-derived choice portraits and arrival figurines', originalModelSource: source, generatorSource: generator, generationRecord: record,
  meaning: 'Two intentionally framed views of each animal. The passenger key comes from the full level and ID; names, costs and choices remain live UI.',
  visualSignature: 'Five head-and-chest portraits and five complete, grounded figures with intact ears, feet, antlers and tail silhouettes.',
  reuseAndOwnership: 'Two reusable image profiles per appearance. A neighbor name never creates a new asset. The existing Three.js model supplies both views.',
  behaviorToPreserve: 'Full species ordinal and explicit coats, one native selection owner, stable reserved slots and visible named fallback; the complete arrival cast includes earlier deliveries.',
  sources: [{ path: source, symbol: 'animal: editable runtime miniatures' }, { path: generator, symbol: 'offline bake from the shared factory' }, { path: record, symbol: 'camera, lighting, source and output provenance' }, { path: portraits.identitySource, symbol: 'resolvePassengerAppearance' }, { path: 'src/ui/cove-ui.ts', symbol: 'appearance-to-profile URLs and shared choice markup' }, { path: 'src/ui/arrival.ts', symbol: 'whole rescued cast and figure composition' }],
  historicalSources: oldSources,
});
portraits.generatedOutputs = profiles.flatMap(profile => keys.map(appearance => {
  const path = `assets/portraits/${profile}/${appearance}.png`;
  const bytes = readFileSync(path);
  return { variant: `${profile}/${appearance}`, profile, appearance, path, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), format: 'PNG', colorSpace: 'sRGB', alpha: 'straight', sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length };
}));
portraits.variants = portraits.generatedOutputs.map(output => output.variant);
const detail = portraits.typeSpecific;
detail['original model and shared identity sources'] = `${source} through models.ts; passenger-appearance.ts resolves the full level and passenger ID.`;
detail['camera/crop, world proportions and shading recipe'] = `Offline WebGL bake with the production factory and species scale. Orthographic close faces versus grounded full figures; see ${record} for each camera and lighting recipe.`;
detail['derived output format/dimensions/variants and alpha/color semantics'] = 'Ten 256px square transparent sRGB RGBA PNGs: five original appearances in each of two profiles.';
detail['generation command/environment and source/output provenance'] = `Node 24: node ${generator}. Exact renderer, current model hashes, camera and derivative hashes: ${record}. Earlier SVG projection records are retained as history.`;
detail['actual consumers, displayed size and semantic purpose'] = 'Responsive close portraits beside full names and exact space costs on passenger choices; complete figurines in the named, non-interactive arrival cast.';
detail['native-control ownership and text-preserving load/failure behavior'] = 'One native, whole-tile pressed button in choices; reserved slots, decorative static images and live names survive failure. No nested input, new runtime renderer or image-driven layout.';
detail['small-screen evidence and human acceptance boundary'] = `Actual native-size emulated phone frames and capture limits: ${report}. Physical-device and human acceptance are separate.`;
const provenance = catalog.provenanceProfiles[portraits.provenance];
provenance.author = 'Original Last Ferry procedural animal family and offline Three.js profile renderer';
provenance.derivation = `Actual animal geometry in a controlled offline WebGL studio, rendered to transparent PNG; studio light and camera differ from the cove. ${record} identifies the current outputs; earlier SVG-based generation records are historical.`;
provenance.evidence = `${record}; docs/ASSET_LEDGER.md`;
provenance.evidencePaths.push(record);
catalog.provenanceProfiles['original-project-code'].runtimeDownloads = 'No external runtime artwork downloads. The local animal profile PNGs have separate generation records.';
const choice = entries['ui.component.passenger-choice'];
choice.typeSpecific['size/hit target/layout behavior'] = 'Reserved portrait with flexible live name and cost; responsive columns, scrollable constrained content and nearby named commit footer.';
choice.typeSpecific['mobile and reduced-motion evidence'] = `${report}; static portraits add no animation owner.`;
catalog.animalPresentationChanges = { task: 'ANIMAL_PRESENTATION_01', source: base, updatedFamilies: affected, addedIds: [], removedIds: [], historicalManifest: 'assets/portraits/family-manifest.json', generationRecord: record, evidence: report };
process.stdout.write(JSON.stringify(catalog, null, 2) + '\n');
