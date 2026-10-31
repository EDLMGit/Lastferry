import type { Page } from '@playwright/test';

export async function trustedRapid(
  page: Page,
  first: { x: number; y: number; width: number; height: number },
  mode: 'consecutive-sail' | 'arrived-local',
) {
  const cdp = await page.context().newCDPSession(page);
  const nativeDispatches: {
    point: { x: number; y: number };
    method: string;
    sentAt: number;
    downAck?: number;
    completedAt?: number;
  }[] = [];
  await page.exposeBinding(
    '__dispatchRapidTouch',
    async (_source, point: { x: number; y: number }) => {
      const record = {
        point,
        method:
          mode === 'consecutive-sail' ? 'ordered CDP mouse messages' : 'native CDP touch events',
        sentAt: Date.now(),
      } as (typeof nativeDispatches)[number];
      nativeDispatches.push(record);
      if (mode === 'consecutive-sail') {
        const down = cdp.send('Input.dispatchMouseEvent', {
          type: 'mousePressed',
          ...point,
          button: 'left',
          clickCount: 1,
        });
        const up = cdp.send('Input.dispatchMouseEvent', {
          type: 'mouseReleased',
          ...point,
          button: 'left',
          clickCount: 1,
        });
        await down;
        record.downAck = Date.now();
        await up;
      } else {
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ ...point, id: 1 }],
        });
        record.downAck = Date.now();
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
      record.completedAt = Date.now();
    },
  );
  await page.evaluate(
    ({ first, mode }) => {
      const runtime = window as any;
      runtime.__rapidTrace = { clicks: [], points: { first }, error: null, done: false };
      let step = 0;
      const trace = runtime.__rapidTrace;
      const point = (id: string) => {
        const element = document.getElementById(id)!;
        const r = element.getBoundingClientRect();
        if (!r.width || !r.height) throw Error(`Rapid target ${id} has no live rectangle`);
        return {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          width: r.width,
          height: r.height,
        };
      };
      const send = (p: { x: number; y: number }) => {
        void runtime.__dispatchRapidTouch({ x: p.x, y: p.y }).catch((error: unknown) => {
          trace.error = String(error);
        });
      };
      const afterIdle = (fn: () => void) => {
        const minimumTurn = runtime.__LAST_FERRY__.getState().turn + 1;
        setTimeout(() => {
          const scene = document.getElementById('seascape')!;
          const settled = () =>
            scene.getAttribute('aria-busy') === 'false' &&
            runtime.__LAST_FERRY__.getState().turn >= minimumTurn;
          if (settled()) fn();
          else {
            const observer = new MutationObserver(() => {
              if (!settled()) return;
              observer.disconnect();
              fn();
            });
            observer.observe(scene, { attributes: true, attributeFilter: ['aria-busy'] });
          }
        }, 0);
      };
      const listener = (event: MouseEvent) => {
        const api = runtime.__LAST_FERRY__,
          v = api.getViewStatus();
        const target = (event.target as HTMLElement).closest('button')?.id ?? null;
        trace.clicks.push({
          at: performance.now(),
          trusted: event.isTrusted,
          target,
          x: event.clientX,
          y: event.clientY,
          dialogOpen: !!document.querySelector('#dialog[open]'),
          selectedId: document.querySelector('.map-target[aria-expanded="true"]')?.id ?? null,
          snapshot: {
            state: api.getState(),
            history: api.getRenderStatus().historyLength,
            desiredMusic: api.getAudioStatus().desiredArrangement,
            view: { mode: v.mode, scale: v.scale, focus: v.focus },
          },
        });
        try {
          if (step === 0) {
            if (target !== 'sail') throw Error(`Initial rapid click reached ${target}`);
            step = 1;
            afterIdle(() => {
              if (mode === 'consecutive-sail') {
                trace.points.destination = point('map-rabbit-pier');
                send(trace.points.destination);
              } else {
                trace.points.board = point('board');
                send({ x: first.x + first.width / 2, y: first.y + first.height / 2 });
              }
            });
          } else if (step === 1) {
            if (mode === 'consecutive-sail' && target !== 'map-rabbit-pier')
              throw Error(`Deliberate place selection reached ${target}`);
            step = 2;
            setTimeout(() => {
              if (mode === 'consecutive-sail') {
                trace.points.second = point('sail');
                send(trace.points.second);
              } else send(trace.points.board);
            });
          } else if (step === 2) {
            step = 3;
            if (target !== (mode === 'consecutive-sail' ? 'sail' : 'board'))
              throw Error(`Deliberate final control reached ${target}`);
            if (mode === 'consecutive-sail')
              afterIdle(() => {
                trace.done = true;
              });
            else
              setTimeout(() => {
                trace.done = true;
              });
          }
        } catch (error) {
          trace.error = String(error);
        }
      };
      runtime.__rapidListener = listener;
      window.addEventListener('click', listener, true);
    },
    { first, mode },
  );
  try {
    await page.evaluate(
      (first) =>
        (window as any).__dispatchRapidTouch({
          x: first.x + first.width / 2,
          y: first.y + first.height / 2,
        }),
      first,
    );
    try {
      await page.waitForFunction(
        () => (window as any).__rapidTrace.done || (window as any).__rapidTrace.error,
        undefined,
        { polling: 10, timeout: 5000 },
      );
    } catch (error) {
      await page.evaluate((error) => {
        (window as any).__rapidTrace.error = error;
      }, String(error));
    }
    const trace = await page.evaluate(() => {
      const runtime = window as any;
      window.removeEventListener('click', runtime.__rapidListener, true);
      return runtime.__rapidTrace;
    });
    return { ...trace, nativeDispatches };
  } finally {
    await cdp.detach();
  }
}
