import { MongoClient, Db } from 'mongodb'

const INITIAL_PATIENTS = [
  {
    id: 'PAT-101',
    name: 'John Doe',
    age: 42,
    gender: 'Male',
    bloodType: 'O+',
    password: 'password',
    doctor: {
      name: 'Dr. Evelyn Vance',
      email: 'e.vance@quantumimaging.org',
      phone: '+1 (555) 438-9210',
      dept: 'Oncological Radiology'
    },
    cancerType: 'Brain Tumor (Glioblastoma)',
    stage: 'Early Stage',
    status: 'In Treatment',
    tumorHistory: [
      { month: 'Feb', volume: 18.2 },
      { month: 'Mar', volume: 15.4 },
      { month: 'Apr', volume: 12.1 },
      { month: 'May', volume: 9.8 },
      { month: 'Jun', volume: 6.2 }
    ],
    wellnessHistory: [
      { month: 'Feb', score: 72 },
      { month: 'Mar', score: 75 },
      { month: 'Apr', score: 80 },
      { month: 'May', score: 85 },
      { month: 'Jun', score: 92 }
    ],
    prescriptions: [
      { name: 'Temozolomide', dosage: '150mg/m2', frequency: 'Daily, 5 days on / 23 days off', startDate: '2026-02-10', status: 'Active' },
      { name: 'Dexamethasone', dosage: '4mg', frequency: 'Twice daily', startDate: '2026-02-12', status: 'Active' },
      { name: 'Levetiracetam', dosage: '500mg', frequency: 'Twice daily', startDate: '2026-02-10', status: 'Active' }
    ],
    scans: [
      {
        id: 'SCN-820',
        date: '2026-05-18',
        type: 'MRI Brain Sequence (Quantum-Optimized)',
        prediction: 'Tumor Detected',
        confidence: '98.2%',
        region: 'Left Frontal Lobe',
        tumorX: 38,
        tumorY: 38,
        tumorR: 12,
        bodyPart: 'Brain'
      },
      {
        id: 'SCN-411',
        date: '2026-02-10',
        type: 'MRI Brain Sequence (Classical Baseline)',
        prediction: 'Tumor Detected',
        confidence: '92.4%',
        region: 'Left Frontal Lobe',
        tumorX: 38,
        tumorY: 38,
        tumorR: 15,
        bodyPart: 'Brain'
      }
    ]
  },
  {
    id: 'PAT-102',
    name: 'Sarah Jenkins',
    age: 38,
    gender: 'Female',
    bloodType: 'A-',
    password: 'password',
    doctor: {
      name: 'Dr. Evelyn Vance',
      email: 'e.vance@quantumimaging.org',
      phone: '+1 (555) 438-9210',
      dept: 'Oncological Radiology'
    },
    cancerType: 'Breast Cancer (Invasive Ductal)',
    stage: 'Stage II',
    status: 'In Treatment',
    tumorHistory: [
      { month: 'Feb', volume: 2.5 },
      { month: 'Mar', volume: 2.1 },
      { month: 'Apr', volume: 1.4 },
      { month: 'May', volume: 0.8 },
      { month: 'Jun', volume: 0.2 }
    ],
    wellnessHistory: [
      { month: 'Feb', score: 65 },
      { month: 'Mar', score: 70 },
      { month: 'Apr', score: 78 },
      { month: 'May', score: 82 },
      { month: 'Jun', score: 88 }
    ],
    prescriptions: [
      { name: 'Tamoxifen', dosage: '20mg', frequency: 'Daily', startDate: '2026-02-18', status: 'Active' },
      { name: 'Trastuzumab', dosage: '6mg/kg', frequency: 'Every 3 weeks', startDate: '2026-03-01', status: 'Active' }
    ],
    scans: [
      {
        id: 'SCN-912',
        date: '2026-05-22',
        type: 'MRI Breast Sequence (Quantum-Optimized)',
        prediction: 'Tumor Detected',
        confidence: '95.4%',
        region: 'Upper Outer Quadrant',
        tumorX: 0,
        tumorY: 0,
        tumorR: 0,
        bodyPart: 'Breast'
      }
    ]
  },
  {
    id: 'PAT-103',
    name: 'Michael Chen',
    age: 55,
    gender: 'Male',
    bloodType: 'B+',
    password: 'password',
    doctor: {
      name: 'Dr. Evelyn Vance',
      email: 'e.vance@quantumimaging.org',
      phone: '+1 (555) 438-9210',
      dept: 'Oncological Radiology'
    },
    cancerType: 'Lung Cancer (Adenocarcinoma)',
    stage: 'Stage I',
    status: 'Remission',
    tumorHistory: [
      { month: 'Feb', volume: 3.2 },
      { month: 'Mar', volume: 2.9 },
      { month: 'Apr', volume: 2.1 },
      { month: 'May', volume: 1.2 },
      { month: 'Jun', volume: 0.0 }
    ],
    wellnessHistory: [
      { month: 'Feb', score: 80 },
      { month: 'Mar', score: 82 },
      { month: 'Apr', score: 85 },
      { month: 'May', score: 90 },
      { month: 'Jun', score: 96 }
    ],
    prescriptions: [
      { name: 'Osimertinib', dosage: '80mg', frequency: 'Daily', startDate: '2026-02-15', status: 'Active' }
    ],
    scans: [
      {
        id: 'SCN-108',
        date: '2026-06-02',
        type: 'MRI Lung Sequence (Quantum-Optimized)',
        prediction: 'No Abnormalities Detected',
        confidence: '99.1%',
        region: 'None',
        tumorX: 0,
        tumorY: 0,
        tumorR: 0,
        bodyPart: 'Lung'
      }
    ]
  }
]

const INITIAL_DOCTORS = [
  {
    id: 'QS-2026-0001',
    name: 'Dr. Evelyn Vance',
    dept: 'Oncological Radiology',
    email: 'e.vance@quantumimaging.org',
    phone: '+1 (555) 438-9210',
    password: 'admin'
  },
  {
    id: 'QS-2026-0002',
    name: 'Dr. Marcus Brody',
    dept: 'Neurology & MRI Center',
    email: 'm.brody@quantumimaging.org',
    phone: '+1 (555) 438-9211',
    password: 'admin'
  }
]

interface MemoryDb {
  doctors: any[];
  patients: any[];
}

let memoryDb: MemoryDb | null = null

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<{ client: MongoClient | null; db: Db | null; isFallback: boolean }> {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    if (!memoryDb) {
      memoryDb = {
        doctors: INITIAL_DOCTORS,
        patients: INITIAL_PATIENTS
      }
    }
    return { client: null, db: null, isFallback: true }
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb, isFallback: false }
  }

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db('quantascan')

  cachedClient = client
  cachedDb = db

  // Seed databases if they are empty
  const docColl = db.collection('doctors')
  const patColl = db.collection('patients')

  const docCount = await docColl.countDocuments()
  if (docCount === 0) {
    await docColl.insertMany(INITIAL_DOCTORS)
  }

  const patCount = await patColl.countDocuments()
  if (patCount === 0) {
    await patColl.insertMany(INITIAL_PATIENTS)
  }

  return { client, db, isFallback: false }
}

export function getMemoryDb(): MemoryDb {
  if (!memoryDb) {
    memoryDb = {
      doctors: INITIAL_DOCTORS,
      patients: INITIAL_PATIENTS
    }
  }
  return memoryDb
}
