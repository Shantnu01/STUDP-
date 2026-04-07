import { Router, Response } from 'express'
import { adminOnly, verifyToken, AuthRequest } from '../middleware/auth'
import { db } from '../config/firebase'
import { z } from 'zod'

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
export const paymentsRouter = Router()

const PaymentSchema = z.object({
  schoolId:   z.string(),
  schoolName: z.string(),
  plan:       z.enum(['Starter', 'Growth', 'Enterprise']),
  amount:     z.number().positive(),
  status:     z.enum(['paid', 'pending', 'overdue', 'failed']).default('pending'),
  date:       z.string(),
  due:        z.string().optional(),
})

paymentsRouter.get('/', ...adminOnly, async (_req, res: Response) => {
  const snap = await db.collection('payments').orderBy('createdAt', 'desc').get()
  res.json({ payments: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
})

paymentsRouter.post('/', ...adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const data = PaymentSchema.parse(req.body)
    const ref = await db.collection('payments').add({ ...data, createdAt: new Date().toISOString(), createdBy: req.uid })
    res.status(201).json({ id: ref.id, ...data })
  } catch (e: any) {
    res.status(e.name === 'ZodError' ? 400 : 500).json({ error: e.errors ?? e.message })
  }
})

paymentsRouter.patch('/:id/status', ...adminOnly, async (req: AuthRequest, res: Response) => {
  const { status } = z.object({ status: z.enum(['paid','pending','overdue','failed']) }).parse(req.body)
  await db.collection('payments').doc(req.params.id).update({ status, updatedAt: new Date().toISOString() })
  res.json({ id: req.params.id, status })
})

paymentsRouter.get('/summary', ...adminOnly, async (_req, res: Response) => {
  const snap = await db.collection('payments').get()
  const all  = snap.docs.map(d => d.data() as any)
  res.json({
    totalPaid:    all.filter(p => p.status === 'paid').reduce((a: number, p: any) => a + p.amount, 0),
    totalOverdue: all.filter(p => p.status === 'overdue').reduce((a: number, p: any) => a + p.amount, 0),
    countFailed:  all.filter(p => p.status === 'failed').length,
    count:        all.length,
  })
})

// ── REGISTRATIONS ─────────────────────────────────────────────────────────────
export const registrationsRouter = Router()

const RegSchema = z.object({
  schoolName:  z.string().min(2),
  city:        z.string().default(''),
  plan:        z.string().default('None'),
  students:    z.number().int().min(0).default(0),
  email:       z.string().email(),
  contactName: z.string().min(2),
  phone:       z.string().optional().default(''),
  message:     z.string().optional(),
  uid:         z.string().optional().default(''),
})

// Public: anyone can submit a registration
registrationsRouter.post('/', async (req, res: Response) => {
  try {
    const data = RegSchema.parse(req.body)
    const ref = await db.collection('registrations').add({
      ...data, status: 'pending', createdAt: new Date().toISOString(),
    })
    res.status(201).json({ id: ref.id, message: 'Registration submitted. We\'ll be in touch!' })
  } catch (e: any) {
    res.status(e.name === 'ZodError' ? 400 : 500).json({ error: e.errors ?? e.message })
  }
})

