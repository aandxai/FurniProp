import { afterAll, describe, expect, it } from 'vitest';
import { db } from './db';
import { formatINR, furnishedTotal } from './money';
import { developerProject, publicationIssues, searchProjects, startingOption } from './projects';
import { POST } from '@/app/api/pricing/estimate/route';

afterAll(async () => { await db.$disconnect(); });

describe('furnished discovery and price integrity', () => {
  it('uses the lowest approved furnished option as the listing headline', async () => {
    const results = await searchProjects({ city: 'Ahmedabad' });
    expect(results.length).toBe(3);
    const amber = results.find(item => item.project.slug === 'amber-residence');
    expect(amber).toBeDefined();
    expect(amber?.starting.totalPaise).toBe(859500000n);
    expect(startingOption(amber!.project)?.pkg.name).toBe('Signature');
    expect(formatINR(amber!.starting.totalPaise)).toBe('₹85.95 L');
    expect(furnishedTotal(845000000n, 14500000n)).toBe(859500000n);
  });

  it('filters only published furnished projects by city, BHK and total price', async () => {
    const matches = await searchProjects({ city: 'Ahmedabad', bhk: 2, maxPrice: 800000000n });
    expect(matches.map(item => item.project.slug)).toEqual(['sora-skyline']);
    const threeBhk = await searchProjects({ city: 'Ahmedabad', bhk: 3, maxPrice: 1200000000n });
    expect(threeBhk.map(item => item.project.slug)).toEqual(['amber-residence']);
    expect(threeBhk[0].starting.unit.bhk).toBe(3);
    expect(threeBhk[0].starting.totalPaise).toBe(1109500000n);
    expect(await searchProjects({ query: 'unlisted nowhere' })).toEqual([]);
  });

  it('calculates a quote on the server and rejects a package from another unit', async () => {
    const amber = await db.project.findUniqueOrThrow({ where: { slug: 'amber-residence' }, include: { unitTypes: { include: { packages: true } } } });
    const mira = await db.project.findUniqueOrThrow({ where: { slug: 'mira-courtyard' }, include: { unitTypes: { include: { packages: true } } } });
    const unit = amber.unitTypes.find(item => item.bhk === 2)!;
    const elevated = unit.packages.find(item => item.name === 'Elevated')!;
    const valid = await POST(new Request('http://localhost/api/pricing/estimate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ unitTypeId: unit.id, packageId: elevated.id, totalPaise: '1' }) }));
    expect(valid.status).toBe(200);
    expect((await valid.json()).totalPaise).toBe('869500000');
    const invalid = await POST(new Request('http://localhost/api/pricing/estimate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ unitTypeId: unit.id, packageId: mira.unitTypes[0].packages[0].id }) }));
    expect(invalid.status).toBe(404);
  });
});

describe('publishing and tenant isolation', () => {
  it('blocks a project without a valid furnished unit', async () => {
    const project = (await searchProjects({}))[0].project;
    expect(publicationIssues({ ...project, unitTypes: [] })).toContain('At least one available unit with an approved furnishing package and valid prices is required.');
    expect(publicationIssues(project)).toEqual([]);
  });

  it('never returns another developer organization project by changed ID', async () => {
    const amber = await db.project.findUniqueOrThrow({ where: { slug: 'amber-residence' } });
    const mira = await db.project.findUniqueOrThrow({ where: { slug: 'mira-courtyard' } });
    expect(await developerProject(mira.id, amber.organizationId)).toBeNull();
    expect((await developerProject(amber.id, amber.organizationId))?.id).toBe(amber.id);
  });
});
