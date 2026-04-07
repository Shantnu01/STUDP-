// src/routes/requests.js
import { Router } from 'express';
import { getDb } from '../lib/firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/requests
router.get('/', requireAuth, async (req, res) => {
  try {
    const snap = await getDb()
      .collection('requests')
      .orderBy('createdAt', 'desc')
      .get();
    const requests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id/approve
router.patch('/:id/approve', requireAuth, async (req, res) => {
  const db = getDb();
  const reqRef = db.collection('requests').doc(req.params.id);
  try {
    const reqDoc = await reqRef.get();
    if (!reqDoc.exists) return res.status(404).json({ error: 'Request not found' });

    const data = reqDoc.data();

    // Create a school from the request
    await db.collection('schools').add({
      name: data.schoolName,
      city: data.city || '',
      plan: data.plan || 'Starter',
      students: data.students || 0,
      email: data.email || '',
      phone: data.phone || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      approvedBy: req.user.email,
    });

    // Update request status
    await reqRef.update({ status: 'approved', reviewedBy: req.user.email, reviewedAt: new Date().toISOString() });

    res.json({ message: 'Request approved and school created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id/reject
router.patch('/:id/reject', requireAuth, async (req, res) => {
  try {
    await getDb().collection('requests').doc(req.params.id).update({
      status: 'rejected',
      reviewedBy: req.user.email,
      reviewedAt: new Date().toISOString(),
      reason: req.body.reason || '',
    });
    res.json({ message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
