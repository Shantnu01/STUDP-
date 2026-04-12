import { Router, Response } from 'express'
import { principalOnly, AuthRequest } from '../middleware/auth'
import { db } from '../config/firebase'

const router = Router()

/**
 * GET /api/dashboard/principal
 * Returns aggregated stats for the principal dashboard.
 * Scoped strictly to req.schoolId.
 */
router.get('/principal', ...principalOnly, async (req: AuthRequest, res: Response) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId) {
      return res.status(403).json({ error: 'School ID missing from profile' })
    }

    const today = new Date().toISOString().split('T')[0]

    // 1. Fetch all required counts in parallel
    const [
      studentsSnap,
      teachersSnap,
      staffSnap,
      classesSnap,
      feesSnap,
      attendanceSnap,
      noticesSnap,
      eventsSnap
    ] = await Promise.all([
      db.collection('students').where('schoolId', '==', schoolId).get(),
      db.collection('teachers').where('schoolId', '==', schoolId).get(),
      db.collection('staff').where('schoolId', '==', schoolId).get(),
      db.collection('classes').where('schoolId', '==', schoolId).get(),
      db.collection('studentFees').where('schoolId', '==', schoolId).get(),
      db.collection('attendance').where('schoolId', '==', schoolId).where('date', '==', today).get(),
      db.collection('notices').where('schoolId', '==', schoolId).orderBy('createdAt', 'desc').limit(5).get(),
      db.collection('events').where('schoolId', '==', schoolId).orderBy('date', 'asc').where('date', '>=', today).limit(5).get()
    ])

    // 2. Process Student Stats
    const totalStudents = studentsSnap.size
    let boysCount = 0
    let girlsCount = 0
    studentsSnap.docs.forEach(doc => {
      const gender = (doc.data().gender || '').toLowerCase()
      if (gender === 'male') boysCount++
      else if (gender === 'female') girlsCount++
    })

    // 3. Process Teacher Stats
    const activeTeachers = teachersSnap.docs.filter(doc => doc.data().status !== 'inactive').length

    // 4. Process Financial Stats
    let totalRevenue = 0
    let collectedRevenue = 0
    let pendingFeeStudents = 0
    feesSnap.docs.forEach(doc => {
      const data = doc.data()
      const amount = data.amount || 0
      const paid = data.paid || 0
      totalRevenue += amount
      collectedRevenue += paid
      if (paid < amount) pendingFeeStudents++
    })

    // 5. Process Attendance Stats
    let totalPresent = 0
    let totalPossible = 0
    attendanceSnap.docs.forEach(doc => {
      const data = doc.data()
      // Structure: isPresent: { [studentId]: boolean } or statuses: { [id]: 'present'|'absent' }
      const statuses = data.statuses || data.isPresent || {}
      Object.keys(statuses).forEach(id => {
        totalPossible++
        if (statuses[id] === true || statuses[id] === 'present') totalPresent++
      })
    })

    const attendanceRate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0

    // 6. Process Notices & Events
    const notices = noticesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // 7. Class Performance (Mocked for now, but ready for real data)
    // In a real app, this would be computed from a 'grades' or 'exams' collection
    const classPerformance = classesSnap.docs.map(doc => ({
      grade: doc.data().name,
      avg: 80, // Default for zero-state
      color: '#60a5fa'
    })).slice(0, 5)

    res.json({
      stats: {
        totalStudents,
        activeTeachers,
        totalStaff: staffSnap.size,
        totalClasses: classesSnap.size,
        attendanceToday: attendanceRate,
        feeCollection: collectedRevenue,
        pendingFees: pendingFeeStudents,
        totalRevenue,
      },
      demographics: {
        boysCount,
        girlsCount
      },
      notices,
      events,
      classPerformance
    })

  } catch (error: any) {
    console.error('[PrincipalDashboardStats]', error.message)
    res.status(500).json({ error: 'Failed to load dashboard statistics' })
  }
})

export default router
