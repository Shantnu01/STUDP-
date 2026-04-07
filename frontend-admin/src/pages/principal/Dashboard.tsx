import { useNavigate } from 'react-router-dom';
import { Users, UserRound, BookOpen, CalendarCheck, TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign, Bell, MessageCircle, FileText, Zap, BarChart2, Award } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const STATS = [
  { label: 'Total Students',   value: '1,240', icon: Users,         delta: '+12', up: true,  sub: 'vs last month',    accent: '#60a5fa' },
  { label: 'Active Teachers',  value: '86',    icon: UserRound,     delta: '0',   up: null,  sub: 'No change',        accent: '#34d399' },
  { label: 'Total Classes',    value: '48',    icon: BookOpen,      delta: '+2',  up: true,  sub: 'New sections added', accent: '#fbbf24' },
  { label: 'Today\'s Attendance', value: '94%', icon: CalendarCheck,delta: '-2%', up: false, sub: 'Below target 96%', accent: '#f87171' },
  { label: 'Fee Collection',   value: '₹4.2L', icon: DollarSign,   delta: '+8%', up: true,  sub: 'This month',       accent: '#a78bfa' },
  { label: 'Pending Fees',     value: '23',    icon: AlertCircle,   delta: '-5',  up: true,  sub: 'Students overdue', accent: '#fb923c' },
  { label: 'Events This Month',value: '7',     icon: CalendarCheck, delta: '+2',  up: true,  sub: 'vs last month',    accent: '#22d3ee' },
  { label: 'Notices Sent',     value: '14',    icon: Bell,          delta: '+4',  up: true,  sub: 'This week',        accent: '#e879f9' },
];

const ATTENDANCE_DATA = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    {
      label: 'Attendance %',
      data: [97, 96, 94, 95, 92, 98, 97, 95, 96, 94],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,.08)',
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointBackgroundColor: '#10b981',
    },
    {
      label: 'Target',
      data: [96, 96, 96, 96, 96, 96, 96, 96, 96, 96],
      borderColor: 'rgba(239,68,68,.4)',
      borderDash: [4, 4],
      tension: 0,
      fill: false,
      pointRadius: 0,
    }
  ],
};

const GENDER_DATA = {
  labels: ['Boys', 'Girls'],
  datasets: [{ data: [648, 592], backgroundColor: ['#60a5fa', '#f472b6'], borderWidth: 0 }],
};

const CLASS_PERFORMANCE = [
  { grade: 'Grade 12', avg: 82, color: '#34d399' },
  { grade: 'Grade 11', avg: 78, color: '#60a5fa' },
  { grade: 'Grade 10', avg: 85, color: '#a78bfa' },
  { grade: 'Grade 9',  avg: 76, color: '#fbbf24' },
  { grade: 'Grade 8',  avg: 80, color: '#fb923c' },
];

const ALERTS = [
  { type: 'warn',    text: '23 students have pending fees this month', action: 'View' },
  { type: 'info',    text: 'Grade 9-B attendance dropped below 75% this week', action: 'Detail' },
  { type: 'success', text: 'Grade 10-A achieved 100% attendance yesterday', action: 'View' },
  { type: 'warn',    text: 'Staff meeting scheduled tomorrow at 10:00 AM', action: 'Details' },
];

const QUICK_ACTIONS = [
  { label: 'Add Student',    icon: Users,        path: '/principal/students',   color: '#60a5fa' },
  { label: 'Mark Attendance',icon: CalendarCheck,path: '/principal/attendance', color: '#34d399' },
  { label: 'Send Message',   icon: MessageCircle,path: '/principal/chat',       color: '#a78bfa' },
  { label: 'Post Notice',    icon: FileText,     path: '/principal/noticeboard',color: '#fbbf24' },
  { label: 'View Timetable', icon: Clock,        path: '/principal/timetable',  color: '#fb923c' },
  { label: 'Fee Tracking',   icon: DollarSign,   path: '/principal/fees',       color: '#22d3ee' },
];

const EVENTS = [
  { time: '10:00 AM', title: 'Staff Meeting', type: 'Admin', color: '#60a5fa' },
  { time: '02:30 PM', title: 'Parent-Teacher Conference', type: 'Academic', color: '#34d399' },
  { time: '04:00 PM', title: 'Annual Sports Day Planning', type: 'Sport', color: '#fbbf24' },
];

const TOP_STUDENTS = [
  { name: 'Anya Mehta',   grade: '12-A', score: 98, id: 'STU-2026-00001' },
  { name: 'Arjun Kapoor', grade: '10-A', score: 96, id: 'STU-2026-00004' },
  { name: 'Priya Singh',  grade: '11-B', score: 94, id: 'STU-2026-00003' },
];

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#444442', font: { size: 10 } } },
    y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#444442', font: { size: 10 } }, min: 70, max: 100 },
  },
};

