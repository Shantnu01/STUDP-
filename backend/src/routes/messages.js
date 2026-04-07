// src/routes/messages.js
import { Router } from 'express';
import { getDb } from '../lib/firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/messages  — list all school threads (last message preview)
router.get('/', requireAuth, async (req, res) => {
  try {
    const schoolsSnap = await getDb().collection('schools').get();
    const threads = [];

    for (const schoolDoc of schoolsSnap.docs) {
      const lastMsgSnap = await getDb()
        .collection('messages')
        .doc(schoolDoc.id)
        .collection('thread')
        .orderBy('ts', 'desc')
        .limit(1)
        .get();

      if (!lastMsgSnap.empty) {
        const msg = lastMsgSnap.docs[0].data();
        threads.push({
          schoolId: schoolDoc.id,
          schoolName: schoolDoc.data().name,
          lastMessage: msg.text,
          lastSender: msg.sender,
          lastTs: msg.ts?.toDate?.() || null,
        });
      }
    }

    threads.sort((a, b) => (b.lastTs || 0) - (a.lastTs || 0));
    res.json({ threads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/:schoolId/thread  — get all messages in a thread
router.get('/:schoolId/thread', requireAuth, async (req, res) => {
  try {
    const snap = await getDb()
      .collection('messages')
      .doc(req.params.schoolId)
      .collection('thread')
      .orderBy('ts', 'asc')
      .get();

    const messages = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      ts: d.data().ts?.toDate?.() || null,
    }));
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages/:schoolId/thread  — send a message
router.post('/:schoolId/thread', requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'text is required' });
  try {
    const ref = await getDb()
      .collection('messages')
      .doc(req.params.schoolId)
      .collection('thread')
      .add({
        text: text.trim(),
        sender: 'admin',
        senderEmail: req.user.email,
        ts: new Date(),
      });
    res.status(201).json({ id: ref.id, message: 'Sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
