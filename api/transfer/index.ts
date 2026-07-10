import { connectToDatabase, getMemoryDb } from '../db.js'
import { getAuthorizedUser, verifyPassword } from '../security.js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // Caller auth check (Case transfer must be triggered by an authorized doctor or admin)
  const authUser = getAuthorizedUser(req)
  if (!authUser || (authUser.role !== 'doctor' && authUser.role !== 'admin')) {
    return res.status(401).json({ error: 'Unauthorized: Clinical staff privileges required.' })
  }

  const { patientId, patientPassword, newDoctor } = req.body

  if (!patientId || !patientPassword || !newDoctor) {
    return res.status(400).json({ error: 'Missing parameters. patientId, patientPassword, and newDoctor are required.' })
  }

  const cleanPatientId = patientId.trim().toUpperCase()

  try {
    const { db, isFallback } = await connectToDatabase()

    if (isFallback) {
      const memoryDb = getMemoryDb()
      const patient = memoryDb.patients.find(p => p.id.toUpperCase() === cleanPatientId)
      if (!patient) {
        return res.status(400).json({ error: 'Patient case not found in registry.' })
      }

      const correctPassword = patient.password || 'password'
      if (!verifyPassword(patientPassword, correctPassword)) {
        return res.status(400).json({ error: 'Authentication failed: Invalid password.' })
      }

      patient.doctor = newDoctor
      const { password: _, ...safeDoc } = patient
      return res.status(200).json({ success: true, patient: safeDoc })
    } else {
      const docRef = db!.collection('patients').doc(cleanPatientId)
      const docSnap = await docRef.get()
      if (!docSnap.exists) {
        return res.status(400).json({ error: 'Patient case not found in registry.' })
      }

      const patient = docSnap.data()!
      const correctPassword = patient.password || 'password'
      if (!verifyPassword(patientPassword, correctPassword)) {
        return res.status(400).json({ error: 'Authentication failed: Invalid password.' })
      }

      await docRef.update({ doctor: newDoctor })
      const updatedSnap = await docRef.get()
      const updatedPatient = updatedSnap.data()!
      const { password: _, ...safeDoc } = updatedPatient
      return res.status(200).json({ success: true, patient: safeDoc })
    }

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}
