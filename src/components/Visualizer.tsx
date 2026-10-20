'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type Package = { id:string; name:string; inclusions:string[]; image:string|null; label:string|null; fallbackPrice:string };
type Estimate = { propertyPaise:string; furnishingPaise:string; taxAndFeesPaise:string; totalPaise:string; disclaimer:string; priceLastUpdated:string };

function money(paise:string) {
  const rupees=BigInt(paise)/100n;
  if (rupees>=10000000n) { const x=(rupees*100n+500000n)/10000000n; return `₹${x/100n}.${String(x%100n).padStart(2,'0')} Cr`; }
  if (rupees>=100000n) { const x=(rupees*100n+5000n)/100000n; return `₹${x/100n}.${String(x%100n).padStart(2,'0')} L`; }
  return `₹${rupees.toLocaleString('en-IN')}`;
}

export function Visualizer({unitTypeId,projectSlug,packages,initial}: {unitTypeId:string;projectSlug:string;packages:Package[];initial:Estimate}) {
  const [selected,setSelected]=useState(packages[0]?.id ?? '');
  const [estimate,setEstimate]=useState<Estimate|null>(initial);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const selectedPackage=packages.find(pkg=>pkg.id===selected);
  async function selectPackage(id:string) {
    setSelected(id); setEstimate(null); setLoading(true); setError('');
    try {
      const response=await fetch('/api/pricing/estimate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({unitTypeId,packageId:id})});
      if (!response.ok) throw new Error('This package is not currently available.');
      setEstimate(await response.json());
    } catch { setError('Could not calculate a price right now. Please try again.'); }
    finally { setLoading(false); }
  }
  return <div className="visual-grid"><div><div className="visual-image">{selectedPackage?.image ? <Image src={selectedPackage.image} width={1000} height={690} alt={`${selectedPackage.name} conceptual furnished room illustration`} unoptimized/> : <div className="empty-state" style={{minHeight:470}}>Visual preview not available for this combination.</div>}<span className="art-label">DEMO · {selectedPackage?.label ?? 'Conceptual illustration'}</span></div><div className="notice" style={{marginTop:15}}>This image is a conceptual furnished illustration, not a photograph or an exact representation of a physical unit. Package selection changes the approved demo illustration and server-calculated indicative price.</div><h2 style={{fontSize:30,marginTop:32}}>Included in this look</h2><div className="panel"><ul style={{margin:0,paddingLeft:20,lineHeight:2}}>{selectedPackage?.inclusions.map(item=><li key={item}>{item}</li>)}</ul></div></div>
    <aside><div className="panel sticky"><span className="eyebrow">Shape your space</span><h3 style={{marginTop:11}}>Choose a furnishing package</h3><p className="muted tiny">Approved DEMO combinations for this unit type.</p>{packages.map(pkg=><label className="package-option" key={pkg.id}><input type="radio" name="package" value={pkg.id} checked={selected===pkg.id} onChange={()=>selectPackage(pkg.id)}/><strong>{pkg.name}</strong><span className="muted tiny" style={{display:'block',margin:'5px 0 0 25px'}}>Furnishing from {pkg.fallbackPrice}</span></label>)}
      <div className="price-breakdown"><span className="eyebrow">Indicative furnished price</span>{loading && <p className="muted">Calculating…</p>}{error && <div className="notice">{error}</div>}{estimate && <><div className="price-line"><span>Property</span><strong>{money(estimate.propertyPaise)}</strong></div><div className="price-line"><span>{selectedPackage?.name} furnishing</span><strong>{money(estimate.furnishingPaise)}</strong></div><div className="price-line"><span>Taxes & fees</span><strong>Excluded</strong></div><div className="price-line total"><span>Furnished total</span><span>{money(estimate.totalPaise)}</span></div><p className="tiny muted">{estimate.disclaimer}<br/>Price updated {new Date(estimate.priceLastUpdated).toLocaleDateString('en-IN',{timeZone:'Asia/Kolkata'})}.</p></>}</div><div className="stack"><Link className="btn btn-primary" href={`/properties/${projectSlug}#inquiry`}>Request information</Link><Link className="btn btn-light" href={`/properties/${projectSlug}`}>Back to project</Link></div><p className="tiny muted" style={{marginTop:15}}>Saving configurations and final quotes are planned for a later milestone.</p></div></aside></div>;
}
