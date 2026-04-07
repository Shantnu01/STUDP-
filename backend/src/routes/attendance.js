import { Router } from 'express';
import { getDb } from '../lib/firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/attendance
// Query: ?schoolId&type&month=YYYY-MM
router.get('/', requireAuth, async (req, res) => {
  const { schoolId, type, month } = req.query;
  
  if (!schoolId || !type || !month) {
    return res.status(400).json({ error: 'Missing schoolId, type, or month' });
  }

  try {
    const docId = `${schoolId}_${type}_${month}`;
    const doc = await getDb().collection('attendance_monthly').doc(docId).get();
    
    if (!doc.exists) {
      return res.json({ records: {} });
    }
    
    res.json({ records: doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance
// Body: { schoolId, type, date, updates: { [personId]: boolean } }
router.post('/', requireAuth, async (req, res) => {
  const { schoolId, type, date, updates } = req.body;
  
  if (!schoolId || !type || !date || !updates) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 🔴 RULE 1 & 4 ENFORCEMENT: Students are strictly view-only.
  if (type === 'students') {
    return res.status(403).json({ error: 'Student attendance is strictly view-only from the admin portal.' });
  }

  // 🔴 RULE 2 & 3 ENFORCEMENT: Server-side midnight lock.
  // Get current server date in YYYY-MM-DD
  const serverToday = new Date().toISOString().split('T')[0];
  if (date !== serverToday) {
    return res.status(403).json({ error: 'Attendance can only be edited for the current day. Past dates are locked permanently.' });
  }

  const month = date.substring(0, 7); // Extracts 'YYYY-MM'
  const docId = `${schoolId}_${type}_${month}`;

  try {
    const docRef = getDb().collection('attendance_monthly').doc(docId);
    
    // We construct a nested update payload to avoid overwriting other people's data
    // Format: { "personId.YYYY-MM-DD": true/false }
    const firestoreUpdates = {};
    for (const [personId, status] of Object.entries(updates)) {
      firestoreUpdates[`${personId}.${date}`] = status;
    }

    await docRef.set(firestoreUpdates, { merge: true });

    res.json({ message: 'Attendance saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
