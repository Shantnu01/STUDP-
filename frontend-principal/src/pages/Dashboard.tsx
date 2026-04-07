import { Users, UserRound, BookOpen, CalendarCheck } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const STATS_CARDS = [
  { label: 'Total Students',   value: 1240, icon: Users,         delta: '+12', color: 'blue' },
  { label: 'Active Teachers',   value: 86,   icon: UserRound,     delta: '0',   color: 'emerald' },
  { label: 'Total Classes',    value: 48,   icon: BookOpen,      delta: '+2',  color: 'amber' },
  { label: 'Today\'s Presence', value: '94%',icon: CalendarCheck, delta: '-2%', color: 'rose' },
];

const CHART_DATA = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    { label: 'Attendance %', data: [98, 97, 94, 95, 94], borderColor: '#10b981', tension: 0.4 },
  ],
};

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-element animate-delay-100">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back, Principal Elena. Here's a snapshot of your school today.</p>
      </header>

      <div className="grid4">
        {STATS_CARDS.map((card) => (
           <div key={card.label} className="mc">
              <div className="flex items-center justify-between mb-2">
                 <div className="mc-label mb-0">{card.label}</div>
                 <card.icon className="w-4 h-4 text-gray-500" />
              </div>
              <div className="mc-value">{card.value}</div>
              <div className={`mc-delta ${card.delta.startsWith('+') ? 'up' : card.delta.startsWith('-') ? 'dn' : ''}`}>
                 {card.delta} from last month
              </div>
           </div>
        ))}
      </div>

      <div className="grid2 mt-8">
        <div className="card">
           <div className="card-header">
             <div className="card-title">Attendance Trend</div>
             <div className="card-sub">Last 5 Days</div>
           </div>
           <div className="card-body h-64">
              <Line data={CHART_DATA} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
           </div>
        </div>

        <div className="card">
           <div className="card-header">
             <div className="card-title">Upcoming Events</div>
             <div className="card-sub">Today</div>
           </div>
           <div className="card-body space-y-4">
              {[
                { time: '10:00 AM', title: 'Staff Meeting',       type: 'Academic' },
                { time: '02:30 PM', title: 'Parent Interaction', type: 'Administrative' },
                { time: '04:00 PM', title: 'Football Match',      type: 'Sport' },
              ].map((ev) => (
                <div key={ev.time} className="flex items-center gap-4 p-3 rounded hover:bg-white/5 transition-colors cursor-pointer group">
                   <div className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors w-20 mono">
                      {ev.time}
                   </div>
                   <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{ev.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 mono uppercase">{ev.type}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
