// src/pages/Invoices.jsx
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { toast } from '../hooks/useToast.jsx';
import { Card, CardHeader, Badge, PlanBadge, Btn, Spinner, Empty, Modal, Field, Input, Select } from '../components/UI.jsx';

function fmt(n) { if (!n) return '₹0'; if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'; if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K'; return '₹' + n; }
function fmtDate(v) { if (!v) return '—'; try { return new Date(v).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); } catch { return v; } }

const EMPTY = { schoolId: '', schoolName: '', plan: 'Starter', amount: '', status: 'pending', dueDate: '' };

export function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [schools,  setSchools]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [open,     setOpen]     = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState(EMPTY);

  async function load() {
    setLoading(true);
    try {
      const [i, s] = await Promise.all([api.get('/payments'), api.get('/schools')]);
      setInvoices(i.payments || []);
      setSchools(s.schools  || []);
    } catch (e) { toast(e.message, 'err'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const F = (k) => ({ value: form[k], onChange: e => setForm(f => ({ ...f, [k]: e.target.value })) });

  async function handleCreate() {
    if (!form.schoolId || !form.amount) { toast('School and amount required', 'err'); return; }
    setSaving(true);
    try {
      const school = schools.find(s => s.id === form.schoolId);
      await api.post('/payments', { ...form, schoolName: school?.name || '', amount: Number(form.amount) });
      toast('Invoice created ✓', 'ok');
      setOpen(false);
      setForm(EMPTY);
      load();
    } catch (e) { toast(e.message, 'err'); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: 50, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1, letterSpacing: '-.3px' }}>Invoices</span>
        <Btn variant="accent" onClick={() => setOpen(true)}>+ New invoice</Btn>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <Card>
          <CardHeader title="Invoices" subtitle="Firestore · payments/" />
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={24} /></div>
            : invoices.length === 0 ? <Empty message="No invoices yet" /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Invoice ID', 'School', 'Amount', 'Status', 'Due date'].map(h => (
                <th key={h} style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: .8, color: 'var(--txt3)', textAlign: 'left', padding: '8px 14px', borderBottom: '1px solid var(--border)', fontWeight: 500, fontFamily: 'var(--mono)' }}>{h}</th>
              ))}</tr></thead>
              <tbody>{invoices.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--txt2)', fontFamily: 'var(--mono)' }}>#{p.id?.slice(0, 8)}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 500 }}>{p.schoolName || p.schoolId}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, fontFamily: 'var(--mono)' }}>{fmt(p.amount)}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}><Badge variant={p.status}>{p.status}</Badge></td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--txt2)', fontFamily: 'var(--mono)' }}>{fmtDate(p.dueDate)}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New invoice" subtitle="Saved to Firestore · payments/">
        <Field label="School">
          <Select value={form.schoolId} onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))}>
            <option value="">Select school…</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Plan"><Select {...F('plan')}><option>Starter</option><option>Growth</option><option>Enterprise</option></Select></Field>
          <Field label="Amount (₹)"><Input type="number" placeholder="7500" {...F('amount')} /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Due date"><Input type="date" {...F('dueDate')} /></Field>
          <Field label="Status"><Select {...F('status')}><option value="pending">Pending</option><option value="paid">Paid</option><option value="overdue">Overdue</option></Select></Field>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn onClick={() => setOpen(false)}>Cancel</Btn>
          <Btn variant="accent" loading={saving} onClick={handleCreate}>Create invoice</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ── REQUESTS ─────────────────────────────────────────────────────────────────
