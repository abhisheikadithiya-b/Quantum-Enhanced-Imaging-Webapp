import { connectToDatabase, getMemoryDb } from '../db'
import { getAuthorizedUser, verifyPassword } from '../security'

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
      const patient = await db!.collection('patients').findOne({ id: { $regex: new RegExp(`^${cleanPatientId}$`, 'i') } })
      if (!patient) {
        return res.status(400).json({ error: 'Patient case not found in registry.' })
      }

      const correctPassword = patient.password || 'password'
      if (!verifyPassword(patientPassword, correctPassword)) {
        return res.status(400).json({ error: 'Authentication failed: Invalid password.' })
      }

      await db!.collection('patients').updateOne(
        { id: patient.id },
        { $set: { doctor: newDoctor } }
      )

      const updatedPatient = await db!.collection('patients').findOne({ id: patient.id })
      if (!updatedPatient) return res.status(404).json({ error: 'Patient not found' })
      const { password: _, ...safeDoc } = updatedPatient
      return res.status(200).json({ success: true, patient: safeDoc })
    }

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}
