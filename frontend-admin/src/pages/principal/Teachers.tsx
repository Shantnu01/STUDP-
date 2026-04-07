import { useState } from 'react';
import { Search, BookOpen, Mail, Phone, Plus, X, Save, UserRound, Edit, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Teacher {
  id:      string;
  name:    string;
  subject: string;
  classes: string[];
  email:   string;
  phone:   string;
  status:  'active' | 'on-leave' | 'inactive';
  gender:  string;
}

import { TEACHER_MOCK_DATA } from '@/lib/mockData';
const INITIAL_TEACHERS = TEACHER_MOCK_DATA as Teacher[];

type FormState = { name: string; subject: string; email: string; phone: string; gender: string; classesRaw: string; status: 'active' | 'on-leave' | 'inactive' };
const EMPTY_FORM: FormState = { name: '', subject: '', email: '', phone: '', gender: 'Male', classesRaw: '', status: 'active' };

const STATUS_OPTS: ('active' | 'on-leave' | 'inactive')[] = ['active', 'on-leave', 'inactive'];

export default function Teachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers]   = useState<Teacher[]>(INITIAL_TEACHERS);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState<'' | 'active' | 'on-leave' | 'inactive'>('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Teacher | null>(null);
  const [form, setForm]           = useState<FormState>({ ...EMPTY_FORM });
  const [saving, setSaving]       = useState(false);

  const f = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }));

  const filtered = teachers.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const active  = teachers.filter(t => t.status === 'active').length;
  const onLeave = teachers.filter(t => t.status === 'on-leave').length;

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (t: Teacher) => {
    setEditTarget(t);
    setForm({ name: t.name, subject: t.subject, email: t.email, phone: t.phone, gender: t.gender, classesRaw: t.classes.join(', '), status: t.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.subject.trim() || !form.email.trim()) return;
    setSaving(true);
    const classes = form.classesRaw ? form.classesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (editTarget) {
      setTeachers(prev => prev.map(t => t.id === editTarget.id ? { ...t, ...form, classes } : t));
    } else {
      setTeachers(prev => [{ id: String(Date.now()), classes, name: form.name, subject: form.subject, email: form.email, phone: form.phone, gender: form.gender, status: form.status }, ...prev]);
    }
    setForm({ ...EMPTY_FORM });
    setShowModal(false);
    setSaving(false);
  };

  const statusLabel = (s: string) => s === 'on-leave' ? 'On Leave' : s.charAt(0).toUpperCase() + s.slice(1);
  const statusCls   = (s: string) =>
    s === 'active'   ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
    s === 'on-leave' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                       'text-gray-400 bg-gray-400/10 border-gray-400/20';

  return (
    <div className="space-y-6 animate-element animate-delay-100">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
          <p className="text-[var(--txt2)] mt-1">Manage your school's teaching staff.</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[var(--accent)] text-black font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[var(--accent)]/20 self-start text-sm">
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="mc"><div className="mc-label">Total</div><div className="mc-value">{teachers.length}</div><div className="mc-delta up">Full faculty</div></div>
        <div className="mc"><div className="mc-label">Active</div><div className="mc-value">{active}</div><div className="mc-delta up">Present</div></div>
        <div className="mc"><div className="mc-label">On Leave</div><div className="mc-value">{onLeave}</div><div className="mc-delta dn">Temporary</div></div>
        <div className="mc"><div className="mc-label">Subjects</div><div className="mc-value">{new Set(teachers.map(t => t.subject)).size}</div><div className="mc-delta up">All mandatory</div></div>
      </div>

      <div className="card">
        <div className="card-header flex-wrap gap-3">
          <div>
            <div className="card-title">All Teachers</div>
            <div className="card-sub">{filtered.length} staff members</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Status filter */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
              className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--txt)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
              <option value="">All Status</option>
              {STATUS_OPTS.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--txt3)]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teacher or subject…"
                className="pl-9 pr-4 py-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--txt)]" />
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Subject</th>
                <th>Classes</th>
                <th>Contact</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="av w-9 h-9 bg-emerald-500/10 text-emerald-400 text-sm font-bold cursor-pointer"
                        title="Open direct message"
                        onClick={() => navigate(`/principal/chat?contactId=teacher${t.id}`)}>
                        {t.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--txt)]">{t.name}</p>
                        <p className="text-[11px] text-[var(--txt3)]">{t.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-[var(--txt2)]">
                      <BookOpen className="w-4 h-4 text-[var(--accent)]" />
                      <span className="text-sm">{t.subject}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {t.classes.map(c => (
                        <span key={c} className="text-xs font-medium px-2 py-0.5 bg-[var(--bg3)] rounded-md text-[var(--txt2)] mono">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--txt2)]"><Mail className="w-3 h-3" /> {t.email}</div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--txt2)]"><Phone className="w-3 h-3" /> {t.phone}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCls(t.status)}`}>
                      {statusLabel(t.status)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/principal/chat?contactId=teacher${t.id}`)} title="Send message"
                        className="btn btn-ghost p-1.5 hover:text-[var(--accent)]" >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(t)} title="Edit teacher"
                        className="btn btn-ghost p-1.5 text-[var(--accent)] hover:bg-[var(--accent)]/10">
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="av w-9 h-9 bg-emerald-500/10 text-emerald-400"><UserRound className="w-5 h-5" /></div>
                <div>
                  <div className="card-title">{editTarget ? 'Edit Teacher' : 'Add New Teacher'}</div>
                  <div className="card-sub">{editTarget ? `Editing ${editTarget.name}` : "Fill in the teacher's details below"}</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>

            <div className="card-body space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--txt2)] mb-1.5 block">Full Name *</label>
                <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Dr. Anita Rao"
                  className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--txt2)] mb-1.5 block">Subject *</label>
                  <input value={form.subject} onChange={e => f('subject', e.target.value)} placeholder="e.g. Mathematics"
                    className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--txt2)] mb-1.5 block">Gender</label>
                  <select value={form.gender} onChange={e => f('gender', e.target.value)}
                    className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--txt2)] mb-1.5 block">Email *</label>
                  <input value={form.email} onChange={e => f('email', e.target.value)} type="email" placeholder="teacher@school.edu"
                    className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--txt2)] mb-1.5 block">Phone</label>
                  <input value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+91 98765 00000"
                    className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--txt2)] mb-1.5 block">Assigned Classes</label>
                <input value={form.classesRaw} onChange={e => f('classesRaw', e.target.value)} placeholder="e.g. 10-A, 11-B, 12-C  (comma-separated)"
                  className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--txt2)] mb-1.5 block">Status</label>
                <select value={form.status} onChange={e => f('status', e.target.value)}
                  className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--txt)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3 justify-end border-t border-[var(--border)] mt-2">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost px-5 py-2.5">Cancel</button>
              <button onClick={handleSave} disabled={!form.name.trim() || !form.subject.trim() || !form.email.trim() || saving}
                className="flex items-center gap-2 bg-[var(--accent)] text-black font-bold px-5 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm">
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
