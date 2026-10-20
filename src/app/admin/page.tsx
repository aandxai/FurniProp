import Link from 'next/link';
import { Role } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { signOut } from '@/app/actions';

export default async function Admin() {
  await requireRole(Role.ADMIN);
  const [projects,organizations,inquiries]=await Promise.all([db.project.count(),db.organization.count(),db.inquiry.count()]);
  const pending=await db.project.findMany({where:{status:'SUBMITTED'},include:{organization:true},orderBy:{updatedAt:'desc'},take:8});
  return <div className="container"><div className="page-top"><span className="eyebrow">Operations command center · DEMO</span><h1>Platform overview</h1><p className="lead">Actual counts from this local demo database. No live production activity is represented.</p><div className="demo-actions"><Link className="btn btn-primary" href="/admin/projects">Review projects</Link><form action={signOut}><button className="btn btn-outline">Sign out</button></form></div></div><div className="dashboard-grid"><div className="stat"><strong>{projects}</strong><span>Projects · local DEMO data</span></div><div className="stat"><strong>{organizations}</strong><span>Developer organizations · DEMO</span></div><div className="stat"><strong>{inquiries}</strong><span>Inquiries recorded locally</span></div></div><section className="section" style={{paddingTop:0}}><div className="section-head"><h2>Awaiting review</h2><Link className="text-link" href="/admin/projects">All projects →</Link></div><div className="panel">{pending.map(project=><div className="unit-row" key={project.id}><div><strong>{project.name}</strong><small>{project.organization.name}</small></div><span className="chip">SUBMITTED</span></div>)}{!pending.length && <p className="muted">No projects awaiting review.</p>}</div></section></div>;
}
