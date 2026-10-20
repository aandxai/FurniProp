import { expect, test } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { db } from '../src/lib/db';

test('buyer filters furnished listings and opens the matching project', async ({ page }) => {
  await page.goto('/properties');
  await page.getByLabel('Bedrooms').selectOption('2');
  await page.getByLabel('Maximum furnished price (₹)').fill('8000000');
  await page.getByRole('button', { name: 'Show homes' }).click();
  await expect(page.getByRole('heading', { name: 'Sora Skyline' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Amber Residence' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Sora Skyline', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sora Skyline' })).toBeVisible();
  await expect(page.getByText('Starting furnished total')).toBeVisible();
  await page.goto('/properties?bhk=3&maxPrice=12000000');
  await expect(page.getByRole('heading', { name: 'Amber Residence' })).toBeVisible();
  await expect(page.getByText('₹1.11 Cr')).toBeVisible();
});

test('approved package switch changes image and server-calculated price', async ({ page }) => {
  await page.goto('/visualizer/amber-residence/two-bedroom');
  await expect(page.getByText('₹85.95 L')).toBeVisible();
  await page.getByRole('radio', { name: /Elevated/ }).check();
  await expect(page.getByText('₹86.95 L')).toBeVisible();
  await expect(page.locator('.visual-image img')).toHaveAttribute('src', /amber-elevated\.svg/);
});

test('admin publishes a valid submitted DEMO project', async ({ page }) => {
  const org = await db.organization.findUniqueOrThrow({ where: { slug: 'demo-amber' } });
  const slug = `e2e-demo-${randomBytes(4).toString('hex')}`;
  const project = await db.project.create({ data: {
    slug, name: `E2E DEMO ${slug}`, city: 'Ahmedabad', locality: 'Test locality', address: 'Fictional E2E test address',
    description: 'This is a fictional project used to test the admin publishing workflow.',
    status: 'SUBMITTED', organizationId: org.id, isDemo: true,
    image: '/scenes/amber-standard.svg', imageLabel: 'Conceptual illustration', mediaSource: 'Original FurniProp demo illustration', amenities: [],
    unitTypes: { create: [{ slug: 'two-bedroom', name: '2 BHK Test Home', bhk: 2, carpetAreaSqft: 900,
      basePricePaise: 700000000n, availableUnits: 1, packages: { create: [{ name: 'Demo Package', tier: 'Demo', pricePaise: 10000000n,
        inclusions: ['Furnished living room'], previewImage: '/scenes/amber-standard.svg', previewLabel: 'Conceptual illustration', approved: true }] } }] },
  } });
  try {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Admin demo' }).click();
    await expect(page.getByRole('heading', { name: 'Platform overview' })).toBeVisible();
    await page.goto('/admin/projects');
    const row = page.getByRole('row').filter({ hasText: project.name });
    await expect(row.getByRole('button', { name: 'Publish' })).toBeEnabled();
    await row.getByRole('button', { name: 'Publish' }).click();
    await expect(row.getByText('PUBLISHED')).toBeVisible();
    await page.goto(`/properties?query=${slug}`);
    await expect(page.getByRole('heading', { name: project.name })).toBeVisible();
  } finally {
    await db.project.delete({ where: { id: project.id } });
  }
});

test('developer cannot open another organization project by ID', async ({ page }) => {
  const other = await db.project.findUniqueOrThrow({ where: { slug: 'mira-courtyard' } });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Developer demo' }).click();
  await expect(page.getByRole('heading', { name: /Welcome, Demo Developer/ })).toBeVisible();
  await page.goto('/developer/projects');
  await expect(page.getByRole('link', { name: 'Mira Courtyard' })).toHaveCount(0);
  const response = await page.goto(`/developer/projects/${other.id}`);
  expect(response?.status()).toBe(404);
});

test('buyer saves a home and submits a consented inquiry visible to its developer', async ({ page }) => {
  const email = `e2e-buyer-${randomBytes(4).toString('hex')}@example.test`;
  try {
    await page.goto('/signup');
    await page.getByLabel('Full name').fill('E2E Demo Buyer');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('StrongDemoPass123!');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('heading', { name: /Hello, E2E/ })).toBeVisible();
    await page.goto('/properties/amber-residence');
    await page.getByRole('button', { name: '♡ Save home' }).click();
    await expect(page.getByRole('button', { name: '♥ Saved home' })).toBeVisible();
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'Amber Residence' })).toBeVisible();
    await page.goto('/properties/amber-residence');
    await page.getByLabel('Phone').fill('9876543210');
    await page.getByLabel(/I consent to being contacted/).check();
    await page.getByRole('button', { name: 'Send inquiry' }).click();
    await expect(page.getByText('Your demo inquiry was recorded.')).toBeVisible();
    await page.goto('/account');
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.goto('/login');
    await page.getByRole('button', { name: 'Developer demo' }).click();
    await expect(page.getByText(email)).toBeVisible();
  } finally {
    await db.inquiry.deleteMany({ where: { email } });
    await db.user.deleteMany({ where: { email } });
  }
});
