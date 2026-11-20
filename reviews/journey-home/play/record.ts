import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from '@playwright/test';
import { passive } from '../../../tests/e2e/story-support';
import { report } from '../../../tests/e2e/large-cove-support';

export async function recordWelcome(page: Page, folder: string) {
  const name = 'final-arrival';
  const raw = join(folder, 'raw', name);
  mkdirSync(raw, { recursive: true });
  const start = await passive(page, () => {
    const tap = (window as any).__lastFerryOutputMonitor;
    if (!tap) throw Error('Game audio output unavailable');
    const recorder = new MediaRecorder(tap, { mimeType: 'audio/webm;codecs=opus' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    const done = new Promise<number[]>(resolve => {
      recorder.onstop = async () => resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())));
    });
    Object.assign(window, { __journeyFilm: { recorder, done } });
    const epoch = performance.timeOrigin + performance.now();
    recorder.start();
    return epoch;
  });
  const client = await page.context().newCDPSession(page);
  const frames: {path:string;timestamp:number;receipt:number}[] = [];
  let active = true;
  async function capture() {
    const before = Date.now();
    const image = await client.send('Page.captureScreenshot', { format:'jpeg', quality:87, fromSurface:true });
    const after = Date.now();
    const path = join(raw, 'frame-' + String(frames.length).padStart(6,'0') + '.jpg');
    writeFileSync(path, Buffer.from(image.data,'base64'));
    frames.push({ path, timestamp:(before+after)/2000, receipt:after });
  }
  await capture();
  const loop = (async () => {
    while (active) {
      await new Promise(resolve => setTimeout(resolve, 65));
      if (active) await capture();
    }
  })();
  return async () => {
    active = false;
    await loop;
    try {
      await capture();
      const bytes = await passive(page, async () => {
        const { recorder, done } = (window as any).__journeyFilm;
        recorder.stop();
        return await done as number[];
      });
      const audio = join(raw,'runtime-audio.webm');
      writeFileSync(audio,new Uint8Array(bytes));
      report(folder,name+'-recording',{viewport:page.viewportSize(),audioStartEpochMs:start,audio,frames,
        sampling:'Native viewport screenshots sampled throughout real play, with a final guaranteed screen sample. Timestamps are midpoints of local CDP screenshot request and receipt, in epoch seconds.'});
    } finally { await client.detach(); }
  };
}
