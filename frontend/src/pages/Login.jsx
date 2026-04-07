// src/pages/Login.jsx
import { useState } from 'react';
import { auth, signInWithEmailAndPassword } from '../lib/firebase.js';
import { Spinner } from '../components/UI.jsx';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(110,231,183,.08) 0%, transparent 70%)',
    }}>
      <form onSubmit={handleLogin} style={{
        width: 360, background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 36, display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, background: 'var(--accent)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>E</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.4px' }}>EduSync</span>
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.3px' }}>Admin sign‑in</div>
            <div style={{ fontSize: 11, color: 'var(--txt2)', marginTop: 3 }}>Secure access · Firebase Auth</div>
          </div>
        </div>

        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, color: 'var(--txt2)', fontFamily: 'var(--mono)' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@edusync.in"
            required
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 'var(--r)', padding: '9px 12px', fontSize: 13,
              color: 'var(--txt)', outline: 'none', transition: 'border .2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, color: 'var(--txt2)', fontFamily: 'var(--mono)' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 'var(--r)', padding: '9px 12px', fontSize: 13,
              color: 'var(--txt)', outline: 'none', transition: 'border .2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Button */}
        <button type="submit" disabled={loading} style={{
          background: 'var(--accent)', color: '#000', border: 'none',
          borderRadius: 'var(--r)', padding: 10, fontSize: 13, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'opacity .2s',
        }}>
          {loading && <Spinner size={13} />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        {error && (
          <div style={{ color: 'var(--red)', fontSize: 11, textAlign: 'center' }}>{error}</div>
        )}

        <div style={{ fontSize: 11, color: 'var(--txt3)', textAlign: 'center', fontFamily: 'var(--mono)' }}>
          Connect Firebase & create an admin user to begin
        </div>
      </form>
    </div>
  );
}