export function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);

  async function load() {
    setLoading(true);
    try { const d = await api.get('/requests'); setRequests(d.requests || []); }
    catch (e) { toast(e.message, 'err'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function approve(id) {
    try { await api.patch(`/requests/${id}/approve`); toast('Approved ✓', 'ok'); load(); }
    catch (e) { toast(e.message, 'err'); }
  }
  async function reject(id) {
    try { await api.patch(`/requests/${id}/reject`); toast('Rejected', 'ok'); load(); }
    catch (e) { toast(e.message, 'err'); }
  }

  const pending = requests.filter(r => r.status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: 50, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.3px' }}>Requests</span>
        {pending.length > 0 && <span style={{ marginLeft: 10, background: 'var(--red)', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 99, fontFamily: 'var(--mono)', fontWeight: 600 }}>{pending.length}</span>}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <Card>
          <CardHeader title="Pending registrations" subtitle={`${pending.length} pending`} />
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={24} /></div>
            : pending.length === 0 ? <Empty message="No pending requests" /> : (
            pending.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{r.schoolName}</div>
                  <div style={{ fontSize: 11, color: 'var(--txt2)', marginTop: 2, fontFamily: 'var(--mono)' }}>
                    {r.plan} · {r.city} · {r.email}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <Btn size="sm" variant="success" onClick={() => approve(r.id)}>Approve</Btn>
                  <Btn size="sm" variant="danger"  onClick={() => reject(r.id)}>Reject</Btn>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}

// ── ANALYTICS ────────────────────────────────────────────────────────────────
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS2, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
ChartJS2.register(ArcElement, PointElement, LineElement, Filler);

export function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview').then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  function fmt(n) { if (!n) return '₹0'; if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'; if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K'; return '₹' + n; }

  const lineData = {
    labels: ['Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr'],
    datasets: [{ label: 'Students', data: [18000,21000,23500,25000,27000,29500,31000,(33000 + (stats?.totalStudents || 0))], borderColor: '#6ee7b7', backgroundColor: 'rgba(110,231,183,.1)', fill: true, tension: .4, pointRadius: 3, pointBackgroundColor: '#6ee7b7' }],
  };
  const donutData = {
    labels: Object.keys(stats?.planDistribution || {}),
    datasets: [{ data: Object.values(stats?.planDistribution || {}), backgroundColor: ['#6ee7b7','#3b82f6','#4b5563'], borderWidth: 0 }],
  };
  const lineOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#555', font: { size: 10 } }, border: { display: false } }, y: { grid: { color: 'rgba(255,255,255,.04)' }, border: { display: false }, ticks: { color: '#555', font: { size: 10 }, callback: v => v.toLocaleString('en-IN') } } } };
  const donutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#888780', font: { size: 11 } } } } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: 50, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.3px' }}>Analytics</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={24} /></div> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: 16 }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt2)', marginBottom: 8, fontFamily: 'var(--mono)' }}>Total Revenue</div>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.8px' }}>{fmt(stats?.totalRevenue)}</div>
              </div>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: 16 }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt2)', marginBottom: 8, fontFamily: 'var(--mono)' }}>MRR</div>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.8px' }}>{fmt(stats?.mrr)}</div>
              </div>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: 16 }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt2)', marginBottom: 8, fontFamily: 'var(--mono)' }}>Churn Rate</div>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.8px' }}>2.1%</div>
                <div style={{ fontSize: 11, marginTop: 5, color: 'var(--green)' }}>↓ 0.3%</div>
              </div>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: 16 }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt2)', marginBottom: 8, fontFamily: 'var(--mono)' }}>NPS</div>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.8px' }}>68</div>
                <div style={{ fontSize: 11, marginTop: 5, color: 'var(--green)' }}>↑ 4 pts</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Card>
                <CardHeader title="Student growth" />
                <div style={{ padding: 16 }}><div style={{ height: 220 }}><Line data={lineData} options={lineOpts} /></div></div>
              </Card>
              <Card>
                <CardHeader title="Plan distribution" />
                <div style={{ padding: 16 }}><div style={{ height: 220 }}><Doughnut data={donutData} options={donutOpts} /></div></div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── MESSAGES ─────────────────────────────────────────────────────────────────
import { useEffect as useEff2, useState as useState2, useRef as useRef2 } from 'react';
import { db, collection, query, orderBy as fbOrderBy, onSnapshot } from '../lib/firebase.js';
import { useAuth } from '../context/AuthContext.jsx';

