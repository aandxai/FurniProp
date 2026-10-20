import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const path = resolve(root, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`);
  if (!path.startsWith(`${root}/`)) { response.writeHead(403).end(); return; }
  try {
    const content = await readFile(path);
    response.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream' }).end(content);
  } catch { response.writeHead(404).end(); }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });

  await page.goto(base);
  await page.getByRole('heading', { name: /More than a home/ }).waitFor();
  assert.equal(await page.locator('.card').count(), 3);
  assert.equal(await page.locator('.hero-art img').evaluate(image => image.naturalWidth > 0), true);
  await page.getByRole('link', { name: 'Explore homes' }).first().click();
  await page.getByLabel('Project or locality').fill('Bodakdev');
  await page.getByRole('button', { name: 'Show homes' }).click();
  assert.equal(await page.locator('.card').count(), 1);
  await page.getByRole('link', { name: 'Clear filters' }).click();
  await page.getByRole('link', { name: 'View Amber Residence' }).click();
  await page.getByRole('link', { name: /Explore visualizer/ }).click();
  assert.match(await page.locator('.price-line.total').innerText(), /₹85\.95 L/);
  await page.getByRole('radio', { name: /Elevated/ }).check();
  assert.match(await page.locator('.price-line.total').innerText(), /₹86\.95 L/);

  await page.goto(`${base}/#/login`);
  await page.getByRole('button', { name: 'Developer demo' }).click();
  await page.getByRole('link', { name: 'Manage projects' }).click();
  await page.getByLabel('Project name').fill('Sample New Home');
  await page.getByLabel('Locality').fill('Navrangpura');
  await page.getByLabel('Fictional address').fill('Fictional Navrangpura Address');
  await page.getByLabel('Description').fill('A fictional and clearly marked demo project for browser testing.');
  await page.getByRole('button', { name: 'Create draft' }).click();
  await page.getByLabel('Unit type name').fill('Demo 2 BHK');
  await page.getByLabel('BHK').fill('2');
  await page.getByLabel('Carpet area (sq ft)').fill('1100');
  await page.getByLabel('Property base price (₹)').fill('9000000');
  await page.getByLabel('Available DEMO units').fill('4');
  await page.getByRole('button', { name: 'Add unit type' }).click();
  await page.getByLabel('Package name').fill('Signature');
  await page.getByLabel('Furnishing price (₹)').fill('200000');
  await page.getByLabel('Inclusions (comma separated)').fill('Sofa, Bed, Kitchen');
  await page.getByRole('button', { name: 'Add package' }).click();
  await page.getByRole('button', { name: 'Submit for review' }).click();
  await page.goto(`${base}/#/login`);
  await page.getByRole('button', { name: 'Admin demo' }).click();
  await page.getByRole('link', { name: 'Review projects' }).click();
  await page.getByRole('button', { name: 'Publish locally' }).click();
  await page.getByRole('link', { name: 'Explore homes' }).first().click();
  assert.equal(await page.locator('.card').count(), 4);

  await page.goto(`${base}/docs/`);
  await page.getByRole('heading', { name: /More than a home/ }).waitFor();
  assert.equal(await page.locator('.hero-art img').evaluate(image => image.naturalWidth > 0), true);
  assert.deepEqual(errors, []);
  console.log('GitHub Pages preview passed: root and docs sources, assets, search, visualizer, developer and admin flows.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
