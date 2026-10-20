import { Role } from '@prisma/client';
import { publishProject } from '@/app/actions';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { publicationIssues } from '@/lib/projects';

export default async function AdminProjects({searchParams}:{searchParams:Promise<{error?:string}>}) {
  await requireRole(Role.ADMIN);
  const projects=await db.project.findMany({include:{organization:true,unitTypes:{include:{packages:true}}},orderBy:{createdAt:'desc'}});
  const {error}=await searchParams;
  return <div className="container"><div className="page-top"><span className="eyebrow">Admin moderation · DEMO</span><h1>Project approvals</h1><p className="lead">Publishing validates furnished inventory and media disclosures.</p></div>{error && <div className="notice" style={{marginBottom:20}}>Publication blocked: {error==='status'?'the project must be submitted first.':'this project is missing required listing details.'} Review the checks shown below.</div>}<div className="panel" style={{marginBottom:70,overflowX:'auto'}}><table className="data-table"><thead><tr><th>Project</th><th>Developer</th><th>Status</th><th>Publication checks</th><th>Action</th></tr></thead><tbody>{projects.map(project=>{const issues=publicationIssues(project);return <tr key={project.id}><td><strong>{project.name}</strong><br/><span className="tiny muted">{project.locality}, {project.city}</span></td><td>{project.organization.name}</td><td><span className="chip">{project.status}</span></td><td>{issues.length ? <span className="tiny" style={{color:'#a34a35'}}>{issues.join(' ')}</span> : <span className="tiny" style={{color:'#2b6941'}}>Ready for DEMO publication</span>}</td><td>{project.status==='SUBMITTED' && <form action={publishProject}><input type="hidden" name="projectId" value={project.id}/><button className="btn btn-primary btn-small" disabled={issues.length>0}>Publish</button></form>}</td></tr>})}</tbody></table></div></div>;
}