export function Messages() {
  const { user } = useAuth();
  const [schools,    setSchools]    = useState2([]);
  const [selected,   setSelected]   = useState2(null);
  const [messages,   setMessages]   = useState2([]);
  const [msgText,    setMsgText]    = useState2('');
  const [sending,    setSending]    = useState2(false);
  const bottomRef = useRef2(null);

  useEff2(() => {
    api.get('/schools').then(d => setSchools(d.schools || [])).catch(console.error);
  }, []);

  useEff2(() => {
    if (!selected) return;
    const q = query(collection(db, 'messages', selected.id, 'thread'), fbOrderBy('ts', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data(), ts: d.data().ts?.toDate?.() || null })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    return unsub;
  }, [selected]);

  async function sendMsg() {
    if (!msgText.trim() || !selected) return;
    setSending(true);
    try {
      await api.post(`/messages/${selected.id}/thread`, { text: msgText.trim() });
      setMsgText('');
    } catch (e) { toast(e.message, 'err'); }
    finally { setSending(false); }
  }

  function fmtTs(ts) {
    if (!ts) return '';
    try { return ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Contact list */}
      <div style={{ width: 260, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 50, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Messages</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {schools.map(s => (
            <div
              key={s.id}
              onClick={() => setSelected(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px',
                cursor: 'pointer', borderBottom: '1px solid var(--border)',
                background: selected?.id === s.id ? 'var(--bg3)' : 'transparent',
                transition: 'background .15s',
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0, fontFamily: 'var(--mono)' }}>
                {s.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--txt2)', marginTop: 1 }}>{s.plan}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt3)', fontSize: 12 }}>
            Select a school to start messaging
          </div>
        ) : (
          <>
            <div style={{ height: 50, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#000' }}>{selected.name?.[0]}</div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.name}</span>
              <span style={{ fontSize: 11, color: 'var(--txt2)', fontFamily: 'var(--mono)' }}>School admin</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--txt3)', fontSize: 11, padding: 24 }}>No messages yet. Start the conversation!</div>}
              {messages.map(m => {
                const isOut = m.sender === 'admin';
                return (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isOut ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '80%', padding: '8px 11px', borderRadius: 10, fontSize: 12, lineHeight: 1.55,
                      background: isOut ? 'var(--accent)' : 'var(--bg3)',
                      color: isOut ? '#000' : 'var(--txt)',
                      borderRadius: isOut ? '10px 3px 10px 10px' : '3px 10px 10px 10px',
                      fontWeight: isOut ? 500 : 400,
                    }}>
                      {m.text}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--txt3)', marginTop: 3, fontFamily: 'var(--mono)' }}>{fmtTs(m.ts)}</div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 7, alignItems: 'flex-end' }}>
              <textarea
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                placeholder="Type a message…"
                rows={1}
                style={{
                  flex: 1, border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px',
                  fontSize: 12, fontFamily: 'var(--font)', background: 'var(--bg3)', color: 'var(--txt)',
                  resize: 'none', outline: 'none', lineHeight: 1.4,
                }}
              />
              <button
                onClick={sendMsg} disabled={sending || !msgText.trim()}
                style={{
                  width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: (!msgText.trim() || sending) ? .5 : 1,
                }}
              >
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M2 8l12-5-5 12-2-5-5-2z" fill="#000"/></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── SETTINGS ─────────────────────────────────────────────────────────────────
export function Settings() {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: 50, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.3px' }}>Settings</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <CardHeader title="Profile" />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
            <Field label="Email">
              <Input value={user?.email || ''} disabled style={{ opacity: .5 }} />
            </Field>
            <Field label="UID">
              <Input value={user?.uid || ''} disabled style={{ opacity: .5, fontFamily: 'var(--mono)', fontSize: 11 }} />
            </Field>
            <Btn variant="danger" onClick={logout} style={{ width: 'fit-content' }}>Sign out</Btn>
          </div>
        </Card>

        <Card>
          <CardHeader title="Firebase config" />
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--txt2)', marginBottom: 8 }}>
              Update your Firebase config in <code style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>/frontend/.env</code>
            </div>
            <div style={{
              background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
              padding: 12, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', lineHeight: 1.7,
            }}>
              Auth · Firestore · Storage · Realtime messaging
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Notifications" />
          {[
            { label: 'Email notifications', desc: 'Get notified on new registrations and payments', on: true },
            { label: 'Real-time messaging',  desc: 'Live Firestore listener for school messages',    on: true },
            { label: 'Auto-approve Starter plan', desc: 'Automatically approve small school registrations', on: false },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{row.label}</div>
                <div style={{ fontSize: 11, color: 'var(--txt2)', marginTop: 2 }}>{row.desc}</div>
              </div>
              <div style={{
                width: 36, height: 20, borderRadius: 99,
                background: row.on ? 'var(--accent)' : 'var(--bg3)',
                border: '1px solid var(--border)', cursor: 'pointer', position: 'relative', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#fff',
                  top: 2, left: row.on ? 18 : 2, transition: 'left .2s',
                }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
