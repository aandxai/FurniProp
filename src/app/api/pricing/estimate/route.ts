import { ProjectStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { furnishedTotal } from '@/lib/money';

const requestSchema = z.object({ unitTypeId: z.string().uuid(), packageId: z.string().uuid() });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_SELECTION' }, { status: 400 });
  const unit = await db.unitType.findFirst({ where: { id: parsed.data.unitTypeId, project: { status: ProjectStatus.PUBLISHED,
    ...(process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production' ? {} : { isDemo: false }) } }, include: { project: true } });
  if (!unit || unit.availableUnits < 1) return NextResponse.json({ error: 'UNIT_UNAVAILABLE' }, { status: 404 });
  const pkg = await db.furnishingPackage.findFirst({ where: { id: parsed.data.packageId, unitTypeId: unit.id, approved: true } });
  if (!pkg) return NextResponse.json({ error: 'PACKAGE_UNAVAILABLE' }, { status: 404 });
  const total = furnishedTotal(unit.basePricePaise, pkg.pricePaise);
  return NextResponse.json({ unitTypeId: unit.id, packageId: pkg.id, packageVersion: pkg.version,
    propertyPaise: unit.basePricePaise.toString(), furnishingPaise: pkg.pricePaise.toString(),
    taxAndFeesPaise: '0', totalPaise: total.toString(),
    disclaimer: 'Indicative DEMO price. Stamp duty, registration, taxes and other charges are excluded. Subject to availability.',
    priceLastUpdated: unit.project.updatedAt.toISOString() });
}
