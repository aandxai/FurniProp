import { ProjectStatus, type Prisma } from '@prisma/client';
import { db } from './db';
import { furnishedTotal } from './money';

const detailInclude = {
  organization: true,
  unitTypes: { include: { packages: true }, orderBy: { carpetAreaSqft: 'asc' } },
} satisfies Prisma.ProjectInclude;

export type ProjectDetail = Prisma.ProjectGetPayload<{ include: typeof detailInclude }>;

export function startingOption(project: ProjectDetail, bhk?: number) {
  const options = project.unitTypes.flatMap(unit =>
    unit.availableUnits > 0 && (!bhk || unit.bhk === bhk) ? unit.packages.filter(pkg => pkg.approved).map(pkg => ({
      unit, pkg, totalPaise: furnishedTotal(unit.basePricePaise, pkg.pricePaise),
    })) : [],
  );
  options.sort((a, b) => a.totalPaise < b.totalPaise ? -1 : a.totalPaise > b.totalPaise ? 1 : 0);
  return options[0] ?? null;
}

export type SearchFilters = { city?: string; query?: string; bhk?: number; minPrice?: bigint; maxPrice?: bigint; sort?: string };

export async function searchProjects(filters: SearchFilters) {
  const projects = await db.project.findMany({
    where: {
      status: ProjectStatus.PUBLISHED,
      ...(process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production' ? {} : { isDemo: false }),
      ...(filters.city ? { city: { equals: filters.city, mode: 'insensitive' as const } } : {}),
      ...(filters.query ? { OR: [
        { name: { contains: filters.query, mode: 'insensitive' as const } },
        { locality: { contains: filters.query, mode: 'insensitive' as const } },
        { city: { contains: filters.query, mode: 'insensitive' as const } },
      ] } : {}),
    },
    include: detailInclude,
    orderBy: { publishedAt: 'desc' },
  });
  const matches = projects.map(project => ({ project, starting: startingOption(project, filters.bhk) }))
    .filter((item): item is { project: ProjectDetail; starting: NonNullable<ReturnType<typeof startingOption>> } => !!item.starting)
    .filter(({ starting }) =>
      (!filters.minPrice || starting.totalPaise >= filters.minPrice) &&
      (!filters.maxPrice || starting.totalPaise <= filters.maxPrice),
    );
  if (filters.sort === 'price-asc') matches.sort((a, b) => a.starting.totalPaise < b.starting.totalPaise ? -1 : 1);
  if (filters.sort === 'price-desc') matches.sort((a, b) => a.starting.totalPaise > b.starting.totalPaise ? -1 : 1);
  return matches;
}

export async function publishedProject(slug: string) {
  return db.project.findFirst({ where: { slug, status: ProjectStatus.PUBLISHED,
    ...(process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production' ? {} : { isDemo: false }) }, include: detailInclude });
}

export function publicationIssues(project: ProjectDetail): string[] {
  const issues: string[] = [];
  if (!project.name || !project.address || !project.description) issues.push('Project name, address and description are required.');
  if (!project.image || !project.imageLabel || !project.mediaSource) issues.push('Authorized media and its representation label are required.');
  if (!project.unitTypes.some(unit => unit.availableUnits > 0 && unit.basePricePaise > 0n && unit.packages.some(pkg => pkg.approved && pkg.pricePaise > 0n))) {
    issues.push('At least one available unit with an approved furnishing package and valid prices is required.');
  }
  return issues;
}

export async function developerProject(projectId: string, organizationId: string) {
  return db.project.findFirst({ where: { id: projectId, organizationId }, include: detailInclude });
}
