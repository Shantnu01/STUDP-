// src/routes/analytics.js
import { Router } from 'express';
import { getDb } from '../lib/firebase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const PLAN_PRICE = { Enterprise: 12000, Growth: 7500, Starter: 2500 };

// GET /api/analytics/overview
router.get('/overview', requireAuth, async (req, res) => {
  try {
    const [schoolsSnap, paymentsSnap, requestsSnap] = await Promise.all([
      getDb().collection('schools').get(),
      getDb().collection('payments').get(),
      getDb().collection('requests').where('status', '==', 'pending').get(),
    ]);

    const schools  = schoolsSnap.docs.map(d => d.data());
    const payments = paymentsSnap.docs.map(d => d.data());

    const activeSchools = schools.filter(s => s.status === 'active');
    const mrr = activeSchools.reduce((a, s) => a + (PLAN_PRICE[s.plan] || 2500), 0);
    const totalStudents = schools.reduce((a, s) => a + (s.students || 0), 0);
    const totalRevenue  = payments.filter(p => p.status === 'paid').reduce((a, p) => a + (p.amount || 0), 0);

    const planDist = { Enterprise: 0, Growth: 0, Starter: 0 };
    schools.forEach(s => { if (planDist[s.plan] !== undefined) planDist[s.plan]++; });

    res.json({
      totalSchools:  schools.length,
      activeSchools: activeSchools.length,
      totalStudents,
      mrr,
      totalRevenue,
      pendingRequests: requestsSnap.size,
      planDistribution: planDist,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
