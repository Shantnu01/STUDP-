import { useState, useMemo } from 'react';
import { DollarSign, CheckCircle2, Clock, AlertTriangle, Search, Edit, X, Save, Settings } from 'lucide-react';
import { STUDENT_MOCK_DATA } from '@/lib/mockData';

interface FeeRecord {
  id: string; student: string; classId: string; section: string; 
  amount: number; paid: number; status: 'paid' | 'partial' | 'overdue'; due: string;
}

const CLASSES = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];
const SECTIONS = ['A','B','C','D','E'];

const STATUS_CONFIG = {
  paid:    { label: 'Paid',    icon: CheckCircle2,  cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  partial: { label: 'Partial', icon: Clock,         cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  overdue: { label: 'Overdue', icon: AlertTriangle, cls: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
};

function computeStatus(paid: number, amount: number): 'paid' | 'partial' | 'overdue' {
  if (paid >= amount) return 'paid';
  if (paid > 0) return 'partial';
  return 'overdue';
}

function buildInitialFees(): FeeRecord[] {
  return STUDENT_MOCK_DATA.map(s => ({
    id: s.id,
    student: s.name,
    classId: s.classId,
    section: s.section,
    amount: 10000, // Default base fee
    paid: 0,
    status: 'overdue',
    due: '2026-05-01'
  }));
}

export default function Fees() {
  const [fees, setFees] = useState<FeeRecord[]>(buildInitialFees());
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'partial' | 'overdue'>('all');
  
  const [editTarget, setEditTarget] = useState<FeeRecord | null>(null);
  const [editPaid, setEditPaid] = useState('');
  const [editTotalFee, setEditTotalFee] = useState('');

  // Class Fee Setting Modal
  const [showClassFee, setShowClassFee] = useState(false);
  const [classFeeTarget, setClassFeeTarget] = useState('');
  const [classFeeAmount, setClassFeeAmount] = useState('');

  const filtered = useMemo(() => fees.filter(f => {
    const matchSearch = f.student.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClass || f.classId === filterClass;
    const matchSection = !filterSection || f.section === filterSection;
    const matchStatus = filterStatus === 'all' || f.status === filterStatus;
    return matchSearch && matchClass && matchSection && matchStatus;
  }), [fees, search, filterClass, filterSection, filterStatus]);

  const totalCollected = fees.reduce((a, f) => a + f.paid, 0);
  const totalDue       = fees.reduce((a, f) => a + (f.amount - f.paid), 0);
  const overdueCount   = fees.filter(f => f.status === 'overdue').length;

  const openEdit = (rec: FeeRecord) => {
    setEditTarget(rec);
    setEditPaid(String(rec.paid));
    setEditTotalFee(String(rec.amount));
  };

  const handleSave = () => {
    if (!editTarget) return;
    const overrideAmt = Number(editTotalFee) || editTarget.amount;
    const newPaid = Math.min(Number(editPaid) || 0, overrideAmt);
    setFees(prev => prev.map(f => f.id === editTarget.id
      ? { ...f, amount: overrideAmt, paid: newPaid, status: computeStatus(newPaid, overrideAmt) }
      : f
    ));
    setEditTarget(null);
  };

  const handleSetClassFee = () => {
    if (!classFeeTarget) return;
    const amt = Number(classFeeAmount) || 0;
    setFees(prev => prev.map(f => {
      if (f.classId === classFeeTarget) {
        // Apply class fee. Paid amount remains but cap at new amount.
        const cPaid = Math.min(f.paid, amt);
        return { ...f, amount: amt, paid: cPaid, status: computeStatus(cPaid, amt) };
      }
      return f;
    }));
    setShowClassFee(false);
    setClassFeeTarget('');
    setClassFeeAmount('');
  };

  return (
    <div className="space-y-6 animate-element animate-delay-100">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-[var(--txt2)] mt-1">Manage Class Fees and Student Overrides.</p>
        </div>
        <button onClick={() => setShowClassFee(true)} className="flex items-center gap-2 bg-[var(--bg2)] border border-[var(--border)] text-[var(--txt)] px-4 py-2 rounded-xl hover:bg-[var(--bg3)] transition-all">
          <Settings className="w-4 h-4" /> Set Class Fee
        </button>
      </header>

      {/* Stats */}
      <div className="grid4">
        <div className="mc">
          <div className="mc-label">Total Collected</div>
          <div className="mc-value">₹{(totalCollected / 1000).toFixed(0)}K</div>
        </div>
        <div className="mc">
          <div className="mc-label">Outstanding Dues</div>
          <div className="mc-value">₹{(totalDue / 1000).toFixed(0)}K</div>
        </div>
        <div className="mc">
          <div className="mc-label">Overdue Students</div>
          <div className="mc-value">{overdueCount}</div>
        </div>
        <div className="mc">
          <div className="mc-label">Collection Rate</div>
          <div className="mc-value">{totalCollected + totalDue > 0 ? Math.round((totalCollected / (totalCollected + totalDue)) * 100) : 0}%</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex-wrap gap-3">
          <div>
            <div className="card-title">Fee Records</div>
            <div className="card-sub">{filtered.length} matching students</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--txt)] focus:outline-none">
              <option value="">All Classes</option>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={filterSection} onChange={e => setFilterSection(e.target.value)}
              className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--txt)] focus:outline-none">
              <option value="">All Sections</option>
              {SECTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
              className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--txt)] focus:outline-none">
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--txt3)]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Student Name…"
                className="pl-9 pr-4 py-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--txt)]" />
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class & Section</th>
                <th>Total Fee</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th className="text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const cfg = STATUS_CONFIG[f.status as keyof typeof STATUS_CONFIG];
                const Icon = cfg.icon;
                return (
                  <tr key={f.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="av w-8 h-8 bg-[var(--bg3)] text-[var(--txt)] text-xs font-bold">{f.student[0]}</div>
                        <span className="font-semibold text-[var(--txt)]">{f.student}</span>
                      </div>
                    </td>
                    <td className="mono text-[var(--txt2)] text-xs">{f.classId} - {f.section}</td>
                    <td className="font-semibold text-[var(--txt)]">₹{f.amount.toLocaleString()}</td>
                    <td className="text-emerald-400 font-semibold">₹{f.paid.toLocaleString()}</td>
                    <td className="text-rose-400 font-semibold">₹{(f.amount - f.paid).toLocaleString()}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(f)} title="Edit fee / override"
                          className="btn btn-ghost p-1.5 text-[var(--accent)] hover:bg-[var(--accent)]/10">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-[var(--txt3)]">No students match the filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Class Fee Modal */}
      {showClassFee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm">
             <div className="card-header border-b border-[var(--border)] pb-3">
               <div className="card-title">Set Class Fee</div>
               <button onClick={() => setShowClassFee(false)} className="btn btn-ghost p-1.5"><X className="w-4 h-4" /></button>
             </div>
             <div className="card-body p-5 space-y-4">
               <div>
                 <label className="text-xs font-semibold text-[var(--txt2)] block mb-1.5">Select Class</label>
                 <select value={classFeeTarget} onChange={e => setClassFeeTarget(e.target.value)} className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)] focus:outline-none">
                   <option value="">Choose Class...</option>
                   {CLASSES.map(c => <option key={c}>{c}</option>)}
                 </select>
               </div>
               <div>
                  <label className="text-xs font-semibold text-[var(--txt2)] block mb-1.5">Total Fee Amount (₹)</label>
                  <input type="number" value={classFeeAmount} onChange={e => setClassFeeAmount(e.target.value)}
                    placeholder="e.g. 15000" className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)] focus:outline-none" />
               </div>
             </div>
             <div className="flex p-4 border-t border-[var(--border)] gap-3 bg-[var(--bg2)] rounded-b-xl">
                <button onClick={() => setShowClassFee(false)} className="flex-1 px-4 py-2 rounded-xl bg-[var(--bg3)] hover:bg-[var(--border)] text-sm font-semibold transition-all">Cancel</button>
                <button onClick={handleSetClassFee} disabled={!classFeeTarget || !classFeeAmount} className="flex-1 px-4 py-2 rounded-xl bg-[var(--accent)] text-black font-bold text-sm disabled:opacity-50 transition-all">Apply to Class</button>
             </div>
          </div>
        </div>
      )}

      {/* Individual Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="av w-9 h-9 bg-[var(--accent)]/10 text-[var(--accent)]"><DollarSign className="w-5 h-5" /></div>
                <div>
                  <div className="card-title">Manage Student Fee</div>
                  <div className="card-sub">{editTarget.student} — {editTarget.classId}</div>
                </div>
              </div>
              <button onClick={() => setEditTarget(null)} className="btn btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>

            <div className="card-body space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--txt2)] mb-1.5 block">Override Total Fee (₹)</label>
                <input type="number" value={editTotalFee} onChange={e => setEditTotalFee(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--txt2)] mb-1.5 block">
                  Amount Paid (₹)
                </label>
                <input type="number" value={editPaid} onChange={e => setEditPaid(e.target.value)}
                  min={0} placeholder="e.g. 6000"
                  className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
              </div>
              <div className="bg-[var(--bg3)] rounded-xl px-4 py-3 text-sm space-y-1">
                <div className="flex justify-between text-[var(--txt2)]"><span>Total Fee</span><span className="font-semibold text-[var(--txt)]">₹{(Number(editTotalFee) || 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-[var(--txt2)]"><span>Amount Paid</span><span className="font-semibold text-emerald-400">₹{(Number(editPaid) || 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-[var(--txt2)]"><span>Balance</span><span className="font-semibold text-rose-400">₹{Math.max((Number(editTotalFee) || 0) - (Number(editPaid) || 0), 0).toLocaleString()}</span></div>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3 justify-end border-t border-[var(--border)] mt-2">
              <button onClick={() => setEditTarget(null)} className="btn btn-ghost px-5 py-2.5">Cancel</button>
              <button onClick={handleSave}
                className="flex items-center gap-2 bg-[var(--accent)] text-black font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
