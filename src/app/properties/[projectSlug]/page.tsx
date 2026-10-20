import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin } from 'lucide-react';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatINR, furnishedTotal } from '@/lib/money';
import { publishedProject, startingOption } from '@/lib/projects';
import { submitInquiry, toggleFavorite } from '@/app/actions';

export default async function ProjectPage({ params, searchParams }: { params: Promise<{projectSlug:string}>, searchParams: Promise<{inquiry?:string}> }) {
  const { projectSlug } = await params;
  const project = await publishedProject(projectSlug);
  if (!project) notFound();
  const starting = startingOption(project);
  if (!starting) notFound();
  const user = await currentUser();
  const favorite = user ? await db.favorite.findUnique({ where: { userId_projectId: { userId: user.id, projectId: project.id } } }) : null;
  const { inquiry } = await searchParams;
  return <div className="container"><div className="page-top"><div className="crumbs"><Link href="/properties">Homes</Link><span>/</span><span>{project.name}</span></div><span className="eyebrow">Fully furnished · Fictional DEMO project</span><h1>{project.name}</h1><p className="card-meta"><MapPin size={16}/>{project.locality}, {project.city} · {project.organization.name}</p></div>
    <div className="detail-layout"><div><div className="detail-image"><Image src={project.image ?? '/scenes/amber-standard.svg'} width={1000} height={610} alt={`${project.name} conceptual furnished room illustration`} unoptimized/><span className="art-label">DEMO · {project.imageLabel ?? 'Conceptual illustration'}</span></div>
      <div className="detail-copy"><span className="eyebrow">About this home</span><h2>Imagine moving in, already at home.</h2><p>{project.description}</p><div className="notice">This is a fictional project. The illustration is conceptual, the address and availability are invented, and prices are illustrative only. No RERA verification is claimed.</div>
        <h2 style={{marginTop:34}}>Spaces & furnished packages</h2>{project.unitTypes.map(unit=><div className="unit-row" key={unit.id}><div><strong>{unit.name}</strong><small>{unit.carpetAreaSqft.toLocaleString('en-IN')} sq ft carpet · {unit.availableUnits} DEMO units · {unit.packages.filter(pkg=>pkg.approved).length} packages</small></div><div style={{textAlign:'right'}}><strong>{formatINR(furnishedTotal(unit.basePricePaise, unit.packages.filter(pkg=>pkg.approved).sort((a,b)=>a.pricePaise < b.pricePaise ? -1 : 1)[0]?.pricePaise ?? 0n))}</strong><Link className="text-link tiny" href={`/visualizer/${project.slug}/${unit.slug}`}>Explore options →</Link></div></div>)}
        <h2 style={{marginTop:33}}>Included details</h2><div className="details-chips">{project.amenities.map(item=><span className="chip" key={item}>{item}</span>)}</div><p className="tiny">Inclusions depend on the selected package. Stamp duty, registration, taxes and other statutory charges are not estimated in this demo.</p>
        <h2 style={{marginTop:33}}>Product quality & experience zones</h2><p>Verified product evidence and physical visit slots are not available for this fictional listing. FurniProp will show these only where real approved evidence and sites exist.</p>
      </div></div><aside><div className="panel sticky"><span className="eyebrow">Starting furnished total</span><div className="side-price">{formatINR(starting.totalPaise)}</div><p className="muted tiny">Includes {starting.pkg.name} furnishing package. Indicative DEMO price; taxes, registration and other charges excluded.</p><div className="stack"><Link className="btn btn-primary" href={`/visualizer/${project.slug}/${starting.unit.slug}`}>Explore visualizer <ArrowRight size={16}/></Link>
      <a className="btn btn-light" href="#inquiry">Request information</a>
      <form action={toggleFavorite}><input type="hidden" name="projectId" value={project.id}/><button className="btn btn-outline" style={{width:'100%'}} type="submit">{favorite ? '♥ Saved home' : '♡ Save home'}</button></form></div>
      <hr style={{border:0,borderTop:'1px solid var(--line)',margin:'22px 0'}}/><div id="inquiry"><h3>Ask about this home</h3>{inquiry === 'sent' && <div className="notice success">Your demo inquiry was recorded.</div>}<form action={submitInquiry}><input name="projectId" type="hidden" value={project.id}/><label className="field">Your name<input name="name" required minLength={2} defaultValue={user?.name ?? ''}/></label><label className="field">Email<input name="email" type="email" required defaultValue={user?.email ?? ''}/></label><label className="field">Phone<input name="phone" type="tel" required placeholder="10-digit number"/></label><label className="field">Message<textarea name="message" placeholder="Tell us what you would like to know"/></label><label className="field-check"><input name="consent" type="checkbox" required/><span>I consent to being contacted about this DEMO inquiry. See <Link className="text-link" href="/privacy">privacy</Link>.</span></label><button className="btn btn-primary" type="submit" style={{width:'100%'}}>Send inquiry</button></form></div>
    </div></aside></div></div>;
}
