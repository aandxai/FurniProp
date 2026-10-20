import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProjectCard } from '@/components/ProjectCard';
import { signOut } from '@/app/actions';

export default async function Account() {
  const user = await requireUser();
  const [favorites, inquiries] = await Promise.all([
    db.favorite.findMany({ where: { userId: user.id }, include: { project: { include: { organization: true, unitTypes: { include: { packages: true } } } } } }),
    db.inquiry.findMany({where:{userId:user.id},include:{project:true},orderBy:{createdAt:'desc'}}),
  ]);
  return <div className="container"><div className="page-top"><span className="eyebrow">Your space</span><h1>Hello, {user.name.split(' ')[0]}.</h1><p className="lead">Your saved homes and inquiries in one place.</p><form action={signOut}><button className="btn btn-outline btn-small">Sign out</button></form></div><section className="section" style={{paddingTop:5}}><div className="section-head"><div><span className="eyebrow">Your shortlist</span><h2>Saved homes</h2></div></div>{favorites.length ? <div className="cards">{favorites.filter(item=>item.project.status==='PUBLISHED').map(item=><ProjectCard key={item.projectId} project={item.project}/>)}</div> : <div className="empty-state"><h3>No saved homes yet</h3><p className="muted">Save a project to keep it close while you explore.</p><Link href="/properties" className="btn btn-primary">Explore homes</Link></div>}</section><section className="section" style={{paddingTop:0}}><div className="section-head"><div><span className="eyebrow">Conversations</span><h2>Your inquiries</h2></div></div>{inquiries.length ? <div className="panel">{inquiries.map(item=><div className="unit-row" key={item.id}><div><strong>{item.project.name}</strong><small>Sent {item.createdAt.toLocaleDateString('en-IN',{timeZone:'Asia/Kolkata'})}</small></div><span className="chip">Received · DEMO</span></div>)}</div> : <div className="empty-state"><p className="muted">You have not made an inquiry yet.</p></div>}</section></div>;
}
