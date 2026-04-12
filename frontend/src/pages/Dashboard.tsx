import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useSchools } from '@/hooks/useSchools'
import { usePayments } from '@/hooks/usePayments'
import { useRegistrations } from '@/hooks/useRegistrations'
import SchoolModal from '@/components/modals/SchoolModal'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { planPrice, planColors, statusBadge, fmtINR, fmtDate, initials } from '@/lib/utils'
import { School } from '@/types'
import { MessageSquare, Pencil } from 'lucide-react'

const REVENUE_DATA = [
  { month: 'Sep', revenue: 410, expenses: 210 }, { month: 'Oct', revenue: 490, expenses: 240 },
  { month: 'Nov', revenue: 520, expenses: 255 }, { month: 'Dec', revenue: 610, expenses: 280 },
  { month: 'Jan', revenue: 670, expenses: 300 }, { month: 'Feb', revenue: 710, expenses: 310 },
  { month: 'Mar', revenue: 780, expenses: 340 }, { month: 'Apr', revenue: 840, expenses: 360 },
]

export default function Dashboard() {
  const { schools, addSchool, updateSchool, deleteSchool } = useSchools()
  const { payments } = usePayments()
  const { registrations, approve, reject } = useRegistrations()
  const { setSelectedSchoolId, setMsgOpen } = useOutletContext<any>()
  const [modalSchool, setModalSchool] = useState<School | null | undefined>(undefined)

  const active   = schools.filter(s => s.status === 'active')
  const overdue  = schools.filter(s => s.status === 'overdue')
  const pending  = registrations.filter(r => r.status === 'pending')
  const mrr      = active.reduce((a, s) => a + planPrice(s.plan), 0)
  const arr      = mrr * 12

  const planSplit = ['Enterprise', 'Growth', 'Starter'].map(p => {
    const list = schools.filter(s => s.plan === p)
    const rev  = list.reduce((a, s) => a + planPrice(s.plan), 0)
    return { plan: p, count: list.length, rev }
  })
  const maxRev = Math.max(...planSplit.map(p => p.rev), 1)

  const openMsg = (id: string) => { setSelectedSchoolId(id); setMsgOpen(true) }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Metrics */}
      <div className="grid4">
        <div className="mc">
          <div className="mc-label">MRR</div>
          <div className="mc-value">{fmtINR(mrr)}</div>
          <div className="mc-delta up">↑ Live · Firestore</div>
        </div>
        <div className="mc">
          <div className="mc-label">Active schools</div>
          <div className="mc-value">{active.length}</div>
          <div className="mc-delta up">↑ {schools.length} total</div>
        </div>
        <div className="mc">
          <div className="mc-label">Pending</div>
          <div className="mc-value">{pending.length}</div>
          <div className="mc-delta" style={{ color: 'var(--txt2)' }}>Awaiting review</div>
        </div>
        <div className="mc">
          <div className="mc-label">Overdue</div>
          <div className="mc-value">{overdue.length}</div>
          <div className="mc-delta dn">{overdue.length > 0 ? '↑ Action needed' : '✓ Clear'}</div>
        </div>
      </div>

      <div className="row2">
        {/* Revenue chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue vs Expenses</span>
            <span className="card-sub">8 months · ₹K</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 14, marginBottom: 10, fontSize: 11, color: 'var(--txt2)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }} />Revenue
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--bg5)', display: 'inline-block' }} />Expenses
              </span>
            </div>
            <ResponsiveContainer width="100%" height={165}>
              <BarChart data={REVENUE_DATA} barSize={14} barGap={3}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.04)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#444' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#444' }} tickFormatter={v => `₹${v}K`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: any) => [`₹${v}K`]}
                  cursor={{ fill: 'rgba(255,255,255,.03)' }}
                />
                <Bar dataKey="revenue" fill="#6ee7b7" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" fill="#2a2a2a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan split */}
        <div className="card">
          <div className="card-header"><span className="card-title">Plan split</span></div>
          <div className="card-body">
            <div className="grid2" style={{ marginBottom: 14 }}>
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt2)', marginBottom: 3, fontFamily: 'DM Mono, monospace' }}>ARR</div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-1px' }}>{fmtINR(arr)}</div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt2)', marginBottom: 3, fontFamily: 'DM Mono, monospace' }}>Per school</div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-1px' }}>{schools.length ? fmtINR(mrr / schools.length) : '—'}</div>
              </div>
            </div>
            {planSplit.map(({ plan, count, rev }) => (
              <div key={plan} className="pbar-row">
                <div className="pbar-top">
                  <span>{plan}</span>
                  <span>{count} · {fmtINR(rev)}</span>
                </div>
                <div className="pbar">
                  <div className="pbf" style={{ width: `${Math.round(rev / maxRev * 100)}%`, background: planColors(plan as any).color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schools table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Schools</span>
          <span className="card-sub">{schools.length} registered</span>
          <button className="btn btn-accent btn-sm" onClick={() => setModalSchool(null)}>+ Add</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '28%' }}>School</th>
                <th style={{ width: '12%' }}>Plan</th>
                <th style={{ width: '10%' }}>Students</th>
                <th style={{ width: '11%' }}>Status</th>
                <th style={{ width: '13%' }}>Last payment</th>
                <th style={{ width: '26%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--txt3)', padding: 28, fontFamily: 'DM Mono, monospace' }}>No schools yet · Add your first</td></tr>
              )}
              {schools.map(s => {
                const { bg, color } = planColors(s.plan)
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div className="av" style={{ width: 26, height: 26, fontSize: 9, background: bg, color }}>{initials(s.name)}</div>
                        {s.name}
                      </div>
                    </td>
                    <td><span className="badge badge-gray">{s.plan}</span></td>
                    <td style={{ fontFamily: 'DM Mono, monospace' }}>{s.students.toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${statusBadge(s.status)}`}>{s.status}</span></td>
                    <td style={{ fontFamily: 'DM Mono, monospace' }}>{fmtDate(s.lastPayment)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn btn-blue btn-sm" onClick={() => openMsg(s.id)}><MessageSquare size={11} /> Message</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModalSchool(s)}><Pencil size={11} /> Edit</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom row */}
      <div className="row2">
        {/* Pending registrations */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pending registrations</span>
            <span className="card-sub">{pending.length} new</span>
          </div>
          {pending.length === 0 ? (
            <div className="card-body" style={{ color: 'var(--txt3)', fontSize: 12, fontFamily: 'DM Mono, monospace' }}>No pending requests</div>
          ) : pending.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{r.schoolName}, {r.city}</div>
                <div style={{ fontSize: 11, color: 'var(--txt2)', marginTop: 2, fontFamily: 'DM Mono, monospace' }}>
                  {r.plan} · {r.students.toLocaleString('en-IN')} students · {fmtDate(r.createdAt)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                <button className="btn btn-green btn-sm" onClick={() => approve(r)}>Approve</button>
                <button className="btn btn-red btn-sm" onClick={() => reject(r.id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent payments */}
        <div className="card">
          <div className="card-header"><span className="card-title">Recent payments</span></div>
          {payments.length === 0 ? (
            <div className="card-body" style={{ color: 'var(--txt3)', fontSize: 12, fontFamily: 'DM Mono, monospace' }}>No payments yet</div>
          ) : payments.slice(0, 5).map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid var(--border)', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.schoolName}</div>
                <div style={{ fontSize: 11, color: 'var(--txt2)', fontFamily: 'DM Mono, monospace' }}>{p.plan} · {fmtDate(p.date)}</div>
              </div>
              <span className={`badge ${statusBadge(p.status)}`}>{p.status}</span>
              <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>₹{p.amount.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* School modal */}
      {modalSchool !== undefined && (
        <SchoolModal
          school={modalSchool}
          onSave={modalSchool ? (d) => updateSchool(modalSchool.id, d) : addSchool}
          onDelete={modalSchool ? () => deleteSchool(modalSchool.id) : undefined}
          onClose={() => setModalSchool(undefined)}
        />
      )}
    </div>
  )
}
