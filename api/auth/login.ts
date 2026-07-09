import { connectToDatabase, getMemoryDb } from '../db'
import { verifyPassword, generateToken } from '../security'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { role, id, password } = req.body
  
  if (!role || !id || !password) {
    return res.status(400).json({ error: 'Missing credentials' })
  }

  const cleanId = id.trim().toUpperCase()

  try {
    const { db, isFallback } = await connectToDatabase()
    let matchedUser: any = null

    if (role === 'doctor') {
      if (isFallback) {
        const memoryDb = getMemoryDb()
        matchedUser = memoryDb.doctors.find(d => d.id.toUpperCase() === cleanId)
      } else {
        matchedUser = await db!.collection('doctors').findOne({ id: { $regex: new RegExp(`^${cleanId}$`, 'i') } })
      }

      if (matchedUser && verifyPassword(password, matchedUser.password)) {
        const { password: _, ...userWithoutPassword } = matchedUser
        const token = generateToken({ userId: matchedUser.id, role: 'doctor', name: matchedUser.name })
        return res.status(200).json({ success: true, token, user: userWithoutPassword })
      }
      return res.status(400).json({ error: 'Invalid License ID or Password.' })
    }

    if (role === 'patient') {
      if (isFallback) {
        const memoryDb = getMemoryDb()
        matchedUser = memoryDb.patients.find(p => p.id.toUpperCase() === cleanId)
      } else {
        matchedUser = await db!.collection('patients').findOne({ id: { $regex: new RegExp(`^${cleanId}$`, 'i') } })
      }

      if (matchedUser) {
        const correctPassword = matchedUser.password || 'password'
        if (verifyPassword(password, correctPassword)) {
          const { password: _, ...userWithoutPassword } = matchedUser
          const token = generateToken({ userId: matchedUser.id, role: 'patient', name: matchedUser.name })
          return res.status(200).json({ success: true, token, user: userWithoutPassword })
        }
      }
      return res.status(400).json({ error: 'Invalid Patient ID or Password.' })
    }

    if (role === 'admin') {
      if (cleanId === 'ADMIN' && password === 'admin') {
        const adminUser = { id: 'admin', name: 'System Administrator' }
        const token = generateToken({ userId: 'admin', role: 'admin', name: adminUser.name })
        return res.status(200).json({ success: true, token, user: adminUser })
      }
      return res.status(400).json({ error: 'Invalid Administrator credentials.' })
    }

    return res.status(400).json({ error: 'Invalid Role' })

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}
