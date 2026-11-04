import { expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, activate, fullyVisible, idle } from './ui';
import { passive } from './story-support';
import { type Action, type State } from '../../src/game/rules';

export type RepairId = 'wide-berth' | 'reef-return';
export const repairOutput =
  process.env.LAST_FERRY_REVIEW_DIR ?? 'test-results/existing-coves-repair';

export function directory(id: string) {
  const dir = join(repairOutput, id);
  mkdirSync(dir, { recursive: true });
  return dir;
}
export function report(dir: string, name: string, value: unknown) {
  writeFileSync(join(dir, name + '.json'), JSON.stringify(value, null, 2) + '\n');
}
export async function snapshot(page: Page, dir: string, name: string) {
  const session = await page.context().newCDPSession(page);
  try {
    const shot = await session.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    writeFileSync(join(dir, name + '.png'), Buffer.from(shot.data, 'base64'));
  } finally {
    await session.detach();
  }
}
export async function localView(page: Page) {
  if ((await page.locator('#view-toggle').textContent())?.includes('Play view'))
    await activate(page, 'view-toggle', true);
}
export async function transferStart(
  page: Page,
  action: Extract<Action, { passengerIds: string[] }>,
  chooserShot?: () => Promise<void>,
) {
  await activate(page, action.type, true);
  if (await page.locator('#dialog[open][data-mode=action]').count()) {
    for (const choice of await page.locator('.passenger-options button').all()) {
      const id = (await choice.getAttribute('id'))!.slice('passenger-'.length);
      if (
        ((await choice.getAttribute('aria-pressed')) === 'true') !==
        action.passengerIds.includes(id)
      )
        await choice.tap();
    }
    await expect(page.locator('#commit')).toBeEnabled();
    await fullyVisible(page, page.locator('#commit'));
    if (chooserShot) await chooserShot();
    await activate(page, 'commit', true);
  }
}
export async function simpleAction(page: Page, action: Action) {
  if (action.type === 'move') await act(page, 'map-' + action.to, true);
  else if (action.type === 'wait') await act(page, 'wait', true);
  else {
    await transferStart(page, action);
    await idle(page);
  }
}
export async function checkTurn(page: Page, expected: State, development: boolean) {
  await expect(page.locator('[data-testid=turn]')).toHaveText(
    String(expected.turn).padStart(2, '0'),
  );
  await expect(page.locator('[data-testid=tide]')).toHaveText(String(expected.tideLevel));
  if (development) {
    const roster = (s: State) => ({
      ...s,
      aboard: [...s.aboard].sort(),
      delivered: [...s.delivered].sort(),
      waitingByPier: Object.fromEntries(
        Object.entries(s.waitingByPier).map(([pier, ids]) => [pier, [...ids].sort()]),
      ),
    });
    expect(roster(await passive(page, () => (window as any).__LAST_FERRY__.getState()))).toEqual(
      roster(expected),
    );
  }
  if (expected.status !== 'playing')
    await expect(page.locator('#dialog')).toHaveAttribute('data-outcome', expected.status);
}

export async function recordRescue(page: Page, dir: string, name: string) {
  const directory = join(dir, 'raw', name);
  mkdirSync(directory, { recursive: true });
  const audioStartEpochMs = await passive(page, () => {
    const stream = (window as any).__LAST_FERRY__.captureAudioStream();
    if (!stream) throw Error('No runtime audio stream');
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    const chunks: Blob[] = [];
    const done = new Promise<number[]>((resolve) => {
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = async () =>
        resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())));
    });
    (window as any).__reefCapture = { recorder, done };
    const start = performance.timeOrigin + performance.now();
    recorder.start();
    return start;
  });
  const cdp = await page.context().newCDPSession(page);
  const frames: { path: string; timestamp: number; receipt: number }[] = [];
  cdp.on('Page.screencastFrame', (event) => {
    const path = join(directory, 'frame-' + String(frames.length).padStart(6, '0') + '.jpg');
    writeFileSync(path, Buffer.from(event.data, 'base64'));
    frames.push({ path, timestamp: event.metadata.timestamp!, receipt: Date.now() });
    void cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId });
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, everyNthFrame: 2 });
  return async () => {
    await cdp.send('Page.stopScreencast');
    const bytes = await passive(page, async () => {
      const { recorder, done } = (window as any).__reefCapture;
      recorder.stop();
      return (await done) as number[];
    });
    const audio = join(directory, 'runtime-audio.webm');
    writeFileSync(audio, new Uint8Array(bytes));
    report(dir, name + '-recording', {
      viewport: page.viewportSize(),
      audioStartEpochMs,
      audio,
      frames,
    });
    await cdp.detach();
  };
}
