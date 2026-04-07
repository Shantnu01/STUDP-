import { Router, Response } from 'express'
import { adminOnly, verifyToken, AuthRequest } from '../middleware/auth'
import { auth, db } from '../config/firebase'
import { z } from 'zod'

const router = Router()

// POST /api/auth/create-admin — create admin user + write to /admins collection
router.post('/create-admin', ...adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, displayName } = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      displayName: z.string().optional(),
    }).parse(req.body)

    const user = await auth.createUser({ email, password, displayName })
    await db.collection('admins').doc(user.uid).set({
      email, displayName: displayName || '', role: 'admin',
      createdBy: req.uid, createdAt: new Date().toISOString(),
    })
    res.status(201).json({ uid: user.uid, email })
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

const ADMIN_EMAIL = 'admin@edusync.in'

// GET /api/auth/me — current user info
router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const [user, adminDoc, userDoc] = await Promise.all([
      auth.getUser(req.uid!),
      db.collection('admins').doc(req.uid!).get(),
      db.collection('users').doc(req.uid!).get(),
    ])

    // Only the designated admin email with both admin-doc AND matching email may be admin
    if (adminDoc.exists && user.email === ADMIN_EMAIL) {
      return res.json({
        uid:         user.uid,
        email:       user.email,
        displayName: user.displayName || adminDoc.data()?.displayName,
        role:        'admin',
      })
    }

    // Check if they are a principal in the users collection
    if (userDoc.exists) {
      const userData = userDoc.data()!
      // Only active principals may access the portal
      if (userData.status === 'suspended') {
        return res.status(403).json({ error: 'Account suspended. Contact your administrator.' })
      }
      return res.json({
        uid:         user.uid,
        email:       user.email,
        displayName: user.displayName || userData.displayName,
        role:        userData.role ?? 'unknown',
        schoolId:    userData.schoolId,
        status:      userData.status,
      })
    }

    // Unknown user — return 403, not a 200 with 'user' role
    // This prevents unprovisioned accounts from being routed anywhere
    return res.status(403).json({ error: 'No portal access assigned to this account.' })
  } catch (e: any) {
    // Never expose internal error details
    console.error('[auth/me]', e.message)
    res.status(500).json({ error: 'Could not retrieve account information.' })
  }
})

// POST /api/auth/setup-first-admin — one-time bootstrap (disable after use!)
// Call this once to create your very first admin account
router.post('/setup-first-admin', async (req, res: Response) => {
  const SETUP_KEY = process.env.SETUP_KEY
  if (!SETUP_KEY || req.headers['x-setup-key'] !== SETUP_KEY) {
    return res.status(403).json({ error: 'Invalid setup key' })
  }
  try {
    const { email, password, displayName } = req.body
    const adminsSnap = await db.collection('admins').limit(1).get()
    if (!adminsSnap.empty) return res.status(400).json({ error: 'Admin already exists' })

    const user = await auth.createUser({ email, password, displayName: displayName || 'Admin' })
    await db.collection('admins').doc(user.uid).set({
      email, displayName: displayName || 'Admin', role: 'admin',
      createdAt: new Date().toISOString(),
    })
    res.status(201).json({ uid: user.uid, email, message: 'First admin created!' })
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

export default router
