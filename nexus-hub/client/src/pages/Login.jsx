import { useState } from 'react';
import { authAPI } from '../api/client';
import useStore from '../store/useStore';

export default function Login() {
  const { setAuth, showToast } = useStore();
  const [mode, setMode]   = useState('login');
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]  = useState('');

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const fn   = mode === 'login' ? authAPI.login : authAPI.register;
      const data = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fn(data);
      setAuth(res.data.user, res.data.token);
      showToast(`✓ Welcome${mode === 'login' ? ' back' : ''}, ${res.data.user.name}!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page hex-bg">
      <div className="login-box fade-up">
        {/* Logo */}
        <div className="login-logo">NEXUS</div>
        <div className="login-sub">Automation Hub — {mode === 'login' ? 'Sign in to continue' : 'Create your account'}</div>

        {/* Form */}
        {mode === 'register' && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="input" name="name" placeholder="Naga Kumar" value={form.name} onChange={change} />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="input" name="email" type="email" placeholder="naga@company.com" value={form.email} onChange={change} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={change}
            onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: 'var(--red)', marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button className="btn btn-primary" style={{ width: '100%', padding: '10px', justifyContent: 'center', marginBottom: 14 }} onClick={submit} disabled={loading}>
          {loading ? '...' : mode === 'login' ? '→ Sign In' : '→ Create Account'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--t3)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={{ color: 'var(--cyan)', cursor: 'pointer', fontWeight: 700 }} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Register' : 'Sign in'}
          </span>
        </div>

        {/* Demo hint */}
        <div style={{ marginTop: 20, padding: '10px 12px', background: 'var(--s3)', borderRadius: 8, border: '1px solid var(--b1)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', marginBottom: 4 }}>DEMO CREDENTIALS</div>
          <div style={{ fontSize: 10, color: 'var(--t2)' }}>Email: <span style={{ color: 'var(--cyan)' }}>demo@nexus.io</span></div>
          <div style={{ fontSize: 10, color: 'var(--t2)' }}>Password: <span style={{ color: 'var(--cyan)' }}>demo123</span></div>
        </div>
      </div>
    </div>
  );
}
