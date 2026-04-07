// src/routes/payments.js
import { Router } from 'express';
import { getDb } from '../lib/firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/payments
router.get('/', requireAuth, async (req, res) => {
  try {
    const snap = await getDb()
      .collection('payments')
      .orderBy('createdAt', 'desc')
      .get();
    const payments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments — create payment / invoice
router.post('/', requireAuth, async (req, res) => {
  const { schoolId, schoolName, plan, amount, status, dueDate } = req.body;
  if (!schoolId || !amount) {
    return res.status(400).json({ error: 'schoolId and amount are required' });
  }
  try {
    const ref = await getDb().collection('payments').add({
      schoolId, schoolName: schoolName || '',
      plan: plan || 'Starter',
      amount: Number(amount),
      status: status || 'pending',
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      createdBy: req.user.email,
    });
    res.status(201).json({ id: ref.id, message: 'Payment created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/payments/:id  — mark paid / overdue
router.patch('/:id', requireAuth, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  try {
    await getDb().collection('payments').doc(req.params.id).update({
      status,
      updatedAt: new Date().toISOString(),
    });
    res.json({ message: 'Payment updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/stats — billing summary
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const snap = await getDb().collection('payments').get();
    const all = snap.docs.map(d => d.data());

    const collected = all.filter(p => p.status === 'paid').reduce((a, p) => a + (p.amount || 0), 0);
    const overdue   = all.filter(p => p.status === 'overdue').reduce((a, p) => a + (p.amount || 0), 0);
    const pending   = all.filter(p => p.status === 'pending').reduce((a, p) => a + (p.amount || 0), 0);

    res.json({ collected, overdue, pending, total: all.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
