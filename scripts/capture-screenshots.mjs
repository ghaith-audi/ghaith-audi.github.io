// Captures real screenshots of every live project into public/projects/<slug>/.
//
// Needs Google Chrome (or Edge) installed and puppeteer-core, which is not a
// dependency of the site. Install it without touching package.json:
//
//   npm i --no-save puppeteer-core
//   npm run screenshots              # every project with a live URL
//   npm run screenshots -- ovacs     # one project
//
// Then set the three image paths in the dashboard (or in content/projects/<slug>.json):
//   "desktop": "/projects/<slug>/desktop.webp",
//   "mobile":  "/projects/<slug>/mobile.webp",
//   "full":    "/projects/<slug>/full.webp"

import fs from 'node:fs';
import path from 'node:path';

let puppeteer;
try {
  puppeteer = (await import('puppeteer-core')).default;
} catch {
  console.error('puppeteer-core is not installed. Run: npm i --no-save puppeteer-core');
  process.exit(1);
}

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const executablePath = candidates.find((p) => fs.existsSync(p));
if (!executablePath) {
  console.error('Chrome not found. Set CHROME_PATH to your Chrome or Edge executable.');
  process.exit(1);
}

const only = process.argv[2];
const projects = fs
  .readdirSync('content/projects')
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join('content/projects', f), 'utf8')))
  .filter((p) => p.url && (!only || p.slug === only));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function settle(page) {
  await page
    .evaluate(() => {
      const rx = /^(accept( all)?|allow( all)?|agree|i agree|got it|ok|موافق|قبول|أوافق|قبول الكل)$/i;
      for (const b of document.querySelectorAll('button, a[role="button"]')) {
        const t = (b.innerText || '').trim();
        if (t && t.length < 24 && rx.test(t)) b.click();
      }
    })
    .catch(() => {});
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 450) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(160);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1500);
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--hide-scrollbars'] });
try {
  for (const p of projects) {
    const dir = path.join('public', 'projects', p.slug);
    fs.mkdirSync(dir, { recursive: true });

    const desktop = await browser.newPage();
    await desktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await desktop.goto(p.url, { waitUntil: 'networkidle2', timeout: 90000 });
    await sleep(2500);
    await settle(desktop);
    await desktop.screenshot({ path: path.join(dir, 'desktop.webp'), type: 'webp', quality: 80 });
    await desktop.screenshot({ path: path.join(dir, 'full.webp'), type: 'webp', quality: 72, fullPage: true, captureBeyondViewport: true });
    await desktop.close();

    const mobile = await browser.newPage();
    await mobile.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    );
    await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await mobile.goto(p.url, { waitUntil: 'networkidle2', timeout: 90000 });
    await sleep(2500);
    await settle(mobile);
    await mobile.screenshot({ path: path.join(dir, 'mobile.webp'), type: 'webp', quality: 80 });
    await mobile.close();

    console.log(`✓ ${p.slug}: desktop.webp, full.webp, mobile.webp`);
  }
} finally {
  await browser.close();
}
