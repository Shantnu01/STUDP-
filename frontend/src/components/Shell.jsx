// src/components/Shell.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  {
    section: 'Overview',
    items: [
      { id: 'dashboard',  label: 'Dashboard',  path: '/',           icon: <GridIcon /> },
      { id: 'analytics',  label: 'Analytics',  path: '/analytics',  icon: <ChartIcon /> },
    ],
  },
  {
    section: 'Schools',
    items: [
      { id: 'schools',    label: 'All Schools', path: '/schools',   icon: <SchoolIcon /> },
      { id: 'requests',   label: 'Requests',    path: '/requests',  icon: <ClockIcon />, badge: 'reqBadge' },
    ],
  },
  {
    section: 'Finance',
    items: [
      { id: 'billing',    label: 'Billing',     path: '/billing',   icon: <CardIcon /> },
      { id: 'invoices',   label: 'Invoices',    path: '/invoices',  icon: <DocIcon /> },
      { id: 'messages',   label: 'Messages',    path: '/messages',  icon: <MsgIcon />,  badge: 'msgBadge' },
    ],
  },
  {
    section: 'System',
    items: [
      { id: 'settings',   label: 'Settings',    path: '/settings',  icon: <GearIcon /> },
    ],
  },
];

export default function Shell({ reqCount = 0, msgCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const initials = (user?.email || 'A').split('@')[0].slice(0, 2).toUpperCase();

  function isActive(path) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  function getBadge(key) {
    if (key === 'reqBadge') return reqCount;
    if (key === 'msgBadge') return msgCount;
    return 0;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── RAIL ── */}
      <div style={{
        width: 52, flexShrink: 0, background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '12px 0', gap: 3,
      }}>
        <div style={{
          width: 30, height: 30, background: 'var(--accent)', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>E</span>
        </div>

        {NAV.flatMap(g => g.items).map(item => {
          const active = isActive(item.path);
          const count  = item.badge ? getBadge(item.badge) : 0;
          return (
            <div
              key={item.id}
              title={item.label}
              onClick={() => navigate(item.path)}
              style={{
                width: 36, height: 36, borderRadius: 'var(--r)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
                color: active ? 'var(--accent)' : 'var(--txt3)',
                background: active ? 'var(--bg3)' : 'transparent',
                transition: 'all .15s',
              }}
            >
              {item.icon}
              {count > 0 && (
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--red)', position: 'absolute',
                  top: 6, right: 6, border: '1.5px solid var(--bg2)',
                }} />
              )}
            </div>
          );
        })}

        <div style={{ flex: 1 }} />
        <div
          onClick={logout}
          title="Sign out"
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#000', cursor: 'pointer',
          }}
        >
          {initials}
        </div>
      </div>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 204, flexShrink: 0, background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>EduSync</div>
          <div style={{ fontSize: 11, color: 'var(--txt2)', marginTop: 2, fontFamily: 'var(--mono)' }}>
            {user?.email}
          </div>
        </div>

        <div style={{ padding: '10px 8px', flex: 1, overflowY: 'auto' }}>
          {NAV.map(group => (
            <div key={group.section}>
              <div style={{
                fontSize: 9, textTransform: 'uppercase', letterSpacing: 1,
                color: 'var(--txt3)', padding: '14px 8px 5px',
                fontFamily: 'var(--mono)',
              }}>
                {group.section}
              </div>
              {group.items.map(item => {
                const active = isActive(item.path);
                const count  = item.badge ? getBadge(item.badge) : 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '7px 9px', borderRadius: 'var(--r)',
                      cursor: 'pointer', fontSize: 12, marginBottom: 1,
                      color: active ? 'var(--accent)' : 'var(--txt2)',
                      background: active ? 'var(--bg3)' : 'transparent',
                      fontWeight: active ? 500 : 400,
                      transition: 'all .15s',
                    }}
                  >
                    <span style={{ width: 13, height: 13, flexShrink: 0 }}>{item.icon}</span>
                    {item.label}
                    {count > 0 && (
                      <span style={{
                        marginLeft: 'auto', background: 'var(--red)', color: '#fff',
                        fontSize: 9, borderRadius: 99, padding: '1px 5px',
                        fontWeight: 600, fontFamily: 'var(--mono)',
                      }}>
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={logout}
            style={{
              width: '100%', background: 'none', border: '1px solid var(--border)',
              borderRadius: 'var(--r)', padding: '6px 10px', fontSize: 11,
              color: 'var(--txt2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 7,
              transition: 'all .15s',
            }}
          >
            <LogoutIcon /> Sign out
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg)' }}>
        <Outlet />
      </div>
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────── */
function GridIcon()   { return <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor"/></svg>; }
function ChartIcon()  { return <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M2 12l3-4 3 2 3-5 3 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function SchoolIcon() { return <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><rect x="2" y="6" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M5 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2"/></svg>; }
function ClockIcon()  { return <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M8 5v4l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function CardIcon()   { return <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 9h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function DocIcon()    { return <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M3 3h10v10H3z" stroke="currentColor" strokeWidth="1.2"/><path d="M6 7h4M6 10h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function MsgIcon()    { return <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M2 3h12v8H9l-3 2v-2H2V3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>; }
function GearIcon()   { return <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function LogoutIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 3H3v10h3M10 5l3 3-3 3M13 8H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
