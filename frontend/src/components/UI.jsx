// src/components/UI.jsx
import { useEffect, useRef } from 'react';

/* ── Badge ─────────────────────────────────────────────── */
export function Badge({ variant = 'neutral', children }) {
  const styles = {
    active:    { background: 'rgba(34,197,94,.12)',  color: '#22c55e', border: '1px solid rgba(34,197,94,.2)' },
    paid:      { background: 'rgba(34,197,94,.12)',  color: '#22c55e', border: '1px solid rgba(34,197,94,.2)' },
    approved:  { background: 'rgba(34,197,94,.12)',  color: '#22c55e', border: '1px solid rgba(34,197,94,.2)' },
    pending:   { background: 'rgba(245,158,11,.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,.2)' },
    overdue:   { background: 'rgba(239,68,68,.12)',  color: '#ef4444', border: '1px solid rgba(239,68,68,.2)' },
    suspended: { background: 'rgba(239,68,68,.12)',  color: '#ef4444', border: '1px solid rgba(239,68,68,.2)' },
    rejected:  { background: 'rgba(239,68,68,.12)',  color: '#ef4444', border: '1px solid rgba(239,68,68,.2)' },
    neutral:   { background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border)' },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 99,
      fontSize: 10, fontWeight: 500, fontFamily: 'var(--mono)',
      ...(styles[variant] || styles.neutral),
    }}>
      {children}
    </span>
  );
}

/* ── PlanBadge ─────────────────────────────────────────── */
export function PlanBadge({ plan }) {
  const map = {
    Enterprise: { background: 'rgba(110,231,183,.12)', color: '#6ee7b7' },
    Growth:     { background: 'rgba(59,130,246,.12)',  color: '#3b82f6' },
    Starter:    { background: 'rgba(245,158,11,.12)',  color: '#f59e0b' },
  };
  const s = map[plan] || { background: 'var(--bg3)', color: 'var(--txt2)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 99,
      fontSize: 10, fontWeight: 500, fontFamily: 'var(--mono)',
      ...s,
    }}>
      {plan}
    </span>
  );
}

/* ── Spinner ───────────────────────────────────────────── */
export function Spinner({ size = 14 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: '2px solid var(--border)', borderTopColor: 'var(--accent)',
      borderRadius: '50%', animation: 'spin .6s linear infinite',
    }} />
  );
}

/* ── Button ────────────────────────────────────────────── */
export function Btn({ variant = 'default', size = 'md', disabled, loading, onClick, children, style }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    borderRadius: 'var(--r)', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font)', fontWeight: 500, transition: 'all .15s',
    border: '1px solid var(--border)', opacity: disabled ? .5 : 1,
  };
  const sizes = {
    sm: { padding: '4px 10px', fontSize: 10 },
    md: { padding: '6px 14px', fontSize: 12 },
    lg: { padding: '9px 18px', fontSize: 13 },
  };
  const variants = {
    default: { background: 'var(--bg3)', color: 'var(--txt)' },
    accent:  { background: 'var(--accent)', color: '#000', borderColor: 'var(--accent)' },
    danger:  { background: 'rgba(239,68,68,.1)', color: 'var(--red)', borderColor: 'rgba(239,68,68,.3)' },
    success: { background: 'rgba(34,197,94,.1)', color: '#22c55e', borderColor: 'rgba(34,197,94,.25)' },
    ghost:   { background: 'none', color: 'var(--txt2)', borderColor: 'transparent' },
  };
  return (
    <button
      onClick={!disabled && !loading ? onClick : undefined}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {loading && <Spinner size={11} />}
      {children}
    </button>
  );
}

/* ── Card ──────────────────────────────────────────────── */
export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--r2)', ...style,
    }}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions }) {
  return (
    <div style={{
      padding: '13px 16px', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--txt2)', fontFamily: 'var(--mono)', marginTop: 1 }}>{subtitle}</div>}
      </div>
      {actions}
    </div>
  );
}

/* ── Metric Card ───────────────────────────────────────── */
export function MetricCard({ label, value, delta, deltaUp }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--r2)', padding: 16,
    }}>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt2)', marginBottom: 8, fontFamily: 'var(--mono)' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.8px' }}>{value}</div>
      {delta && (
        <div style={{ fontSize: 11, marginTop: 5, color: deltaUp ? 'var(--green)' : 'var(--red)' }}>{delta}</div>
      )}
    </div>
  );
}

/* ── Modal ─────────────────────────────────────────────── */
export function Modal({ open, onClose, title, subtitle, children, width = 440 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 28, width, maxWidth: '95vw',
        maxHeight: '80vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 16,
        animation: 'fadeIn .15s ease',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.3px' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: 'var(--txt2)', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Field ─────────────────────────────────────────────── */
export function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 10, color: 'var(--txt2)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: .5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: 'var(--bg3)', border: '1px solid var(--border)',
  borderRadius: 'var(--r)', padding: '8px 11px', fontSize: 12,
  color: 'var(--txt)', outline: 'none', width: '100%', transition: 'border .2s',
};

export function Input(props) {
  return <input style={inputStyle} {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select style={{ ...inputStyle, cursor: 'pointer' }} {...props}>
      {children}
    </select>
  );
}

export function Textarea(props) {
  return <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.5 }} {...props} />;
}

/* ── Toast ─────────────────────────────────────────────── */
let _setToast;
export function setToast(msg, type = 'ok') {
  _setToast?.({ msg, type, id: Date.now() });
}

export function ToastContainer() {
  const [toast, setToastState] = useRef(null).current || (() => {
    const ref = useRef(null);
    return ref;
  })();

  // simpler approach
  const [t, setT] = useRef(null).current !== undefined
    ? [null, () => {}]
    : [null, () => {}];

  return null; // handled by useToast hook instead
}

/* ── Avatar ────────────────────────────────────────────── */
const COLORS = ['#6ee7b7','#3b82f6','#f59e0b','#a78bfa','#fb7185','#34d399','#60a5fa'];
export function Avatar({ name = '?', size = 28, radius = 8 }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: color + '22', color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * .32, fontWeight: 700, fontFamily: 'var(--mono)',
      flexShrink: 0, border: `1px solid ${color}44`,
    }}>
      {initials}
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────── */
export function Empty({ message = 'No data found' }) {
  return (
    <div style={{ textAlign: 'center', padding: 48, color: 'var(--txt3)' }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 10px', display: 'block', opacity: .3 }}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <p style={{ fontSize: 12 }}>{message}</p>
    </div>
  );
}

/* ── Table ─────────────────────────────────────────────── */
export function Table({ headers, children }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                fontSize: 9, textTransform: 'uppercase', letterSpacing: .8,
                color: 'var(--txt3)', textAlign: 'left', padding: '8px 14px',
                borderBottom: '1px solid var(--border)', fontWeight: 500,
                fontFamily: 'var(--mono)', whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, mono, style }) {
  return (
    <td style={{
      padding: '10px 14px', borderBottom: '1px solid var(--border)',
      color: 'var(--txt)', fontSize: 12,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      fontFamily: mono ? 'var(--mono)' : 'var(--font)',
      ...style,
    }}>
      {children}
    </td>
  );
}
