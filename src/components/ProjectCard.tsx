import Image from 'next/image';
import Link from 'next/link';
import { MapPin, MoveUpRight } from 'lucide-react';
import type { ProjectDetail } from '@/lib/projects';
import { formatINR } from '@/lib/money';
import { startingOption } from '@/lib/projects';

export function ProjectCard({ project, starting: chosen }: { project: ProjectDetail; starting?: NonNullable<ReturnType<typeof startingOption>> }) {
  const starting = chosen ?? startingOption(project);
  if (!starting) return null;
  return <article className="card"><Link href={`/properties/${project.slug}`} className="card-art" aria-label={`View ${project.name}`}>
    <Image src={project.image ?? '/scenes/amber-standard.svg'} width={640} height={430} alt={`${project.name} conceptual furnished room illustration`} unoptimized />
    <span className="art-label">DEMO · {project.imageLabel ?? 'Conceptual illustration'}</span>
  </Link><div className="card-body"><div className="card-top"><span className="eyebrow">Fully furnished · DEMO</span><MoveUpRight size={18} aria-hidden="true" /></div>
    <h3><Link href={`/properties/${project.slug}`}>{project.name}</Link></h3>
    <div className="card-meta"><MapPin size={14} aria-hidden="true" />{project.locality}, {project.city}</div>
    <div className="details-chips"><span className="chip">{starting.unit.bhk} BHK</span><span className="chip">{starting.unit.carpetAreaSqft.toLocaleString('en-IN')} sq ft</span></div>
    <div className="card-price"><small>Starting furnished total</small><strong>{formatINR(starting.totalPaise)}</strong><small>Includes {starting.pkg.name} package · indicative, other charges excluded</small></div>
  </div></article>;
}
