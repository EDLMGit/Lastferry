import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
const directory = 'reviews/wide-berth-visual-repair/journey-final';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const results = [];
try {
  for (const name of ['actual-launch-rescue', 'actual-close-staging']) {
    await page.goto(`http://127.0.0.1:5270/${directory}/${name}.mp4`);
    const result = await page.evaluate(async () => {
      const video = document.querySelector('video');
      if (!video) throw new Error('No video element');
      const wait = (event, check) => new Promise((resolve, reject) => {
        if (check()) return resolve();
        const timeout = setTimeout(() => reject(new Error(`Timed out: ${event}`)), 10000);
        video.addEventListener(event, () => { clearTimeout(timeout); resolve(); }, { once: true });
        video.addEventListener('error', () => { clearTimeout(timeout); reject(new Error(video.error?.message || 'Media error')); }, { once: true });
      });
      await wait('loadedmetadata', () => video.readyState >= 1);
      video.muted = true;
      const frame = () => new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('No decoded video-frame callback')), 10000);
        video.requestVideoFrameCallback((now, metadata) => { clearTimeout(timeout); resolve({ now, ...metadata }); });
      });
      const firstFrame = frame();
      await video.play();
      const firstDecoded = await firstFrame;
      video.pause();
      const lastVideoFrame = frame();
      const seeked = wait('seeked', () => false);
      video.currentTime = video.duration - 0.3;
      await seeked;
      const nearEndDecoded = await lastVideoFrame;
      const quality = video.getVideoPlaybackQuality();
      return {
        duration: video.duration, width: video.videoWidth, height: video.videoHeight,
        nearEndTime: video.currentTime, readyState: video.readyState,
        firstDecoded, nearEndDecoded, totalVideoFrames: quality.totalVideoFrames,
        droppedVideoFrames: quality.droppedVideoFrames, error: video.error?.message ?? null,
      };
    });
    results.push({ name, ...result });
    const path = `${directory}/${name}-encoding.json`;
    const audit = JSON.parse(await readFile(path, 'utf8'));
    audit.result.browserPlayback = 'pass: muted actual playback, decoded frame callback, near-end seek and decoded frame callback';
    await writeFile(path, JSON.stringify(audit, null, 2) + '\n');
  }
  await writeFile(`${directory}/media-browser-check.json`, JSON.stringify({ at: new Date().toISOString(), browser: browser.version(), method: 'Encoded artifacts loaded directly through local server; actual muted playback and near-end seek, both confirmed with requestVideoFrameCallback. Artifact verification only, not gameplay recapture, human listening or physical-device performance.', results, errors }, null, 2) + '\n');
} finally {
  await browser.close();
}
process.stdout.write(JSON.stringify({ results, errors }));
