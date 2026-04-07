// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { api } from '../lib/api.js';
import { MetricCard, Card, CardHeader, Badge, PlanBadge, Avatar, Spinner, Empty } from '../components/UI.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/schools'),
    ]).then(([s, sc]) => {
      setStats(s);
      setSchools(sc.schools?.slice(0, 6) || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Revenue',
        data: [410, 490, 520, 610, 670, 710, 780, 840],
        backgroundColor: '#6ee7b7', borderRadius: 4, barPercentage: .5, categoryPercentage: .7,
      },
      {
        label: 'Expenses',
        data: [210, 240, 255, 280, 300, 310, 340, 360],
        backgroundColor: '#2a2a2a', borderRadius: 4, barPercentage: .5, categoryPercentage: .7,
      },
    ],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ₹' + c.raw + 'K' } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#555' }, border: { display: false } },
      y: { grid: { color: 'rgba(255,255,255,.04)' }, border: { display: false }, ticks: { font: { size: 10 }, color: '#555', callback: v => '₹' + v + 'K' } },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Topbar */}
      <div style={{
        height: 50, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 20px',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.3px' }}>Dashboard</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={24} /></div>
        ) : (
          <>
            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <MetricCard label="Total Schools"  value={stats?.totalSchools  || 0} delta="↑ 3 this month" deltaUp />
              <MetricCard label="MRR"            value={fmt(stats?.mrr)}           delta="↑ 14.2%" deltaUp />
              <MetricCard label="Students"       value={(stats?.totalStudents || 0).toLocaleString('en-IN')} delta="↑ 2.1K" deltaUp />
              <MetricCard label="Pending Requests" value={stats?.pendingRequests || 0} delta={stats?.pendingRequests > 0 ? 'Needs attention' : 'All clear'} deltaUp={!stats?.pendingRequests} />
            </div>

            {/* Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12 }}>
              {/* Chart */}
              <Card>
                <CardHeader title="Revenue overview" subtitle="₹K · last 8 months" />
                <div style={{ padding: 16 }}>
                  <div style={{ height: 170 }}>
                    <Bar data={chartData} options={chartOpts} />
                  </div>
                </div>
              </Card>

              {/* Plan distribution */}
              <Card>
                <CardHeader title="Plan distribution" />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.entries(stats?.planDistribution || {}).map(([plan, count]) => {
                    const total = Object.values(stats?.planDistribution || {}).reduce((a, b) => a + b, 0) || 1;
                    const pct   = Math.round((count / total) * 100);
                    const colors = { Enterprise: '#6ee7b7', Growth: '#3b82f6', Starter: '#f59e0b' };
                    const color  = colors[plan] || '#555';
                    return (
                      <div key={plan}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5, color: 'var(--txt2)' }}>
                          <span>{plan}</span>
                          <span style={{ color: 'var(--txt)', fontFamily: 'var(--mono)', fontWeight: 500 }}>{pct}%</span>
                        </div>
                        <div style={{ height: 3, borderRadius: 99, background: 'var(--bg3)' }}>
                          <div style={{ height: '100%', borderRadius: 99, background: color, width: pct + '%', transition: 'width .4s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Recent Schools */}
            <Card>
              <CardHeader title="Recent schools" subtitle={`${schools.length} shown`} />
              {schools.length === 0 ? <Empty message="No schools yet" /> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['School', 'City', 'Plan', 'Students', 'Status', 'Last Payment'].map(h => (
                        <th key={h} style={{
                          fontSize: 9, textTransform: 'uppercase', letterSpacing: .8,
                          color: 'var(--txt3)', textAlign: 'left', padding: '8px 14px',
                          borderBottom: '1px solid var(--border)', fontWeight: 500, fontFamily: 'var(--mono)',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map(s => (
                      <tr key={s.id} style={{ cursor: 'default' }}>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <Avatar name={s.name} size={26} radius={6} />
                            {s.name}
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--txt2)' }}>{s.city || '—'}</td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}><PlanBadge plan={s.plan} /></td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, fontFamily: 'var(--mono)' }}>{(s.students || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}><Badge variant={s.status}>{s.status}</Badge></td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--txt2)', fontFamily: 'var(--mono)' }}>{fmtDate(s.lastPayment)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
