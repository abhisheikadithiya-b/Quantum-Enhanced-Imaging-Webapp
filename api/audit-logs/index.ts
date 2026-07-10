import { connectToDatabase, getMemoryDb } from '../db.js'
import { getAuthorizedUser } from '../security.js'

export default async function handler(req: any, res: any) {
  const { method } = req

  // Authorization token verification
  const authUser = getAuthorizedUser(req)
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' })
  }

  // Only doctors and admins can write/read logs
  if (authUser.role !== 'doctor' && authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Clinical access credentials required.' })
  }

  try {
    const { db, isFallback } = await connectToDatabase()

    if (method === 'GET') {
      // Return logs sorted by timestamp descending
      if (isFallback) {
        const memoryDb = getMemoryDb()
        const sortedLogs = [...memoryDb.auditLogs].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        return res.status(200).json(sortedLogs)
      } else {
        const snap = await db!
          .collection('audit_logs')
          .orderBy('timestamp', 'desc')
          .get()
        const list: any[] = []
        snap.forEach(doc => {
          list.push(doc.data())
        })
        return res.status(200).json(list)
      }
    }

    if (method === 'POST') {
      const { action, patientId, details, signatureName } = req.body
      if (!action || !patientId || !signatureName) {
        return res.status(400).json({ error: 'Missing required parameters: action, patientId, and signatureName.' })
      }

      const logEntry = {
        id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toISOString(),
        doctorId: authUser.userId,
        doctorName: authUser.name,
        action,
        patientId,
        details: details || '',
        signatureName
      }

      if (isFallback) {
        const memoryDb = getMemoryDb()
        memoryDb.auditLogs.push(logEntry)
        return res.status(201).json({ success: true, log: logEntry })
      } else {
        await db!.collection('audit_logs').doc(logEntry.id).set(logEntry)
        return res.status(201).json({ success: true, log: logEntry })
      }
    }

    return res.status(405).json({ error: 'Method Not Allowed' })

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}