registrationsRouter.get('/', ...adminOnly, async (_req, res: Response) => {
  const snap = await db.collection('registrations').orderBy('createdAt', 'desc').get()
  res.json({ registrations: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
})

registrationsRouter.patch('/:id/approve', ...adminOnly, async (req: AuthRequest, res: Response) => {
  const regDoc = await db.collection('registrations').doc(req.params.id).get()
  if (!regDoc.exists) return res.status(404).json({ error: 'Not found' })
  const reg = regDoc.data()!
  // Approve: update status + create school
  await db.collection('registrations').doc(req.params.id).update({ 
    status: 'approved', approvedBy: req.uid, approvedAt: new Date().toISOString() 
  })
  
  const schoolRef = await db.collection('schools').add({
    name: reg.schoolName, city: reg.city, plan: reg.plan,
    students: reg.students, email: reg.email, phone: reg.phone || '',
    status: 'active', lastPayment: '', createdAt: new Date().toISOString(),
  })

  // Create the principal user record
  // We assume the UID was provided during signup (as cred.user.uid)
  if (reg.uid) {
    await db.collection('users').doc(reg.uid).set({
      email:       reg.email,
      displayName: reg.contactName,
      role:        'principal',
      schoolId:    schoolRef.id,
      status:      'active',
      createdAt:   new Date().toISOString(),
    })
  }

  res.json({ approved: req.params.id, schoolId: schoolRef.id, userId: reg.uid })
})

registrationsRouter.patch('/:id/reject', ...adminOnly, async (req: AuthRequest, res: Response) => {
  await db.collection('registrations').doc(req.params.id).update({ status: 'rejected', rejectedBy: req.uid, rejectedAt: new Date().toISOString() })
  res.json({ rejected: req.params.id })
})

// ── MESSAGING ─────────────────────────────────────────────────────────────────
export const messagesRouter = Router()

messagesRouter.get('/:schoolId/thread', ...adminOnly, async (req, res: Response) => {
  const snap = await db.collection('messages').doc(req.params.schoolId).collection('thread').orderBy('ts').get()
  res.json({ messages: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
})

messagesRouter.post('/:schoolId/thread', [verifyToken], async (req: AuthRequest, res: Response) => {
  const { text } = z.object({ text: z.string().min(1) }).parse(req.body)
  const ref = await db.collection('messages').doc(req.params.schoolId).collection('thread').add({
    text, sender: 'admin', senderEmail: req.email, ts: new Date().toISOString(),
  })
  res.status(201).json({ id: ref.id, text })
})

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
export const analyticsRouter = Router()

analyticsRouter.get('/dashboard', ...adminOnly, async (_req, res: Response) => {
  const [schoolsSnap, paymentsSnap, registrationsSnap] = await Promise.all([
    db.collection('schools').get(),
    db.collection('payments').get(),
    db.collection('registrations').where('status', '==', 'pending').get(),
  ])
  const schools  = schoolsSnap.docs.map(d => d.data() as any)
  const payments = paymentsSnap.docs.map(d => d.data() as any)
  const PRICES   = { Enterprise: 12000, Growth: 7500, Starter: 2500 } as any
  const active   = schools.filter((s: any) => s.status === 'active')
  const mrr      = active.reduce((a: number, s: any) => a + (PRICES[s.plan] ?? 2500), 0)
  res.json({
    mrr, arr: mrr * 12,
    activeSchools:    active.length,
    totalSchools:     schools.length,
    pendingRequests:  registrationsSnap.size,
    overdueSchools:   schools.filter((s: any) => s.status === 'overdue').length,
    totalRevenue:     payments.filter((p: any) => p.status === 'paid').reduce((a: number, p: any) => a + p.amount, 0),
    planSplit: ['Enterprise', 'Growth', 'Starter'].map(p => ({
      plan: p, count: schools.filter((s: any) => s.plan === p).length,
      revenue: schools.filter((s: any) => s.plan === p && s.status === 'active').reduce((a: number) => a + PRICES[p], 0),
    })),
  })
})

// ── SCHOOLS ───────────────────────────────────────────────────────────────────
export const schoolsRouter = Router()

schoolsRouter.get('/', ...adminOnly, async (_req, res: Response) => {
  const snap = await db.collection('schools').orderBy('name').get()
  res.json({ schools: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
})

schoolsRouter.post('/', ...adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const ref = await db.collection('schools').add({ ...req.body, createdAt: new Date().toISOString(), createdBy: req.uid })
    res.status(201).json({ id: ref.id, ...req.body })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

schoolsRouter.patch('/:id', ...adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    await db.collection('schools').doc(req.params.id).update({ ...req.body, updatedAt: new Date().toISOString() })
    res.json({ id: req.params.id, updated: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

schoolsRouter.delete('/:id', ...adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const schoolDoc = await db.collection('schools').doc(req.params.id).get()
    if (!schoolDoc.exists) return res.status(404).json({ error: 'School not found' })
    await db.collection('schools').doc(req.params.id).delete()
    res.json({ deleted: req.params.id, message: 'School deleted successfully' })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})