export default function PrincipalDashboard() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Welcome Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', lineHeight: 1.2 }}>
            Good morning, Principal! 👋
          </h1>
          <p style={{ fontSize: 13, color: 'var(--txt2)', marginTop: 5 }}>{today} · Everything is running smoothly today.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 99, background: 'rgba(16,185,129,.1)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)' }}>
            <CheckCircle size={13} /> School Active
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 99, background: 'rgba(245,158,11,.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,.2)' }}>
            <TrendingUp size={13} /> Academic Year 2025–26
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {STATS.slice(0, 8).map(card => (
          <div key={card.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = card.accent; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--txt2)', fontFamily: 'DM Mono, monospace' }}>{card.label}</div>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${card.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={13} color={card.accent} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.8px', lineHeight: 1 }}>{card.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: card.up === true ? '#22c55e' : card.up === false ? '#ef4444' : 'var(--txt3)', fontFamily: 'DM Mono, monospace' }}>
                {card.up === true ? '↑' : card.up === false ? '↓' : '·'} {card.delta}
              </span>
              <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={14} color="var(--accent)" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Quick Actions</span>
          <span style={{ fontSize: 11, color: 'var(--txt2)', fontFamily: 'DM Mono, monospace' }}>Common tasks</span>
        </div>
        <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a.label} onClick={() => navigate(a.path)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '14px 10px', borderRadius: 10, background: 'var(--bg3)',
              border: '1px solid var(--border)', cursor: 'pointer', transition: 'all .2s',
              color: 'var(--txt2)', fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${a.color}12`; (e.currentTarget as HTMLElement).style.borderColor = `${a.color}30`; (e.currentTarget as HTMLElement).style.color = a.color; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--txt2)'; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <a.icon size={16} color={a.color} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={14} color="var(--accent)" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Attendance Trend</span>
            <span style={{ fontSize: 11, color: 'var(--txt2)', fontFamily: 'DM Mono, monospace' }}>Last 2 weeks</span>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)' }}>
              — Target 96%
            </span>
          </div>
          <div style={{ padding: 16, height: 210 }}>
            <Line data={ATTENDANCE_DATA} options={chartOptions} />
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={14} color="var(--accent)" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Student Demographics</span>
          </div>
          <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 130, height: 130, flexShrink: 0 }}>
              <Doughnut data={GENDER_DATA} options={{ plugins: { legend: { display: false } }, cutout: '72%', maintainAspectRatio: true }} />
            </div>
            <div style={{ flex: 1 }}>
              {[{ label: 'Male Students', count: 648, pct: '52%', color: '#60a5fa' }, { label: 'Female Students', count: 592, pct: '48%', color: '#f472b6' }].map(d => (
                <div key={d.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                      {d.label}
                    </span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: d.color }}>{d.pct}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: 'var(--bg4)' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: d.color, width: d.pct, transition: 'width .6s' }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--txt2)' }}>Total: <strong style={{ color: 'var(--txt)' }}>1,240</strong> students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Alerts + Events + Top Students */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {/* Alerts */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} color="#fbbf24" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Alerts</span>
            <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: 9, borderRadius: 99, padding: '1px 6px', fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>
              {ALERTS.filter(a => a.type === 'warn').length}
            </span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {ALERTS.map((alert, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: i < ALERTS.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {alert.type === 'warn' ? <AlertCircle size={13} color="#fbbf24" style={{ flexShrink: 0 }} /> :
                 alert.type === 'info' ? <AlertCircle size={13} color="#60a5fa" style={{ flexShrink: 0 }} /> :
                 <CheckCircle size={13} color="#22c55e" style={{ flexShrink: 0 }} />}
                <div style={{ flex: 1, fontSize: 12, color: 'var(--txt)', lineHeight: 1.45 }}>{alert.text}</div>
                <button style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>{alert.action}</button>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={14} color="var(--accent)" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Today's Schedule</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {EVENTS.map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 16px', borderBottom: i < EVENTS.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 3, borderRadius: 99, background: ev.color, flexShrink: 0, alignSelf: 'stretch' }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt)' }}>{ev.title}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--txt2)' }}>{ev.time}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 7px', borderRadius: 99, background: `${ev.color}18`, color: ev.color, border: `1px solid ${ev.color}30` }}>{ev.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Students */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={14} color="#fbbf24" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Top Performers</span>
            <span style={{ fontSize: 11, color: 'var(--txt2)', fontFamily: 'DM Mono, monospace' }}>This month</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {TOP_STUDENTS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: i < TOP_STUDENTS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)', fontFamily: 'DM Mono, monospace' }}>Grade {s.grade} · {s.id}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: '#22c55e' }}>
                  {s.score}%
                </div>
              </div>
            ))}
          </div>
          {/* Class performance bars */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt2)', marginBottom: 10 }}>Avg by Grade</div>
            {CLASS_PERFORMANCE.map(c => (
              <div key={c.grade} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--txt2)', marginBottom: 3 }}>
                  <span>{c.grade}</span>
                  <span style={{ fontFamily: 'DM Mono, monospace', color: c.color }}>{c.avg}%</span>
                </div>
                <div style={{ height: 3, borderRadius: 99, background: 'var(--bg4)' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: c.color, width: `${c.avg}%`, transition: 'width .6s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
