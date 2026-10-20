import Link from 'next/link';
import { signUp } from '@/app/actions';

export default async function Signup({ searchParams }: {searchParams:Promise<{error?:string}>}) {
  const {error}=await searchParams;
  return <div className="container"><div className="auth-shell"><span className="eyebrow">A place for your plans</span><h1>Create your account</h1><div className="panel">{error && <div className="notice" style={{marginBottom:18}}>{error==='exists'?'An account with this email already exists.':'Check your details. Passwords need at least 12 characters.'}</div>}<form action={signUp}><label className="field">Full name<input name="name" required minLength={2} autoComplete="name"/></label><label className="field">Email<input name="email" type="email" required autoComplete="email"/></label><label className="field">Password<input name="password" type="password" required minLength={12} autoComplete="new-password"/></label><button className="btn btn-primary" style={{width:'100%'}}>Create account</button></form><p className="tiny muted" style={{marginTop:19}}>Already have an account? <Link className="text-link" href="/login">Sign in</Link></p></div></div></div>;
}
