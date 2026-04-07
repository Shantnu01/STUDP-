// src/routes/schools.js
import { Router } from 'express';
import { getDb, getAuth } from '../lib/firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/schools  — list all schools
router.get('/', requireAuth, async (req, res) => {
  try {
    const snap = await getDb()
      .collection('schools')
      .orderBy('createdAt', 'desc')
      .get();

    const schools = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ schools });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/schools/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await getDb().collection('schools').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'School not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/schools  — create school
router.post('/', requireAuth, async (req, res) => {
  const { name, city, plan, students, email, phone, status, notes, lastPayment } = req.body;
  if (!name || !plan) {
    return res.status(400).json({ error: 'name and plan are required' });
  }
  try {
    const ref = await getDb().collection('schools').add({
      name, city: city || '',
      plan, students: Number(students) || 0,
      email: email || '', phone: phone || '',
      status: status || 'active',
      notes: notes || '',
      lastPayment: lastPayment || null,
      createdAt: new Date().toISOString(),
      createdBy: req.user.email,
    });
    res.status(201).json({ id: ref.id, message: 'School created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/schools/:id  — update school
router.patch('/:id', requireAuth, async (req, res) => {
  const allowed = ['name','city','plan','students','email','phone','status','notes','lastPayment'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  updates.updatedAt = new Date().toISOString();
  updates.updatedBy = req.user.email;

  try {
    await getDb().collection('schools').doc(req.params.id).update(updates);
    res.json({ message: 'School updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/schools/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const docRef = db.collection('schools').doc(req.params.id);
    const doc = await docRef.get();
    
    if (doc.exists) {
      const email = doc.data().email;
      if (email) {
        try {
          const userRecord = await getAuth().getUserByEmail(email);
          await getAuth().deleteUser(userRecord.uid);
          console.log(`Deleted auth user for email: ${email}`);
        } catch (authErr) {
          console.error("Auth user could not be deleted or doesn't exist:", authErr.message);
        }
      }
    }

    await docRef.delete();
    res.json({ message: 'School and associated account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
