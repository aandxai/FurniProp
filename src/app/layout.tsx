import type { Metadata } from 'next';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = { title: 'FurniProp | Fully furnished homes', description: 'Explore furnished homes, complete packages and transparent indicative pricing. Demo experience.' };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await currentUser();
  return <html lang="en"><body>
    <header className="site-header"><div className="container header-inner">
      <Link href="/" className="brand" aria-label="FurniProp home"><span className="brand-mark">F</span><span>FurniProp</span></Link>
      <nav className="nav-links" aria-label="Main navigation"><Link href="/properties">Explore homes</Link><Link href="/experience-zones">Experience zones</Link><Link href="/contact">Contact</Link></nav>
      <div className="header-actions"><span className="demo-pill">DEMO EXPERIENCE</span><Link className="btn btn-outline btn-small" href={user ? user.role === 'ADMIN' ? '/admin' : user.role === 'DEVELOPER' ? '/developer' : '/account' : '/login'}>{user ? 'My dashboard' : 'Sign in'}</Link></div>
    </div></header>
    <main>{children}</main>
    <footer className="footer"><div className="container"><div className="footer-grid"><div><div className="brand"><span className="brand-mark">F</span><span style={{color:'white'}}>FurniProp</span></div><p>Considered spaces. Complete homes.<br/>A fictional product demonstration for India.</p></div><div className="footer-links"><Link href="/properties">Explore homes</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link></div></div><div className="footer-note">All projects, prices, imagery, developers and availability on this site are DEMO content. No property is offered for sale.</div></div></footer>
  </body></html>;
}
