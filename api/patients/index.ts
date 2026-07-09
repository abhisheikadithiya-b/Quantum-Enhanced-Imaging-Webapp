import { connectToDatabase, getMemoryDb } from '../db'
import { getAuthorizedUser, hashPassword } from '../security'

export default async function handler(req: any, res: any) {
  const { method } = req

  // Authorization token verification
  const authUser = getAuthorizedUser(req)
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' })
  }

  try {
    const { db, isFallback } = await connectToDatabase()

    if (method === 'GET') {
      const { id, doctor } = req.query

      // RBAC: If logged in as patient, restrict access only to their own record
      if (authUser.role === 'patient') {
        if (id && id !== authUser.userId) {
          return res.status(403).json({ error: 'Forbidden: Patients can only access their own dossier.' })
        }
        const targetId = authUser.userId
        if (isFallback) {
          const memoryDb = getMemoryDb()
          const patient = memoryDb.patients.find(p => p.id === targetId)
          if (!patient) return res.status(404).json({ error: 'Patient not found' })
          const { password: _, ...patientWithoutPassword } = patient
          return res.status(200).json(patientWithoutPassword)
        } else {
          const patient = await db!.collection('patients').findOne({ id: targetId })
          if (!patient) return res.status(404).json({ error: 'Patient not found' })
          const { password: _, ...patientWithoutPassword } = patient
          return res.status(200).json(patientWithoutPassword)
        }
      }

      // If doctor or admin:
      if (id) {
        if (isFallback) {
          const memoryDb = getMemoryDb()
          const patient = memoryDb.patients.find(p => p.id === id)
          if (!patient) return res.status(404).json({ error: 'Patient not found' })
          const { password: _, ...patientWithoutPassword } = patient
          return res.status(200).json(patientWithoutPassword)
        } else {
          const patient = await db!.collection('patients').findOne({ id })
          if (!patient) return res.status(404).json({ error: 'Patient not found' })
          const { password: _, ...patientWithoutPassword } = patient
          return res.status(200).json(patientWithoutPassword)
        }
      }

      if (isFallback) {
        const memoryDb = getMemoryDb()
        let list = memoryDb.patients
        if (doctor) {
          list = list.filter(p => p.doctor.name.toLowerCase() === doctor.toLowerCase())
        }
        const safeList = list.map(({ password: _, ...rest }) => rest)
        return res.status(200).json(safeList)
      } else {
        let query = {}
        if (doctor) {
          query = { "doctor.name": { $regex: new RegExp(`^${doctor}$`, 'i') } }
        }
        const list = await db!.collection('patients').find(query).toArray()
        const safeList = list.map(({ password: _, ...rest }) => rest)
        return res.status(200).json(safeList)
      }
    }

    // Write operations require Doctor or Admin role
    if (authUser.role !== 'doctor' && authUser.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Write operations restricted to clinical staff.' })
    }

    if (method === 'POST') {
      const patientData = req.body
      if (!patientData.name) {
        return res.status(400).json({ error: 'Patient name is required' })
      }

      const pass = patientData.password || 'password'
      const securedPatient = {
        ...patientData,
        password: hashPassword(pass)
      }

      if (isFallback) {
        const memoryDb = getMemoryDb()
        memoryDb.patients.push(securedPatient)
        const { password: _, ...safeDoc } = securedPatient
        return res.status(201).json(safeDoc)
      } else {
        await db!.collection('patients').insertOne(securedPatient)
        const { password: _, ...safeDoc } = securedPatient
        return res.status(201).json(safeDoc)
      }
    }

    if (method === 'PUT') {
      const patientData = req.body
      if (!patientData.id) {
        return res.status(400).json({ error: 'Patient ID is required for update' })
      }

      const { _id, ...cleanData } = patientData

      if (cleanData.password) {
        if (!cleanData.password.includes(':')) {
          cleanData.password = hashPassword(cleanData.password)
        }
      }

      if (isFallback) {
        const memoryDb = getMemoryDb()
        const index = memoryDb.patients.findIndex(p => p.id === cleanData.id)
        if (index === -1) return res.status(404).json({ error: 'Patient not found' })
        memoryDb.patients[index] = { ...memoryDb.patients[index], ...cleanData }
        const { password: _, ...safeDoc } = memoryDb.patients[index]
        return res.status(200).json(safeDoc)
      } else {
        await db!.collection('patients').updateOne(
          { id: cleanData.id },
          { $set: cleanData }
        )
        const updatedDoc = await db!.collection('patients').findOne({ id: cleanData.id })
        if (!updatedDoc) return res.status(404).json({ error: 'Patient not found' })
        const { password: _, ...safeDoc } = updatedDoc
        return res.status(200).json(safeDoc)
      }
    }

    return res.status(405).json({ error: 'Method Not Allowed' })

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}
