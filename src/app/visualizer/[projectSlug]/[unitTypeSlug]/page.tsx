import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Visualizer } from '@/components/Visualizer';
import { formatINR, furnishedTotal } from '@/lib/money';
import { publishedProject } from '@/lib/projects';
import { ImageVariantProvider } from '@/lib/visualizer';

export default async function VisualizerPage({params}: {params:Promise<{projectSlug:string;unitTypeSlug:string}>}) {
  const {projectSlug,unitTypeSlug}=await params;
  const project=await publishedProject(projectSlug);
  const unit=project?.unitTypes.find(item=>item.slug===unitTypeSlug && item.availableUnits>0);
  if (!project || !unit) notFound();
  const packages=unit.packages.filter(pkg=>pkg.approved).sort((a,b)=>a.pricePaise < b.pricePaise ? -1 : 1);
  if (!packages.length) notFound();
  const provider=new ImageVariantProvider(packages.map(pkg=>({packageId:pkg.id,previewImage:pkg.previewImage,previewLabel:pkg.previewLabel})));
  return <div className="container"><div className="page-top"><div className="crumbs"><Link href="/properties">Homes</Link><span>/</span><Link href={`/properties/${project.slug}`}>{project.name}</Link><span>/</span><span>Visualizer</span></div><span className="eyebrow">Image variant visualizer · DEMO</span><h1>Make room for your style.</h1><p className="lead">{project.name} · {unit.name} · {unit.carpetAreaSqft.toLocaleString('en-IN')} sq ft carpet</p><p className="tiny muted">Available mode: {provider.getCapabilities().modes.join(', ')}. No real-time 3D stream is connected.</p></div>
    <Visualizer unitTypeId={unit.id} projectSlug={project.slug} packages={packages.map(pkg=>({id:pkg.id,name:pkg.name,inclusions:pkg.inclusions,image:provider.applySelection(pkg.id)?.previewImage ?? null,label:provider.applySelection(pkg.id)?.previewLabel ?? null,fallbackPrice:formatINR(pkg.pricePaise)}))} initial={{propertyPaise:unit.basePricePaise.toString(),furnishingPaise:packages[0].pricePaise.toString(),taxAndFeesPaise:'0',totalPaise:furnishedTotal(unit.basePricePaise,packages[0].pricePaise).toString(),disclaimer:'Indicative DEMO price. Stamp duty, registration, taxes and other charges are excluded. Subject to availability.',priceLastUpdated:project.updatedAt.toISOString()}}/>
  </div>;
}
