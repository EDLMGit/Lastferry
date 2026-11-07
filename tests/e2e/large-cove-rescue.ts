import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { Level } from '../../src/levels/level';
import { initial, preview, edgeTo, passageFlow, load, type Action } from '../../src/game/rules';
import { activate, fullyVisible, idle, undo, wholeCove } from './ui';
import { journeyKey, passive } from './story-support';
import { productionURL } from './evidence';
import {
  checkTurn,
  directory,
  localView,
  recordRescue,
  report,
  snapshot,
  transferStart,
  type RepairId,
} from './large-cove-support';

async function selectPassage(page: Page, stop: string) {
  const marker = page.locator('#map-' + stop);
  const exposed = () =>
    marker.evaluate((el) => {
      const hit = el.querySelector('.map-hit') ?? el;
      const box = hit.getBoundingClientRect();
      return (
        !el.closest('.offscreen') &&
        el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2))
      );
    });
  if (!(await exposed())) {
    await wholeCove(page, true);
    await expect.poll(exposed).toBe(true);
  }
  await marker.locator('.map-hit').tap();
  await fullyVisible(page, page.locator('#sail'));
  await expect(page.locator('#sail')).toBeEnabled();
}

export function rescueCases(id: RepairId) {
  const level: Level = JSON.parse(readFileSync('data/' + id + '.level.json', 'utf8'));
  const plans = JSON.parse(readFileSync('data/' + id + '/witnesses.json', 'utf8')).witnesses as {
    id: string;
    actions: Action[];
  }[];
  for (const portrait of [true, false]) {
    const plan = plans[portrait ? 0 : 1];
    test(
      id +
        ' · ' +
        plan.id +
        ' · ' +
        (portrait ? 'portrait normal motion' : 'short landscape production'),
      async ({ browser, baseURL }) => {
        test.setTimeout(210000);
        const dir = directory(id);
        const size = portrait ? { width: 390, height: 844 } : { width: 780, height: 320 };
        const ctx = await browser.newContext({
          viewport: size,
          deviceScaleFactor: 1,
          isMobile: true,
          hasTouch: true,
          reducedMotion: 'no-preference',
        });
        const page = await ctx.newPage();
        page.setDefaultTimeout(9000);
        const prefix = size.width + 'x' + size.height;
        const shot = (name: string) => snapshot(page, dir, prefix + '-' + name);
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        const rawSave = JSON.stringify(
          {
            version: 1,
            completed: ['holding-pier', 'bellwater', 'driftwood-yard', 'wide-berth'],
            acknowledgedScenes: ['opening', 'another-bell', 'driftwood-light', 'a-wider-deck'],
            checkpoint: { kind: 'complete' },
          },
          null,
          2,
        );
        await page.addInitScript(
          ({ key, raw }) => {
            if (!sessionStorage.getItem('repair-fixture')) {
              localStorage.setItem(key, raw);
              sessionStorage.setItem('repair-fixture', 'seeded');
            }
          },
          { key: journeyKey, raw: rawSave },
        );
        let saveMovie: (() => Promise<void>) | undefined;
        try {
          await page.goto((portrait ? baseURL : productionURL) + '/?cove=' + id);
          await expect(page.locator('#seascape')).toHaveAttribute('aria-label', level.title);
          await expect(page.locator('#status-headline')).toBeVisible();
          await page.waitForTimeout(300);
          expect(await page.evaluate(() => !!(window as any).__LAST_FERRY__)).toBe(portrait);
          if (portrait)
            await page.waitForFunction(
              () => (window as any).__LAST_FERRY__.getMetrics().frames > 3,
            );
          await shot('start');
          let expected = initial(level);
          await activate(page, 'status-toggle', true);
          await expect(page.locator('.current-schedule li')).toHaveCount(
            level.rules.tide.rises.length,
          );
          await shot('forecast');
          await activate(page, 'cancel', true);
          await checkTurn(page, expected, portrait);
          if (portrait) {
            await expect
              .poll(() =>
                passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus().contextState),
              )
              .toBe('running');
            saveMovie = await recordRescue(page, dir, id + '-rescue');
          }
          const events = [];
          const loads = plan.actions.reduce(
            (states, action) => [
              ...states,
              preview(states[states.length - 1], action, level).state,
            ],
            [initial(level)],
          );
          const largest = Math.max(...loads.map((s) => load(s, level)));
          let recovered = false,
            crossedBoundary = false,
            transferShot = false,
            sailingShot = false,
            emptyShot = false,
            loadedShot = false;
          let before = expected;
          for (const action of plan.actions) {
            await localView(page);
            await page.waitForTimeout(290);
            before = expected;
            const wrongAt = id === 'wide-berth' ? 3 : 8;
            if (expected.turn === wrongAt) {
              const beforeMistake = portrait
                ? await passive(page, () => (window as any).__LAST_FERRY__.getState())
                : null;
              const standby = preview(expected, { type: 'wait' }, level);
              expect(standby.state.status).toBe('lost');
              await activate(page, 'wait', true);
              await expect(page.locator('#dialog[open] #commit')).toBeEnabled();
              await shot('loss-preview');
              await activate(page, 'commit', true);
              await idle(page);
              await checkTurn(page, standby.state, portrait);
              await shot('loss');
              await undo(page, true);
              await checkTurn(page, expected, portrait);
              if (beforeMistake)
                expect(
                  await passive(page, () => (window as any).__LAST_FERRY__.getState()),
                ).toEqual(beforeMistake);
              await shot('undo-recovery');
              recovered = true;
              events.push({ wrong: 'wait', outcome: standby.state.lossReason, restored: expected });
            }
            const outcome = preview(expected, action, level);
            expect(outcome.error).toBeNull();
            expected = outcome.state;
            if (action.type === 'move') {
              const edge = edgeTo(before, action.to, level)!;
              if (edge.current && action.to === 'harbor' && load(before, level) >= 5)
                await shot('return-load');
              await selectPassage(page, action.to);
              if (edge.current) {
                await expect(page.locator('#local-context')).toContainText(edge.current.name);
                if (before.tideLevel !== expected.tideLevel) await shot('reef-inspection');
              }
              await activate(page, 'sail', true);
              await localView(page);
              if (edge.current && (!sailingShot || expected.tideLevel !== before.tideLevel)) {
                await page.waitForTimeout(620);
                await expect(page.locator('#seascape')).toHaveAttribute('aria-busy', 'true');
                await expect(page.locator('#status-toggle .reef-outlook')).toHaveCount(0);
                if (portrait) {
                  const flow = await passive(
                    page,
                    (edgeId) =>
                      (window as any).__LAST_FERRY__
                        .getNavigationStatus()
                        .routes.find((r: { id: string }) => r.id === edgeId).flowFrom,
                    edge.id,
                  );
                  expect(flow).toBe(passageFlow(edge, before.tideLevel)?.from);
                }
                await shot('sailing-' + expected.turn);
                sailingShot = true;
              }
            } else if (action.type === 'wait') {
              await activate(page, 'wait', true);
              await activate(page, 'commit', true);
            } else {
              const choosePicture =
                action.passengerIds.length > 1 && (expected.status === 'won' || !transferShot);
              await transferStart(
                page,
                action,
                choosePicture ? () => shot('chooser-' + expected.turn) : undefined,
              );
              if (action.passengerIds.length > 1 && !transferShot) {
                await page.waitForTimeout(150);
                await shot('transfer-' + expected.turn);
                transferShot = true;
              }
            }
            await idle(page);
            await checkTurn(page, expected, portrait);
            const n = load(expected, level);
            if (
              expected.status === 'playing' &&
              ((n === 0 && !emptyShot) || (n === largest && !loadedShot))
            ) {
              await localView(page);
              await page.waitForTimeout(240);
              await shot(n === largest ? 'loaded-boat' : 'empty-boat');
              if (n === largest) loadedShot = true;
              else emptyShot = true;
            }
            if (before.tideLevel !== expected.tideLevel && !crossedBoundary) {
              await undo(page, true);
              await checkTurn(page, before, portrait);
              if (action.type === 'move') {
                await selectPassage(page, action.to);
                await activate(page, 'sail', true);
              } else if (action.type !== 'wait') await transferStart(page, action);
              else {
                await activate(page, 'wait', true);
                await activate(page, 'commit', true);
              }
              await idle(page);
              await checkTurn(page, expected, portrait);
              crossedBoundary = true;
            }
            events.push({ action, after: expected });
          }
          expect(expected.status).toBe('won');
          expect(recovered && crossedBoundary && transferShot && sailingShot && loadedShot).toBe(
            true,
          );
          await shot('home');
          await page.waitForTimeout(750);
          if (saveMovie) {
            await saveMovie();
            saveMovie = undefined;
          }
          await undo(page, true);
          await checkTurn(page, before, portrait);
          expect(await passive(page, (key) => localStorage.getItem(key), journeyKey)).toBe(rawSave);
          expect(errors).toEqual([]);
          report(dir, prefix + '-run', {
            plan: plan.id,
            practiceSaveByteExact: true,
            viewport: size,
            dpr: 1,
            browser: browser.version(),
            builtGame: !portrait,
            node: process.version,
            terminalUndo: true,
            errors,
            events,
          });
        } finally {
          try {
            if (saveMovie) await saveMovie();
          } finally {
            await ctx.close();
          }
        }
      },
    );
  }
}
