import Link from 'next/link';
import { Role } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { signOut } from '@/app/actions';

export default async function DeveloperDashboard() {
  const user=await requireRole(Role.DEVELOPER);
  const orgId=user.organizationId ?? '';
  const [projects,leads]=await Promise.all([
    db.project.findMany({where:{organizationId:orgId},orderBy:{createdAt:'desc'}}),
    db.inquiry.findMany({where:{project:{organizationId:orgId}},include:{project:true},orderBy:{createdAt:'desc'},take:8}),
  ]);
  return <div className="container"><div className="page-top"><span className="eyebrow">Developer workspace · DEMO</span><h1>Welcome, {user.name}.</h1><p className="lead">Your organization&apos;s projects and inquiries, scoped to your account.</p><div className="demo-actions"><Link href="/developer/projects" className="btn btn-primary">Manage projects</Link><form action={signOut}><button className="btn btn-outline">Sign out</button></form></div></div><div className="dashboard-grid"><div className="stat"><strong>{projects.length}</strong><span>Projects in your organization</span></div><div className="stat"><strong>{projects.filter(item=>item.status==='PUBLISHED').length}</strong><span>Published projects</span></div><div className="stat"><strong>{leads.length}</strong><span>Recent inquiries</span></div></div><section className="section" style={{paddingTop:0}}><div className="section-head"><h2>Your projects</h2><Link className="text-link" href="/developer/projects">View all →</Link></div><div className="panel">{projects.map(project=><div className="unit-row" key={project.id}><div><strong><Link href={`/developer/projects/${project.id}`}>{project.name}</Link></strong><small>{project.locality}, {project.city}</small></div><span className="chip">{project.status}</span></div>)}{!projects.length && <p className="muted">No projects yet.</p>}</div></section><section className="section" style={{paddingTop:0}}><h2>Recent inquiries</h2><div className="panel">{leads.map(lead=><div className="unit-row" key={lead.id}><div><strong>{lead.name}</strong><small>{lead.project.name} · {lead.email}</small></div><span className="chip">NEW</span></div>)}{!leads.length && <p className="muted">No inquiries yet.</p>}</div></section></div>;
}
