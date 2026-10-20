import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Boxes, Sofa } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { searchProjects } from '@/lib/projects';

export default async function Home() {
  const featured = (await searchProjects({})).slice(0, 3);
  return <>
    <section className="hero"><div className="container hero-grid"><div className="hero-copy"><span className="eyebrow">A complete home starts here</span><h1>More than a home.<br/><em>Everything in it.</em></h1><p className="lead">Discover fully furnished homes with the details that matter: the space, the furniture and the price, all in one place.</p>
      <form action="/properties" className="hero-search"><input name="query" placeholder="Search projects or localities" aria-label="Search projects or localities" /><button className="btn btn-primary" type="submit">Explore homes <ArrowRight size={16}/></button></form><p className="tiny muted" style={{marginTop:14}}>Currently showing fictional DEMO listings in Ahmedabad.</p></div>
      <div className="hero-art"><Image src="/scenes/amber-standard.svg" width={900} height={750} alt="Conceptual illustration of a furnished living room, demo content" priority unoptimized/><span className="art-label" style={{left:'auto',right:12}}>DEMO · Conceptual illustration</span><div className="floating-note"><strong>Designed to feel complete.</strong><span className="muted">See the furnished total before you enquire.</span></div></div>
    </div></section>
    <section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">Explore the collection</span><h2>Homes with everything in place</h2></div><Link href="/properties" className="text-link">View all homes <ArrowRight size={14} style={{display:'inline'}}/></Link></div><div className="cards">{featured.map(({project}) => <ProjectCard key={project.id} project={project}/>)}</div></div></section>
    <section className="section section-tint"><div className="container"><div className="section-head"><div><span className="eyebrow">The FurniProp approach</span><h2>A clearer way to choose a home</h2></div></div><div className="feature-grid"><div className="feature"><div className="feature-icon"><Sofa/></div><h3>Furnished from day one</h3><p>Browse homes paired with a complete furnishing package. See what is included in every option.</p></div><div className="feature"><div className="feature-icon"><Boxes/></div><h3>Explore your options</h3><p>Compare approved demo packages and see an indicative furnished price calculated by the server.</p></div><div className="feature"><div className="feature-icon"><BadgeCheck/></div><h3>Clarity in the details</h3><p>Understand visual labels, package inclusions and pricing assumptions before making an inquiry.</p></div></div></div></section>
    <section className="section"><div className="container" style={{textAlign:'center',maxWidth:800}}><span className="eyebrow">Your next chapter</span><h2 style={{margin:'15px 0'}}>Find a place that already feels like yours.</h2><p className="lead">A curated look at what fully furnished living could be. All content is fictional and for demonstration only.</p><Link href="/properties" className="btn btn-primary">Discover homes <ArrowRight size={16}/></Link></div></section>
  </>;
}
