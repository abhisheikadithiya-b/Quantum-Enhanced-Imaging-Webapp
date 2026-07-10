import { connectToDatabase, getMemoryDb } from '../db.js'
import { getAuthorizedUser, hashPassword } from '../security.js'

export default async function handler(req: any, res: any) {
  const { method } = req

  // Authorization and RBAC check (Doctors registry can only be managed by Admin)
  const authUser = getAuthorizedUser(req)
  if (!authUser || authUser.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized: Admin access required.' })
  }

  try {
    const { db, isFallback } = await connectToDatabase()

    if (method === 'GET') {
      if (isFallback) {
        const memoryDb = getMemoryDb()
        return res.status(200).json(memoryDb.doctors)
      } else {
        const snap = await db!.collection('doctors').get()
        const list: any[] = []
        snap.forEach(doc => {
          list.push(doc.data())
        })
        return res.status(200).json(list)
      }
    }

    if (method === 'POST') {
      const doctorData = req.body
      if (!doctorData.id || !doctorData.name || !doctorData.password) {
        return res.status(400).json({ error: 'License ID, Name, and Password are required' })
      }

      // Hash the password securely before saving
      const securedDoc = {
        ...doctorData,
        password: hashPassword(doctorData.password)
      }

      if (isFallback) {
        const memoryDb = getMemoryDb()
        if (memoryDb.doctors.some(d => d.id === securedDoc.id)) {
          return res.status(400).json({ error: 'Doctor with this License ID already exists' })
        }
        memoryDb.doctors.push(securedDoc)
        return res.status(201).json(securedDoc)
      } else {
        const docRef = db!.collection('doctors').doc(securedDoc.id)
        const docSnap = await docRef.get()
        if (docSnap.exists) {
          return res.status(400).json({ error: 'Doctor with this License ID already exists' })
        }
        await docRef.set(securedDoc)
        return res.status(201).json(securedDoc)
      }
    }

    if (method === 'PUT') {
      const doctorData = req.body
      if (!doctorData.id) {
        return res.status(400).json({ error: 'Doctor ID is required for update' })
      }

      const { ...cleanData } = doctorData
      
      // Hash password if the admin modified it
      if (cleanData.password) {
        if (!cleanData.password.includes(':')) {
          cleanData.password = hashPassword(cleanData.password)
        }
      }

      if (isFallback) {
        const memoryDb = getMemoryDb()
        const index = memoryDb.doctors.findIndex(d => d.id === cleanData.id)
        if (index === -1) return res.status(404).json({ error: 'Doctor not found' })
        memoryDb.doctors[index] = { ...memoryDb.doctors[index], ...cleanData }
        return res.status(200).json(memoryDb.doctors[index])
      } else {
        await db!.collection('doctors').doc(cleanData.id).update(cleanData)
        const docSnap = await db!.collection('doctors').doc(cleanData.id).get()
        return res.status(200).json(docSnap.data())
      }
    }

    if (method === 'DELETE') {
      const { id } = req.query
      if (!id) {
        return res.status(400).json({ error: 'Doctor ID is required for deletion' })
      }

      if (isFallback) {
        const memoryDb = getMemoryDb()
        const index = memoryDb.doctors.findIndex(d => d.id === id)
        if (index === -1) return res.status(404).json({ error: 'Doctor not found' })
        memoryDb.doctors.splice(index, 1)
        return res.status(200).json({ success: true })
      } else {
        const docRef = db!.collection('doctors').doc(id as string)
        const docSnap = await docRef.get()
        if (!docSnap.exists) {
          return res.status(404).json({ error: 'Doctor not found' })
        }
        await docRef.delete()
        return res.status(200).json({ success: true })
      }
    }

    return res.status(405).json({ error: 'Method Not Allowed' })

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}
