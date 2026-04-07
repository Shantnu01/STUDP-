// src/pages/Schools.jsx
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { toast } from '../hooks/useToast.jsx';
import {
  Card, CardHeader, Badge, PlanBadge, Avatar, Btn, Spinner, Empty,
  Modal, Field, Input, Select, Textarea,
} from '../components/UI.jsx';

const EMPTY_FORM = { name: '', city: '', plan: 'Starter', students: '', email: '', phone: '', status: 'active', lastPayment: '', notes: '' };

function fmtDate(v) {
  if (!v) return '—';
  try { return new Date(v).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return v; }
}

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get('/schools');
      setSchools(data.schools || []);
      setFiltered(data.schools || []);
    } catch (e) { toast(e.message, 'err'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? schools.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.plan?.toLowerCase().includes(q)
    ) : schools);
  }, [search, schools]);

  function openAdd() { setForm(EMPTY_FORM); setAddOpen(true); }
  function openEdit(s) {
    setForm({ ...EMPTY_FORM, ...s, students: s.students || '', lastPayment: s.lastPayment || '' });
    setEditTarget(s);
  }

  async function handleAdd() {
    if (!form.name || !form.plan) { toast('Name and plan required', 'err'); return; }
    setSaving(true);
    try {
      await api.post('/schools', { ...form, students: Number(form.students) || 0 });
      toast('School added ✓', 'ok');
      setAddOpen(false);
      load();
    } catch (e) { toast(e.message, 'err'); }
    finally { setSaving(false); }
  }

  async function handleEdit() {
    setSaving(true);
    try {
      await api.patch(`/schools/${editTarget.id}`, { ...form, students: Number(form.students) || 0 });
      toast('School updated ✓', 'ok');
      setEditTarget(null);
      load();
    } catch (e) { toast(e.message, 'err'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${editTarget.name}"?`)) return;
    setSaving(true);
    try {
      await api.delete(`/schools/${editTarget.id}`);
      toast('School deleted', 'ok');
      setEditTarget(null);
      load();
    } catch (e) { toast(e.message, 'err'); }
    finally { setSaving(false); }
  }

  const F = (k) => ({ value: form[k], onChange: e => setForm(f => ({ ...f, [k]: e.target.value })) });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Topbar */}
      <div style={{
        height: 50, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1, letterSpacing: '-.3px' }}>All Schools</span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search schools…"
          style={{
            background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
            padding: '6px 12px', fontSize: 12, color: 'var(--txt)', outline: 'none', width: 220,
          }}
        />
        <Btn variant="accent" onClick={openAdd}>+ Add school</Btn>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <Card>
          <CardHeader title="Schools" subtitle={`${filtered.length} of ${schools.length}`} />
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={24} /></div>
          ) : filtered.length === 0 ? <Empty message="No schools found" /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['School', 'City', 'Plan', 'Students', 'Status', 'Email', 'Last Payment', ''].map((h, i) => (
                    <th key={i} style={{
                      fontSize: 9, textTransform: 'uppercase', letterSpacing: .8,
                      color: 'var(--txt3)', textAlign: 'left', padding: '8px 14px',
                      borderBottom: '1px solid var(--border)', fontWeight: 500, fontFamily: 'var(--mono)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <Avatar name={s.name} size={26} radius={6} />
                        <span style={{ fontWeight: 500 }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--txt2)' }}>{s.city || '—'}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}><PlanBadge plan={s.plan} /></td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, fontFamily: 'var(--mono)' }}>{(s.students || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}><Badge variant={s.status}>{s.status}</Badge></td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--txt2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{s.email || '—'}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--txt2)', fontFamily: 'var(--mono)' }}>{fmtDate(s.lastPayment)}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                      <Btn size="sm" onClick={() => openEdit(s)}>Edit</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add school" subtitle="New school record · Firestore / schools">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="School name"><Input placeholder="DPS Vasant Kunj" {...F('name')} /></Field>
          <Field label="City"><Input placeholder="New Delhi" {...F('city')} /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Plan">
            <Select {...F('plan')}><option>Starter</option><option>Growth</option><option>Enterprise</option></Select>
          </Field>
          <Field label="Students"><Input type="number" placeholder="1200" {...F('students')} /></Field>
        </div>
        <Field label="Contact email"><Input type="email" placeholder="principal@school.edu" {...F('email')} /></Field>
        <Field label="Contact phone"><Input placeholder="+91 98765 43210" {...F('phone')} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Status">
            <Select {...F('status')}><option value="active">Active</option><option value="overdue">Overdue</option><option value="suspended">Suspended</option></Select>
          </Field>
          <Field label="Last payment"><Input type="date" {...F('lastPayment')} /></Field>
        </div>
        <Field label="Notes"><Textarea placeholder="Internal notes…" {...F('notes')} /></Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn onClick={() => setAddOpen(false)}>Cancel</Btn>
          <Btn variant="accent" loading={saving} onClick={handleAdd}>Save to Firestore</Btn>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit school" subtitle={editTarget?.id}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="School name"><Input {...F('name')} /></Field>
          <Field label="City"><Input {...F('city')} /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Plan">
            <Select {...F('plan')}><option>Starter</option><option>Growth</option><option>Enterprise</option></Select>
          </Field>
          <Field label="Students"><Input type="number" {...F('students')} /></Field>
        </div>
        <Field label="Contact email"><Input type="email" {...F('email')} /></Field>
        <Field label="Contact phone"><Input {...F('phone')} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Status">
            <Select {...F('status')}><option value="active">Active</option><option value="overdue">Overdue</option><option value="suspended">Suspended</option></Select>
          </Field>
          <Field label="Last payment"><Input type="date" {...F('lastPayment')} /></Field>
        </div>
        <Field label="Notes"><Textarea {...F('notes')} /></Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="danger" onClick={handleDelete} loading={saving}>Delete</Btn>
          <Btn onClick={() => setEditTarget(null)}>Cancel</Btn>
          <Btn variant="accent" loading={saving} onClick={handleEdit}>Update</Btn>
        </div>
      </Modal>
    </div>
  );
}
