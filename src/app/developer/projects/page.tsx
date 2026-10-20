import Link from 'next/link';
import { Role } from '@prisma/client';
import { createDraft } from '@/app/actions';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function DeveloperProjects({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const user=await requireRole(Role.DEVELOPER);
  const projects=await db.project.findMany({where:{organizationId:user.organizationId ?? ''},orderBy:{createdAt:'desc'}});
  const {error}=await searchParams;
  return <div className="container"><div className="page-top"><div className="crumbs"><Link href="/developer">Developer</Link><span>/</span><span>Projects</span></div><span className="eyebrow">Developer workspace</span><h1>Your projects</h1><p className="lead">Create a fictional project draft and submit it for demo admin review.</p></div><div className="detail-layout"><div><div className="panel">{projects.map(project=><div className="unit-row" key={project.id}><div><strong><Link href={`/developer/projects/${project.id}`}>{project.name}</Link></strong><small>{project.locality}, {project.city}</small></div><span className="chip">{project.status}</span></div>)}{!projects.length && <p className="muted">No projects yet.</p>}</div></div><aside><div className="panel"><h3>Create DEMO draft</h3>{error && <div className="notice">Please check the project details.</div>}<form action={createDraft}><label className="field">Project name<input name="name" required minLength={3}/></label><label className="field">City<input name="city" required minLength={2} defaultValue="Ahmedabad"/></label><label className="field">Locality<input name="locality" required minLength={2}/></label><label className="field">Fictional address<input name="address" required minLength={10}/></label><label className="field">Description<textarea name="description" required minLength={20}/></label><button className="btn btn-primary" style={{width:'100%'}}>Create draft</button></form><p className="tiny muted" style={{marginTop:12}}>New drafts use an original conceptual illustration and cannot represent real inventory.</p></div></aside></div></div>;
}
