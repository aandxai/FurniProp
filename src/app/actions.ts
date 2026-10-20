'use server';

import { Role, ProjectStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { authenticate, createSession, currentUser, removeSession, requireRole, requireUser, safeNextPath } from '@/lib/auth';
import { db } from '@/lib/db';
import { developerProject, publicationIssues } from '@/lib/projects';

const email = z.string().trim().email().max(200);

export async function signIn(form: FormData) {
  const parsed = z.object({ email, password: z.string().min(1), next: z.string().optional() }).safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect('/login?error=invalid');
  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) redirect('/login?error=invalid');
  await createSession(user.id);
  redirect(safeNextPath(parsed.data.next ?? null));
}

export async function signUp(form: FormData) {
  const parsed = z.object({ name: z.string().trim().min(2).max(100), email, password: z.string().min(12).max(128) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect('/signup?error=invalid');
  const exists = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (exists) redirect('/signup?error=exists');
  const user = await db.user.create({ data: { name: parsed.data.name, email: parsed.data.email.toLowerCase(), passwordHash: await hash(parsed.data.password, 12), role: Role.BUYER } });
  await createSession(user.id);
  redirect('/account');
}

export async function demoSignIn(role: Role) {
  if (process.env.DEMO_MODE !== 'true' || process.env.NODE_ENV === 'production') redirect('/login');
  const address = role === Role.ADMIN ? 'admin@demo.furniprop.local' : role === Role.DEVELOPER ? 'developer@demo.furniprop.local' : 'buyer@demo.furniprop.local';
  const user = await db.user.findUnique({ where: { email: address } });
  if (!user?.isDemo) redirect('/login');
  await createSession(user.id);
  redirect(role === Role.ADMIN ? '/admin' : role === Role.DEVELOPER ? '/developer' : '/account');
}

export async function signOut() { await removeSession(); redirect('/'); }

export async function toggleFavorite(form: FormData) {
  const user = await requireUser();
  const projectId = z.string().uuid().parse(form.get('projectId'));
  const project = await db.project.findFirst({ where: { id: projectId, status: ProjectStatus.PUBLISHED,
    ...(process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production' ? {} : { isDemo: false }) } });
  if (!project) redirect('/properties');
  const existing = await db.favorite.findUnique({ where: { userId_projectId: { userId: user.id, projectId } } });
  if (existing) await db.favorite.delete({ where: { userId_projectId: { userId: user.id, projectId } } });
  else await db.favorite.create({ data: { userId: user.id, projectId } });
  revalidatePath('/account');
  revalidatePath(`/properties/${project.slug}`);
}

export async function submitInquiry(form: FormData) {
  const parsed = z.object({
    projectId: z.string().uuid(), name: z.string().trim().min(2).max(100), email,
    phone: z.string().regex(/^\+?[0-9 ]{10,16}$/), message: z.string().max(1000).optional(), consent: z.literal('on'),
  }).safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect('/contact?error=invalid');
  const project = await db.project.findFirst({ where: { id: parsed.data.projectId, status: ProjectStatus.PUBLISHED,
    ...(process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production' ? {} : { isDemo: false }) } });
  if (!project) redirect('/properties');
  const recent = await db.inquiry.findFirst({ where: { projectId: project.id, email: parsed.data.email.toLowerCase(), createdAt: { gte: new Date(Date.now() - 3600_000) } } });
  if (!recent) {
    const user = await currentUser();
    await db.inquiry.create({ data: { projectId: project.id, userId: user?.id, name: parsed.data.name,
      email: parsed.data.email.toLowerCase(), phone: parsed.data.phone, message: parsed.data.message,
      consentAt: new Date() } });
  }
  redirect(`/properties/${project.slug}?inquiry=sent`);
}

export async function createDraft(form: FormData) {
  const user = await requireRole(Role.DEVELOPER);
  if (!user.organizationId) redirect('/developer');
  const parsed = z.object({ name: z.string().trim().min(3).max(100), city: z.string().trim().min(2).max(80), locality: z.string().trim().min(2).max(80), address: z.string().trim().min(10).max(200), description: z.string().trim().min(20).max(2000) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect('/developer/projects?error=invalid');
  const slug = `${parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${randomBytes(3).toString('hex')}`;
  await db.project.create({ data: { ...parsed.data, slug, organizationId: user.organizationId, status: ProjectStatus.DRAFT,
    isDemo: true, image: '/scenes/amber-standard.svg', imageLabel: 'Conceptual illustration', mediaSource: 'Original FurniProp demo illustration', amenities: [] } });
  revalidatePath('/developer');
  redirect('/developer/projects');
}

export async function addUnit(form: FormData) {
  const user = await requireRole(Role.DEVELOPER);
  const projectId = z.string().uuid().parse(form.get('projectId'));
  const project = await developerProject(projectId, user.organizationId ?? '');
  if (!project || project.status === ProjectStatus.PUBLISHED) redirect('/developer/projects');
  const parsed = z.object({ name: z.string().trim().min(3).max(80), bhk: z.coerce.number().int().min(1).max(6), area: z.coerce.number().int().min(100).max(20000), baseRupees: z.coerce.bigint().positive(), available: z.coerce.number().int().min(0).max(1000) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect(`/developer/projects/${projectId}?error=unit`);
  await db.unitType.create({ data: { projectId, name: parsed.data.name, slug: `${parsed.data.bhk}-bhk-${randomBytes(3).toString('hex')}`, bhk: parsed.data.bhk,
    carpetAreaSqft: parsed.data.area, basePricePaise: parsed.data.baseRupees * 100n, availableUnits: parsed.data.available } });
  revalidatePath(`/developer/projects/${projectId}`);
}

export async function addPackage(form: FormData) {
  const user = await requireRole(Role.DEVELOPER);
  const projectId = z.string().uuid().parse(form.get('projectId'));
  const unitTypeId = z.string().uuid().parse(form.get('unitTypeId'));
  const project = await developerProject(projectId, user.organizationId ?? '');
  const unit = project?.unitTypes.find(item => item.id === unitTypeId);
  if (!project || !unit || project.status === ProjectStatus.PUBLISHED) redirect('/developer/projects');
  const parsed = z.object({ name: z.string().trim().min(3).max(80), priceRupees: z.coerce.bigint().positive(), inclusions: z.string().trim().min(10).max(1000) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect(`/developer/projects/${projectId}?error=package`);
  await db.furnishingPackage.create({ data: { unitTypeId, name: parsed.data.name, tier: parsed.data.name, pricePaise: parsed.data.priceRupees * 100n,
    inclusions: parsed.data.inclusions.split(',').map(item => item.trim()).filter(Boolean), previewImage: '/scenes/amber-standard.svg',
    previewLabel: 'Conceptual illustration · DEMO', approved: true } });
  revalidatePath(`/developer/projects/${projectId}`);
}

export async function submitProject(form: FormData) {
  const user = await requireRole(Role.DEVELOPER);
  const projectId = z.string().uuid().parse(form.get('projectId'));
  const project = await developerProject(projectId, user.organizationId ?? '');
  if (!project || project.status !== ProjectStatus.DRAFT) redirect('/developer/projects');
  await db.project.update({ where: { id: projectId }, data: { status: ProjectStatus.SUBMITTED } });
  revalidatePath('/admin'); revalidatePath('/developer');
}

export async function publishProject(form: FormData) {
  await requireRole(Role.ADMIN);
  const projectId = z.string().uuid().parse(form.get('projectId'));
  const project = await db.project.findUnique({ where: { id: projectId }, include: { organization: true, unitTypes: { include: { packages: true } } } });
  if (!project) redirect('/admin/projects');
  if (project.status !== ProjectStatus.SUBMITTED) redirect('/admin/projects?error=status');
  const issues = publicationIssues(project);
  if (issues.length) redirect(`/admin/projects?error=invalid`);
  await db.project.update({ where: { id: projectId }, data: { status: ProjectStatus.PUBLISHED, publishedAt: new Date() } });
  revalidatePath('/properties'); revalidatePath('/admin');
}
