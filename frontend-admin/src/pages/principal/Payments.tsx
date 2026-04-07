import { useState, useMemo } from 'react';
import { DollarSign, Search, Edit, X, Save, CheckCircle2, Clock } from 'lucide-react';
import { TEACHER_MOCK_DATA, STAFF_MOCK_DATA } from '@/lib/mockData';

interface PaymentRecord {
  id: string;
  name: string;
  type: 'teacher' | 'staff';
  totalAmount: number;
  amountToBePaid: number;
  status: 'paid' | 'pending';
}

function buildInitialPayments(): PaymentRecord[] {
  const teachers: PaymentRecord[] = TEACHER_MOCK_DATA.map(t => ({
    id: `t-${t.id}`,
    name: t.name,
    type: 'teacher',
    totalAmount: 50000,
    amountToBePaid: 50000,
    status: 'pending'
  }));

  const staff: PaymentRecord[] = STAFF_MOCK_DATA.map(s => ({
    id: `s-${s.id}`,
    name: s.name,
    type: 'staff',
    totalAmount: 30000,
    amountToBePaid: 30000,
    status: 'pending'
  }));

  return [...teachers, ...staff];
}

export default function Payments() {
  const [records, setRecords] = useState<PaymentRecord[]>(buildInitialPayments());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'teacher' | 'staff'>('all');
  const [editTarget, setEditTarget] = useState<PaymentRecord | null>(null);
  const [form, setForm] = useState({ totalAmount: 0, amountToBePaid: 0, status: 'pending' as 'paid' | 'pending' });

  const filtered = useMemo(() => records.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || r.type === filterType;
    return matchSearch && matchType;
  }), [records, searchTerm, filterType]);

  const openEdit = (r: PaymentRecord) => {
    setEditTarget(r);
    setForm({ totalAmount: r.totalAmount, amountToBePaid: r.amountToBePaid, status: r.status });
  };

  const handleSave = () => {
    if (!editTarget) return;
    setRecords(prev => prev.map(r => r.id === editTarget.id ? { ...r, ...form } : r));
    setEditTarget(null);
  };

  return (
    <div className="space-y-6 animate-element">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Staff Payments</h1>
        <p className="text-[var(--txt2)] mt-1">Track and manage salaries/payments for teachers and staff.</p>
      </header>

      <div className="card">
        <div className="card-header flex-wrap gap-3">
          <div>
            <div className="card-title">Payment List</div>
            <div className="card-sub">{filtered.length} records found</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={filterType} onChange={e => setFilterType(e.target.value as any)}
              className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--txt)]">
              <option value="all">All Roles</option>
              <option value="teacher">Teachers</option>
              <option value="staff">Staff</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--txt3)]" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search name..."
                className="pl-9 pr-4 py-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-sm text-[var(--txt)]" />
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Total Amount</th>
                <th>Amount to be Paid</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="av w-8 h-8 bg-[var(--bg3)] text-[var(--txt)] text-xs font-bold">{r.name[0]}</div>
                      <span className="font-semibold text-[var(--txt)]">{r.name}</span>
                    </div>
                  </td>
                  <td className="capitalize text-[var(--txt2)] text-sm">{r.type}</td>
                  <td className="font-semibold">₹{r.totalAmount.toLocaleString()}</td>
                  <td className="text-amber-400 font-semibold">₹{r.amountToBePaid.toLocaleString()}</td>
                  <td>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${r.status === 'paid' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end">
                      <button onClick={() => openEdit(r)} className="btn btn-ghost p-1.5 text-[var(--accent)]">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="card-header">
              <div className="card-title">Edit Payment: {editTarget.name}</div>
              <button onClick={() => setEditTarget(null)} className="btn btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--txt2)] block mb-1.5">Total Amount (₹)</label>
                <input type="number" value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: Number(e.target.value) })}
                  className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--txt2)] block mb-1.5">Amount to be Paid (₹)</label>
                <input type="number" value={form.amountToBePaid} onChange={e => setForm({ ...form, amountToBePaid: Number(e.target.value) })}
                  className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--txt2)] block mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}
                  className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)]">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3 justify-end mt-2">
              <button onClick={() => setEditTarget(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSave} className="bg-[var(--accent)] text-black font-bold px-5 py-2 rounded-xl text-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
