import { Router, Response } from 'express'
import { staffOnly, AuthRequest } from '../middleware/auth'
import { db } from '../config/firebase'
import { z } from 'zod'

const router = Router()

const AttendanceSchema = z.object({
  classId: z.string(),
  date: z.string(),
  isPresent: z.record(z.string(), z.boolean()),
})

function buildAttendanceId(schoolId: string, classId: string, date: string) {
  return `${schoolId}__${classId}__${date}`
}

function resolveSchoolId(req: AuthRequest) {
  return req.schoolId || (typeof req.query.schoolId === 'string' ? req.query.schoolId : '') || (typeof req.body.schoolId === 'string' ? req.body.schoolId : '')
}

// GET /api/attendance
router.get('/', ...staffOnly, async (req: AuthRequest, res: Response) => {
  try {
    const classId = typeof req.query.classId === 'string' ? req.query.classId : ''
    const date = typeof req.query.date === 'string' ? req.query.date : ''
    if (!classId || !date) return res.status(400).json({ error: 'classId and date required' })

    const schoolId = resolveSchoolId(req)
    if (!schoolId) return res.status(403).json({ error: 'School ID missing' })

    const doc = await db.collection('attendance').doc(buildAttendanceId(schoolId, classId, date)).get()
    if (!doc.exists) return res.json({ attendance: null })

    res.json({ attendance: { id: doc.id, ...doc.data() } })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/attendance - record attendance
router.post('/', ...staffOnly, async (req: AuthRequest, res: Response) => {
  try {
    const data = AttendanceSchema.parse(req.body)
    const schoolId = resolveSchoolId(req)
    if (!schoolId) return res.status(403).json({ error: 'School ID missing' })

    if (data.classId === 'students') {
      return res.status(403).json({ error: 'Student attendance is strictly view-only from the portal. Edits are forbidden.' })
    }

    const serverToday = new Date().toISOString().split('T')[0]
    if (data.date !== serverToday) {
      return res.status(403).json({ error: 'Attendance can only be edited for the current day. Past dates are locked permanently.' })
    }

    const docId = buildAttendanceId(schoolId, data.classId, data.date)
    const docRef = db.collection('attendance').doc(docId)
    const existing = await docRef.get()
    const now = new Date().toISOString()

    await docRef.set({
      ...data,
      schoolId,
      updatedAt: now,
      updatedBy: req.uid,
      ...(existing.exists ? {} : { createdAt: now, createdBy: req.uid }),
    }, { merge: true })

    res.status(existing.exists ? 200 : 201).json({ id: docId, ...data })
  } catch (e: any) {
    res.status(e.name === 'ZodError' ? 400 : 500).json({ error: e.errors ?? e.message })
  }
})

export default router
