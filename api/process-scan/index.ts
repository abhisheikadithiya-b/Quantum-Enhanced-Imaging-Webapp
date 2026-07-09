import { getAuthorizedUser } from '../security'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // Caller auth check (Scan processing restricted to authenticated clinical staff)
  const authUser = getAuthorizedUser(req)
  if (!authUser || (authUser.role !== 'doctor' && authUser.role !== 'admin')) {
    return res.status(401).json({ error: 'Unauthorized: Clinical access required.' })
  }

  const { imageSrc } = req.body

  if (!imageSrc) {
    return res.status(400).json({ error: 'imageSrc is required' })
  }

  // Simulate a 500ms server lag for pipeline calculations
  await new Promise(resolve => setTimeout(resolve, 500))

  return res.status(200).json({
    success: true,
    prediction: 'Tumor Detected',
    confidence: '96.2%',
    type: 'Malignant (Glioma)',
    region: 'Left Frontal Lobe',
    bodyPart: 'Brain',
    tumorX: 44,
    tumorY: 32,
    tumorR: 14
  })
}
