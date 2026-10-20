import Link from 'next/link';
import { Role } from '@prisma/client';
import { demoSignIn, signIn } from '@/app/actions';

export default async function Login({ searchParams }: {searchParams: Promise<{error?:string; next?:string}>}) {
  const { error, next } = await searchParams;
  const demoEnabled = process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production';
  return <div className="container"><div className="auth-shell"><span className="eyebrow">Welcome back</span><h1>Sign in to FurniProp</h1><div className="panel">{error && <div className="notice" style={{marginBottom:18}}>Please check your email and password.</div>}<form action={signIn}><input type="hidden" name="next" value={next ?? '/account'}/><label className="field">Email<input type="email" name="email" required autoComplete="email"/></label><label className="field">Password<input type="password" name="password" required autoComplete="current-password"/></label><button className="btn btn-primary" style={{width:'100%'}}>Sign in</button></form><p className="tiny muted" style={{marginTop:19}}>New here? <Link className="text-link" href="/signup">Create an account</Link></p>
      {demoEnabled && <div style={{borderTop:'1px solid var(--line)',paddingTop:20,marginTop:24}}><span className="eyebrow">Development demo only</span><p className="tiny muted" style={{margin:'9px 0'}}>Explore role-scoped sample dashboards. These shortcuts are disabled in production.</p><div className="demo-actions"><form action={demoSignIn.bind(null,Role.BUYER)}><button className="btn btn-light btn-small">Buyer demo</button></form><form action={demoSignIn.bind(null,Role.DEVELOPER)}><button className="btn btn-light btn-small">Developer demo</button></form><form action={demoSignIn.bind(null,Role.ADMIN)}><button className="btn btn-light btn-small">Admin demo</button></form></div></div>}</div></div></div>;
}
