// Billing.tsx
import { usePayments } from '@/hooks/usePayments'
import { useSchools } from '@/hooks/useSchools'
import { statusBadge, fmtINR, fmtDate } from '@/lib/utils'

export function Billing() {
  const { payments, markPaid } = usePayments()
  const { schools } = useSchools()
  const paid    = payments.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0)
  const overdue = payments.filter(p => p.status === 'overdue').reduce((a, p) => a + p.amount, 0)
  const mrr     = schools.filter(s => s.status === 'active').reduce((a, s) => a + ({Enterprise:12000,Growth:7500,Starter:2500}[s.plan]??2500), 0)
  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div className="grid4">
        <div className="mc"><div className="mc-label">MRR</div><div className="mc-value">{fmtINR(mrr)}</div><div className="mc-delta up">↑ Live</div></div>
        <div className="mc"><div className="mc-label">Collected</div><div className="mc-value">{fmtINR(paid)}</div><div className="mc-delta up">All paid invoices</div></div>
        <div className="mc"><div className="mc-label">Overdue</div><div className="mc-value">{fmtINR(overdue)}</div><div className="mc-delta dn">Pending collection</div></div>
        <div className="mc"><div className="mc-label">Failed</div><div className="mc-value">{payments.filter(p=>p.status==='failed').length}</div><div className="mc-delta dn">This month</div></div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">All payments</span><span className="card-sub">Firestore · payments/</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th style={{width:'24%'}}>School</th><th style={{width:'12%'}}>Plan</th><th style={{width:'13%'}}>Amount</th><th style={{width:'11%'}}>Status</th><th style={{width:'13%'}}>Date</th><th style={{width:'27%'}}>Action</th></tr></thead>
            <tbody>
              {payments.length === 0 && <tr><td colSpan={6} style={{textAlign:'center',color:'var(--txt3)',padding:24,fontFamily:'DM Mono,monospace'}}>No payments yet</td></tr>}
              {payments.map(p => (
                <tr key={p.id}>
                  <td>{p.schoolName}</td>
                  <td><span className="badge badge-gray">{p.plan}</span></td>
                  <td style={{fontFamily:'DM Mono,monospace'}}>₹{p.amount.toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                  <td style={{fontFamily:'DM Mono,monospace'}}>{fmtDate(p.date)}</td>
                  <td><button className="btn btn-green btn-sm" onClick={() => markPaid(p.id)} disabled={p.status==='paid'}>Mark paid</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
export default Billing
