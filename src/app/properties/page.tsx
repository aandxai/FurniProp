import Link from 'next/link';
import { ProjectCard } from '@/components/ProjectCard';
import { searchProjects } from '@/lib/projects';

type Params = Promise<Record<string, string | string[] | undefined>>;
function val(value: string | string[] | undefined) { return typeof value === 'string' ? value : ''; }
function rupees(value: string) { return /^\d+$/.test(value) ? BigInt(value) * 100n : undefined; }

export default async function Properties({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const query = val(params.query), city = val(params.city), bhk = val(params.bhk), minPrice = val(params.minPrice), maxPrice = val(params.maxPrice), sort = val(params.sort);
  const results = await searchProjects({ query, city, bhk: /^[1-6]$/.test(bhk) ? Number(bhk) : undefined, minPrice: rupees(minPrice), maxPrice: rupees(maxPrice), sort });
  return <div className="container"><div className="page-top"><span className="eyebrow">The curated collection · DEMO</span><h1>Explore furnished homes</h1><p className="lead">Every listed starting price includes an approved furnishing package.</p></div>
    <div className="search-layout"><form className="panel" action="/properties"><h3>Refine your search</h3>
      <label className="field">Project or locality<input name="query" defaultValue={query} placeholder="What are you looking for?" /></label>
      <label className="field">City<select name="city" defaultValue={city}><option value="">All cities</option><option value="Ahmedabad">Ahmedabad</option></select></label>
      <label className="field">Bedrooms<select name="bhk" defaultValue={bhk}><option value="">Any BHK</option>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} BHK</option>)}</select></label>
      <label className="field">Minimum furnished price (₹)<input name="minPrice" type="number" min="0" defaultValue={minPrice} placeholder="e.g. 7500000" /></label>
      <label className="field">Maximum furnished price (₹)<input name="maxPrice" type="number" min="0" defaultValue={maxPrice} placeholder="e.g. 15000000" /></label>
      <label className="field">Sort by<select name="sort" defaultValue={sort}><option value="">Recently added</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
      <button className="btn btn-primary" type="submit" style={{width:'100%'}}>Show homes</button><Link href="/properties" className="text-link tiny" style={{display:'block',textAlign:'center',marginTop:15}}>Clear filters</Link>
    </form><div><div className="results-head"><h2>{results.length} furnished {results.length === 1 ? 'home' : 'homes'}</h2><span className="demo-pill">FICTIONAL DEMO CONTENT</span></div>
      {results.length ? <div className="results-list">{results.map(({project,starting})=><ProjectCard key={project.id} project={project} starting={starting}/>)}</div> : <div className="empty-state"><h3>No homes match these filters</h3><p className="muted">Try a different budget, city or bedroom count.</p><Link href="/properties" className="btn btn-outline">Reset filters</Link></div>}
    </div></div></div>;
}
