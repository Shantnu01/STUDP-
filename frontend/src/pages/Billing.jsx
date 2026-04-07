// src/pages/Billing.jsx
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { toast } from '../hooks/useToast.jsx';
import { MetricCard, Card, CardHeader, Badge, PlanBadge, Btn, Spinner, Empty } from '../components/UI.jsx';

function fmt(n) {
  if (!n) return '₹0';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)   return '₹' + (n / 1000).toFixed(1)   + 'K';
  return '₹' + n;
}
function fmtDate(v) {
  if (!v) return '—';
  try { return new Date(v).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); } catch { return v; }
}

export default function Billing() {
  const [payments, setPayments] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([api.get('/payments'), api.get('/payments/stats')]);
      setPayments(p.payments || []);
      setStats(s);
    } catch (e) { toast(e.message, 'err'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function markPaid(id) {
    try {
      await api.patch(`/payments/${id}`, { status: 'paid' });
      toast('Marked as paid ✓', 'ok');
      load();
    } catch (e) { toast(e.message, 'err'); }
  }

  async function markOverdue(id) {
    try {
      await api.patch(`/payments/${id}`, { status: 'overdue' });
      toast('Marked overdue', 'ok');
      load();
    } catch (e) { toast(e.message, 'err'); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        height: 50, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 20px',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.3px' }}>Billing</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <MetricCard label="Collected"  value={fmt(stats?.collected)} delta="This month" deltaUp />
          <MetricCard label="Overdue"    value={fmt(stats?.overdue)}   delta="Outstanding" />
          <MetricCard label="Pending"    value={fmt(stats?.pending)}   delta="Awaiting" />
          <MetricCard label="Total Txns" value={stats?.total || 0}     delta="All time" deltaUp />
        </div>

        <Card>
          <CardHeader title="All payments" subtitle="Firestore · payments/" />
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={24} /></div>
          ) : payments.length === 0 ? <Empty message="No payments yet" /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['School', 'Plan', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} style={{
                      fontSize: 9, textTransform: 'uppercase', letterSpacing: .8,
                      color: 'var(--txt3)', textAlign: 'left', padding: '8px 14px',
                      borderBottom: '1px solid var(--border)', fontWeight: 500, fontFamily: 'var(--mono)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 500 }}>{p.schoolName || p.schoolId}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}><PlanBadge plan={p.plan} /></td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, fontFamily: 'var(--mono)' }}>{fmt(p.amount)}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}><Badge variant={p.status}>{p.status}</Badge></td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--txt2)', fontFamily: 'var(--mono)' }}>{fmtDate(p.createdAt)}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                      {p.status !== 'paid' && (
                        <div style={{ display: 'flex', gap: 5 }}>
                          <Btn size="sm" variant="success" onClick={() => markPaid(p.id)}>Mark paid</Btn>
                          {p.status !== 'overdue' && <Btn size="sm" variant="danger" onClick={() => markOverdue(p.id)}>Overdue</Btn>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
