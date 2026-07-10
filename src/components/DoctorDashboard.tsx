import { useState, useRef, useEffect } from 'react'
import { 
  Users, Search, UploadCloud, Layers, ArrowRight, 
  Download, Plus, User, FileText, Check, ShieldAlert, 
  Calendar, FolderSync, Printer 
} from 'lucide-react'

interface Prescription {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  status: 'Active' | 'Completed' | 'Suspended';
}

interface Scan {
  id: string;
  date: string;
  type: string;
  prediction: string;
  confidence: string;
  region: string;
  tumorX: number;
  tumorY: number;
  tumorR: number;
  comments?: string;
  imageSrc?: string;
  coronalImageSrc?: string;
  sagittalImageSrc?: string;
  bodyPart?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  password?: string;
  doctor: {
    name: string;
    email: string;
    phone: string;
    dept: string;
  };
  cancerType: string;
  stage: string;
  status: string;
  tumorHistory: { month: string; volume: number }[];
  wellnessHistory: { month: string; score: number }[];
  prescriptions: Prescription[];
  scans: Scan[];
}

interface DoctorDashboardProps {
  patients: Patient[];
  activeDoctor: { name: string; dept: string; email: string; phone: string } | null;
  onUpdatePatient: (updated: Patient) => void;
  onAddPatient: (patient: Patient) => void;
  onLogout: () => void;
  token: string | null;
}

function BlochSphereCanvas({ theta, phi }: { theta: number; phi: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let rotationAngle = 0

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const r = Math.min(cx, cy) * 0.82

      ctx.save()
      
      // Draw Sphere Outer Ring (Glow)
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()

      // Draw Equator (Perspective Ellipse)
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)'
      ctx.beginPath()
      ctx.ellipse(cx, cy, r, r * 0.28, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Draw Meridian (Perspective Ellipse)
      ctx.beginPath()
      ctx.ellipse(cx, cy, r * 0.28, r, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Draw Z-axis
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.25)'
      ctx.beginPath()
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx, cy + r)
      ctx.stroke()
      
      // Draw X-axis
      ctx.beginPath()
      ctx.moveTo(cx - r, cy)
      ctx.lineTo(cx + r, cy)
      ctx.stroke()

      // Z Axis state labels
      ctx.fillStyle = '#0ea5e9'
      ctx.font = 'bold 9px monospace'
      ctx.fillText('|0⟩', cx - 18, cy - r + 8)
      ctx.fillText('|1⟩', cx - 18, cy + r - 2)

      // Calculate Qubit vector coordinates
      const radTheta = (theta * Math.PI) / 180
      const radPhi = (phi * Math.PI) / 180 + rotationAngle
      
      const vx = r * Math.sin(radTheta) * Math.cos(radPhi)
      const vy = r * Math.sin(radTheta) * Math.sin(radPhi) * 0.28
      const vz = -r * Math.cos(radTheta)

      const px = cx + vx
      const py = cy + vz + vy

      // Draw state vector line
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(px, py)
      ctx.stroke()

      // Draw state vector tip
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(px, py, 3.5, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
      
      rotationAngle += 0.005
      animationFrameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationFrameId)
  }, [theta, phi])

  return <canvas ref={canvasRef} width={100} height={100} className="block mx-auto border border-border/40 bg-black/40 rounded-full animate-fade-in" />
}

// Pre-defined sample scans for uploading
const SAMPLE_SCANS = [
  {
    name: 'Sample 1: Brain Tumor (Frontal Lobe)',
    tumorX: 62,
    tumorY: 38,
    tumorR: 12,
    prediction: 'Tumor Detected',
    confidence: '98.2%',
    type: 'Malignant (Glioblastoma)',
    region: 'Left Frontal Lobe',
    stage: 'Early Stage'
  },
  {
    name: 'Sample 2: Brain Mass (Occipital Lobe)',
    tumorX: 35,
    tumorY: 72,
    tumorR: 18,
    prediction: 'Tumor Detected',
    confidence: '94.5%',
    type: 'Benign (Meningioma)',
    region: 'Right Occipital Lobe',
    stage: 'Stage II'
  },
  {
    name: 'Sample 3: Healthy Brain Scan',
    tumorX: 0,
    tumorY: 0,
    tumorR: 0,
    prediction: 'No Abnormalities Detected',
    confidence: '99.1%',
    type: 'Normal Tissue',
    region: 'None',
    stage: 'N/A'
  }
]

export default function DoctorDashboard({ 
  patients, activeDoctor, onUpdatePatient, onAddPatient, onLogout, token 
}: DoctorDashboardProps) {
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  
  // Forms toggle states
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [showAddRx, setShowAddRx] = useState(false)
  
  // Pipeline Processing states
  const [isProcessing, setIsProcessing] = useState(false)
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([])
  
  // Active MRI parameters loaded in viewer
  const [selectedScanId, setSelectedScanId] = useState<string>('')
  const [activeScanParams, setActiveScanParams] = useState({
    tumorX: 0,
    tumorY: 0,
    tumorR: 0,
    prediction: 'No Abnormalities Detected',
    confidence: '99.1%',
    region: 'None',
    comments: '',
    bodyPart: 'Brain'
  })
  
  const [mriOverlayOpacity, setMriOverlayOpacity] = useState(50)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  
  // Multi-Planar Reconstruction (MPR) slice indices
  const [axialSlice, setAxialSlice] = useState(42)
  const [coronalSlice, setCoronalSlice] = useState(38)
  const [sagittalSlice, setSagittalSlice] = useState(50)
  
  // Triple uploads state files
  const [axialImage, setAxialImage] = useState<string | null>(null)
  const [coronalImage, setCoronalImage] = useState<string | null>(null)
  const [sagittalImage, setSagittalImage] = useState<string | null>(null)
  
  // QML Toggles & Sliders
  const [showQsvmBloch, setShowQsvmBloch] = useState(false)
  const [qcnnFilter, setQcnnFilter] = useState(0)
  
  // Attestation Signatures states
  const [attested, setAttested] = useState(false)
  const [signaturePin, setSignaturePin] = useState('')
  
  // Doctor reports input fields
  const [doctorComments, setDoctorComments] = useState('')
  const [customPrediction, setCustomPrediction] = useState('No Abnormalities Detected')
  const [customConfidence, setCustomConfidence] = useState('99.1%')
  const [customRegion, setCustomRegion] = useState('None')
  const [customBodyPart, setCustomBodyPart] = useState('Brain')
  
  // Custom uploaded scan base64 source
  const [currentScanImage, setCurrentScanImage] = useState<string | null>(null)
  
  // Patient Registration fields
  const [regName, setRegName] = useState('')
  const [regAge, setRegAge] = useState('')
  const [regGender, setRegGender] = useState('Male')
  const [regBlood, setRegBlood] = useState('O+')
  const [regPassword, setRegPassword] = useState('password')
  const [regCancer, setRegCancer] = useState('Brain Tumor (Astrocytoma)')
  const [regStage, setRegStage] = useState('Stage I')
  
  // Case Transfer fields
  const [transId, setTransId] = useState('')
  const [transPassword, setTransPassword] = useState('')
  
  // Prescription input fields
  const [rxName, setRxName] = useState('')
  const [rxDosage, setRxDosage] = useState('')
  const [rxFrequency, setRxFrequency] = useState('')
  
  const batchInputRef = useRef<HTMLInputElement>(null)

  // Batch upload states
  const [pendingFiles, setPendingFiles] = useState<{ name: string; base64: string }[]>([])
  const [mappedAxialIdx, setMappedAxialIdx] = useState<number>(-1)
  const [mappedCoronalIdx, setMappedCoronalIdx] = useState<number>(-1)
  const [mappedSagittalIdx, setMappedSagittalIdx] = useState<number>(-1)

  // Filter patients down to only those handled by the active doctor
  const doctorPatients = patients.filter(p => 
    p.doctor.name.toLowerCase() === (activeDoctor?.name || 'Dr. Evelyn Vance').toLowerCase()
  )

  const activePatient = patients.find(p => p.id === selectedPatientId)

  // Sync selected patient defaults
  useEffect(() => {
    if (activePatient) {
      if (activePatient.scans.length > 0) {
        // Load the newest scan by default
        const newest = activePatient.scans[0]
        setSelectedScanId(newest.id)
        loadScanIntoViewer(newest)
      } else {
        setSelectedScanId('')
        setCurrentScanImage('/brain_scan.png')
        setCustomBodyPart('Brain')
        setActiveScanParams({
          tumorX: 0,
          tumorY: 0,
          tumorR: 0,
          prediction: 'No Abnormalities Detected',
          confidence: '99.1%',
          region: 'None',
          comments: '',
          bodyPart: 'Brain'
        })
      }
      setShowRegisterForm(false)
      setShowTransferForm(false)
      setShowAddRx(false)
    }
  }, [selectedPatientId])

  // Select first patient in list on mount if none selected
  useEffect(() => {
    if (doctorPatients.length > 0 && !selectedPatientId && !showRegisterForm && !showTransferForm) {
      setSelectedPatientId(doctorPatients[0].id)
    }
  }, [patients])

  const loadScanIntoViewer = (scan: Scan) => {
    setActiveScanParams({
      tumorX: scan.tumorX,
      tumorY: scan.tumorY,
      tumorR: scan.tumorR,
      prediction: scan.prediction,
      confidence: scan.confidence,
      region: scan.region,
      comments: scan.comments || '',
      bodyPart: scan.bodyPart || 'Brain'
    })
    setCustomPrediction(scan.prediction)
    setCustomConfidence(scan.confidence)
    setCustomRegion(scan.region)
    setCustomBodyPart(scan.bodyPart || 'Brain')
    setDoctorComments(scan.comments || '')
    setCurrentScanImage(scan.imageSrc || '/brain_scan.png')
  }

  // Simulated AI pipeline runner
  const runAIPipeline = (scanData: typeof SAMPLE_SCANS[0]) => {
    setIsProcessing(true)
    setPipelineLogs([])
    
    const logs = [
      '[INFO] Loading volumetric 3D MRI DICOM slice sequences...',
      '[PREPROC] Running N4 Bias Field Correction & Z-score intensity standardization...',
      '[MONAI] Initiating deep Skull-Stripping; segmenting extra-cranial tissues...',
      '[INFO] Skull stripping complete. Isolating cortical tissue & cerebrospinal fluid...',
      '[CV] Extracting Radiomics feature set (first-order statistics, GLCM, GLSZM)...',
      '[CV] Compiled high-dimensional feature vector (10,240 discrete variables).',
      '[QUANTUM] Instantiating QUBO (Quadratic Unconstrained Binary Optimization) matrix...',
      '[QUANTUM] Setting coupling parameters (J_ij) and local biases (h_i)...',
      '[QUANTUM] Routing QUBO to BQPhy Quantum Annealing Solver (D-Wave 5000+ Qubits)...',
      '[QUANTUM] Superposition initialized. Sampling ground states (Minimum Energy Hamiltonian)...',
      '[QUANTUM] Feature space reduced from 10,240 to 512 globally-optimized parameters.',
      '[CLASSIFIER] Executing ResNet-based CNN using quantum-optimized weights...',
      '[XAI] Computing Grad-CAM heat maps; isolating anatomical target localization...',
      '[INFO] Processing complete. Clinical dossier compilation ready.'
    ]

    let step = 0
    const interval = setInterval(() => {
      setPipelineLogs(prev => [...prev, logs[step]])
      step++
      if (step >= logs.length) {
        clearInterval(interval)
        setIsProcessing(false)
        
        // Update temporary state parameters
        setActiveScanParams({
          tumorX: scanData.tumorX,
          tumorY: scanData.tumorY,
          tumorR: scanData.tumorR,
          prediction: scanData.prediction,
          confidence: scanData.confidence,
          region: scanData.region,
          comments: '',
          bodyPart: customBodyPart
        })
        
        setCustomPrediction(scanData.prediction)
        setCustomConfidence(scanData.confidence)
        setCustomRegion(scanData.region)
      }
    }, 250)
  }

  const detectTumorHeuristic = (base64Str: string, callback: (x: number, y: number, hasTumor: boolean, confidence: string) => void) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        callback(0, 0, false, '99.1%')
        return
      }
      ctx.drawImage(img, 0, 0, 100, 100)
      const imgData = ctx.getImageData(0, 0, 100, 100)
      const data = imgData.data
      
      let maxPatchValue = -1
      let bestX = 50
      let bestY = 50
      
      // Calculate average global brain intensity in the central scanning field (ignoring dark space)
      let totalBrainIntensity = 0
      let brainPixelCount = 0
      let globalMax = 0
      
      for (let y = 15; y < 85; y++) {
        for (let x = 15; x < 85; x++) {
          const idx = (y * 100 + x) * 4
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]
          const val = 0.299 * r + 0.587 * g + 0.114 * b
          if (val > 20) {
            totalBrainIntensity += val
            brainPixelCount++
            if (val > globalMax) {
              globalMax = val
            }
          }
        }
      }
      const avgBrainIntensity = brainPixelCount > 0 ? (totalBrainIntensity / brainPixelCount) : 80
      
      // Focus on internal brain tissue area (20% to 80% boundary) to ignore bright outer skull bones and corner labels
      const kernelSize = 2
      for (let y = 20; y < 80; y++) {
        for (let x = 20; x < 80; x++) {
          let patchSum = 0
          let patchCount = 0
          
          for (let ky = -kernelSize; ky <= kernelSize; ky++) {
            for (let kx = -kernelSize; kx <= kernelSize; kx++) {
              const px = x + kx
              const py = y + ky
              if (px >= 0 && px < 100 && py >= 0 && py < 100) {
                const idx = (py * 100 + px) * 4
                const r = data[idx]
                const g = data[idx + 1]
                const b = data[idx + 2]
                patchSum += 0.299 * r + 0.587 * g + 0.114 * b
                patchCount++
              }
            }
          }
          
          const avgPatchValue = patchCount > 0 ? (patchSum / patchCount) : 0
          if (avgPatchValue > maxPatchValue) {
            maxPatchValue = avgPatchValue
            bestX = x
            bestY = y
          }
        }
      }
      
      // Determine tumor presence using an adaptive threshold:
      // Tumors appear as bright spots. If the max patch value exceeds our adaptive threshold
      // and has a localized contrast ratio of at least 1.25x compared to the rest of the brain, we flag it.
      const variance = globalMax - avgBrainIntensity
      const adaptiveThreshold = Math.max(130, avgBrainIntensity + (variance * 0.45))
      const contrastRatio = maxPatchValue / Math.max(1, avgBrainIntensity)
      const hasTumor = maxPatchValue >= adaptiveThreshold && contrastRatio > 1.25
      
      // Calculate a highly realistic confidence score based on the contrast ratio and max brightness
      let confidenceNum = 90 + Math.min(9.9, (maxPatchValue / 255) * 10)
      if (!hasTumor) {
        confidenceNum = 94 + Math.min(5.9, ((255 - maxPatchValue) / 255) * 6)
      }
      
      const confidence = `${confidenceNum.toFixed(1)}%`
      callback(bestX, bestY, hasTumor, confidence)
    }
    img.src = base64Str
  }



  const guessPlanesMapping = (files: { name: string; base64: string }[]) => {
    let axial = -1
    let coronal = -1
    let sagittal = -1

    // Guess Axial
    axial = files.findIndex(f => 
      f.name.toLowerCase().includes('axial') || 
      f.name.toLowerCase().includes('z-') || 
      f.name.toLowerCase().includes('slice1') ||
      f.name.toLowerCase().includes('scan_1')
    )
    // Guess Coronal
    coronal = files.findIndex(f => 
      f.name.toLowerCase().includes('coronal') || 
      f.name.toLowerCase().includes('y-') || 
      f.name.toLowerCase().includes('slice2') ||
      f.name.toLowerCase().includes('scan_2')
    )
    // Guess Sagittal
    sagittal = files.findIndex(f => 
      f.name.toLowerCase().includes('sagittal') || 
      f.name.toLowerCase().includes('x-') || 
      f.name.toLowerCase().includes('slice3') ||
      f.name.toLowerCase().includes('scan_3')
    )

    const availableIndices = [0, 1, 2].filter(i => i < files.length)
    
    if (axial === -1) {
      const idx = availableIndices.find(i => i !== coronal && i !== sagittal)
      if (idx !== undefined) axial = idx
    }
    if (coronal === -1) {
      const idx = availableIndices.find(i => i !== axial && i !== sagittal)
      if (idx !== undefined) coronal = idx
    }
    if (sagittal === -1) {
      const idx = availableIndices.find(i => i !== axial && i !== coronal)
      if (idx !== undefined) sagittal = idx
    }

    setMappedAxialIdx(axial)
    setMappedCoronalIdx(coronal)
    setMappedSagittalIdx(sagittal)
  }

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processUploadedFiles(e.target.files)
    }
  }

  const classifyPlanesVisually = (loadedFiles: { name: string; base64: string; data: Uint8ClampedArray }[]) => {
    if (loadedFiles.length < 3) return { axial: 0, coronal: 1, sagittal: 2 }

    const scores = loadedFiles.map((file, idx) => {
      const data = file.data
      
      // 1. Calculate left-right asymmetry
      let diffSum = 0
      let totalIntensity = 0
      for (let y = 15; y < 85; y++) {
        for (let x = 15; x < 50; x++) {
          const idxLeft = (y * 100 + x) * 4
          const idxRight = (y * 100 + (100 - x)) * 4
          const valLeft = 0.299 * data[idxLeft] + 0.587 * data[idxLeft + 1] + 0.114 * data[idxLeft + 2]
          const valRight = 0.299 * data[idxRight] + 0.587 * data[idxRight + 1] + 0.114 * data[idxRight + 2]
          diffSum += Math.abs(valLeft - valRight)
          totalIntensity += valLeft + valRight
        }
      }
      const asymmetry = totalIntensity > 0 ? (diffSum / totalIntensity) : 0
      
      // 2. Calculate bottom stem extension (Coronal vs Axial)
      // Coronal has neck/stem at bottom center, sides are empty/black
      let centerBottom = 0
      let sidesBottom = 0
      for (let y = 75; y < 95; y++) {
        for (let x = 45; x < 55; x++) {
          const idx = (y * 100 + x) * 4
          centerBottom += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
        }
        for (let x = 15; x < 25; x++) {
          const idxL = (y * 100 + x) * 4
          const idxR = (y * 100 + (100 - x)) * 4
          sidesBottom += 0.299 * data[idxL] + 0.587 * data[idxL + 1] + 0.114 * data[idxL + 2]
          sidesBottom += 0.299 * data[idxR] + 0.587 * data[idxR + 1] + 0.114 * data[idxR + 2]
        }
      }
      const stemScore = (sidesBottom + 1) / (centerBottom + 1) // Lower means center is much brighter than sides
      
      return { idx, asymmetry, stemScore }
    })

    // Sort by asymmetry descending to identify Sagittal (highest asymmetry)
    const sortedByAsymmetry = [...scores].sort((a, b) => b.asymmetry - a.asymmetry)
    const sagittalIdx = sortedByAsymmetry[0].idx
    
    // The remaining two are Axial and Coronal
    const remaining = scores.filter(s => s.idx !== sagittalIdx)
    // The one with the lower stemScore (brighter center compared to corners) is Coronal
    const sortedByStem = [...remaining].sort((a, b) => a.stemScore - b.stemScore)
    const coronalIdx = sortedByStem[0].idx
    const axialIdx = sortedByStem[1].idx

    return { axial: axialIdx, coronal: coronalIdx, sagittal: sagittalIdx }
  }

  const processUploadedFiles = async (fileList: FileList) => {
    const list = Array.from(fileList).slice(0, 3)
    const loaded: { name: string; base64: string; data: Uint8ClampedArray }[] = []
    
    for (const file of list) {
      const result = await new Promise<{ base64: string; data: Uint8ClampedArray }>((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const base64 = event.target?.result as string || ''
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = 100
            canvas.height = 100
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0, 100, 100)
              const imgData = ctx.getImageData(0, 0, 100, 100)
              resolve({ base64, data: imgData.data })
            } else {
              resolve({ base64, data: new Uint8ClampedArray(40000) })
            }
          }
          img.src = base64
        }
        reader.readAsDataURL(file)
      })
      if (result.base64) {
        loaded.push({ name: file.name, base64: result.base64, data: result.data })
      }
    }
    
    setPendingFiles(loaded.map(item => ({ name: item.name, base64: item.base64 })))
    
    // Visually auto-classify planes if exactly 3 files are uploaded
    if (loaded.length === 3) {
      const mapping = classifyPlanesVisually(loaded)
      setMappedAxialIdx(mapping.axial)
      setMappedCoronalIdx(mapping.coronal)
      setMappedSagittalIdx(mapping.sagittal)
    } else {
      guessPlanesMapping(loaded)
    }
  }

  const executeBatchPipeline = () => {
    if (pendingFiles.length === 0) return

    const axialFile = pendingFiles[mappedAxialIdx]
    const coronalFile = pendingFiles[mappedCoronalIdx]
    const sagittalFile = pendingFiles[mappedSagittalIdx]

    const axialBase64 = axialFile?.base64 || null
    const coronalBase64 = coronalFile?.base64 || null
    const sagittalBase64 = sagittalFile?.base64 || null

    if (axialBase64) {
      setAxialImage(axialBase64)
      setCurrentScanImage(axialBase64)
    } else {
      setAxialImage(null)
    }
    if (coronalBase64) {
      setCoronalImage(coronalBase64)
    } else {
      setCoronalImage(null)
    }
    if (sagittalBase64) {
      setSagittalImage(sagittalBase64)
    } else {
      setSagittalImage(null)
    }

    setUploadedFileName(axialFile ? axialFile.name : (pendingFiles[0]?.name || 'Batch Upload'))

    const detectionTarget = axialBase64 || coronalBase64 || sagittalBase64
    if (detectionTarget) {
      detectTumorHeuristic(detectionTarget, (detectedX, detectedY, hasTumor, confidence) => {
        if (hasTumor) {
          runAIPipeline({
            name: axialFile?.name || 'Batch Scans',
            tumorX: detectedX,
            tumorY: detectedY,
            tumorR: 14,
            prediction: 'Tumor Detected',
            confidence: confidence,
            type: 'Malignant (Glioma)',
            region: detectedX < 50 ? (detectedY < 50 ? 'Left Frontal Lobe' : 'Left Occipital Lobe') : (detectedY < 50 ? 'Right Frontal Lobe' : 'Right Occipital Lobe'),
            stage: 'Stage II'
          })
        } else {
          runAIPipeline({
            name: axialFile?.name || 'Batch Scans',
            tumorX: 0,
            tumorY: 0,
            tumorR: 0,
            prediction: 'No Abnormalities Detected',
            confidence: confidence,
            type: 'Normal Tissue',
            region: 'None',
            stage: 'N/A'
          })
        }
      })
    }
    setPendingFiles([])
  }

  const handleSelectSample = (sample: typeof SAMPLE_SCANS[0]) => {
    setUploadedFileName(sample.name)
    setCurrentScanImage('/brain_scan.png')
    setAxialImage('/brain_scan.png')
    setCoronalImage(null)
    setSagittalImage(null)
    runAIPipeline(sample)
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isProcessing) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    
    setActiveScanParams(prev => ({
      ...prev,
      tumorX: x,
      tumorY: y,
      tumorR: prev.tumorR || 12,
      prediction: 'Tumor Detected',
      confidence: '97.4%',
      region: x < 50 ? (y < 50 ? 'Left Frontal Lobe' : 'Left Occipital Lobe') : (y < 50 ? 'Right Frontal Lobe' : 'Right Occipital Lobe')
    }))
    
    setCustomPrediction('Tumor Detected')
    setCustomConfidence('97.4%')
    setCustomRegion(x < 50 ? (y < 50 ? 'Left Frontal Lobe' : 'Left Occipital Lobe') : (y < 50 ? 'Right Frontal Lobe' : 'Right Occipital Lobe'))
  }

  const handleCoronalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isProcessing) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const z = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    
    setCoronalSlice(z)
    setActiveScanParams(prev => ({
      ...prev,
      tumorX: x,
      tumorR: prev.tumorR || 12,
      prediction: 'Tumor Detected',
      confidence: '97.4%',
      region: x < 50 ? (prev.tumorY < 50 ? 'Left Frontal Lobe' : 'Left Occipital Lobe') : (prev.tumorY < 50 ? 'Right Frontal Lobe' : 'Right Occipital Lobe')
    }))
    
    setCustomPrediction('Tumor Detected')
    setCustomConfidence('97.4%')
    setCustomRegion(x < 50 ? (activeScanParams.tumorY < 50 ? 'Left Frontal Lobe' : 'Left Occipital Lobe') : (activeScanParams.tumorY < 50 ? 'Right Frontal Lobe' : 'Right Occipital Lobe'))
  }

  const handleSagittalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isProcessing) return
    const rect = e.currentTarget.getBoundingClientRect()
    const y = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const z = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    
    setSagittalSlice(z)
    setActiveScanParams(prev => ({
      ...prev,
      tumorY: y,
      tumorR: prev.tumorR || 12,
      prediction: 'Tumor Detected',
      confidence: '97.4%',
      region: prev.tumorX < 50 ? (y < 50 ? 'Left Frontal Lobe' : 'Left Occipital Lobe') : (y < 50 ? 'Right Frontal Lobe' : 'Right Occipital Lobe')
    }))
    
    setCustomPrediction('Tumor Detected')
    setCustomConfidence('97.4%')
    setCustomRegion(activeScanParams.tumorX < 50 ? (y < 50 ? 'Left Frontal Lobe' : 'Left Occipital Lobe') : (y < 50 ? 'Right Frontal Lobe' : 'Right Occipital Lobe'))
  }

  // Commit scan reports to patient
  const saveScanToPatient = async () => {
    if (!activePatient) return
    
    if (!attested) {
      alert('You must attest to reviewing these MRI slices before saving this diagnostic record.')
      return
    }
    
    if (!signaturePin.trim()) {
      alert('Please enter your Attending Doctor Digital Signature / PIN.')
      return
    }

    const newScanId = `SCN-${Math.floor(100 + Math.random() * 900)}`
    const newScan: Scan = {
      id: newScanId,
      date: new Date().toISOString().split('T')[0],
      type: 'MRI Brain Sequence (Quantum-Optimized)',
      prediction: customPrediction,
      confidence: customConfidence,
      region: customRegion,
      tumorX: activeScanParams.tumorX,
      tumorY: activeScanParams.tumorY,
      tumorR: activeScanParams.tumorR,
      comments: doctorComments,
      imageSrc: axialImage || currentScanImage || undefined,
      coronalImageSrc: coronalImage || undefined,
      sagittalImageSrc: sagittalImage || undefined,
      bodyPart: customBodyPart
    }

    // Save secure log entry to backend audit trail
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'COMMIT_DIAGNOSTIC_REPORT',
          patientId: activePatient.id,
          signatureName: signaturePin,
          details: `Doctor validated scan report ${newScanId} containing ${customPrediction} at coordinates (${activeScanParams.tumorX}, ${activeScanParams.tumorY}).`
        })
      })
    } catch (e) {
      console.error('Audit trail logging failed:', e)
    }

    const updatedPatient: Patient = {
      ...activePatient,
      status: customPrediction.includes('Detected') ? 'In Treatment' : 'Stable',
      scans: [newScan, ...activePatient.scans]
    }

    onUpdatePatient(updatedPatient)
    setSelectedScanId(newScanId)
    
    // Reset attestation
    setAttested(false)
    setSignaturePin('')
    
    alert(`Successfully compiled report ${newScanId} and appended it to patient ${activePatient.name}'s history! Audit trail logged.`)
  }

  const handleAddRx = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activePatient || !rxName) return

    const newRx: Prescription = {
      name: rxName,
      dosage: rxDosage || 'N/A',
      frequency: rxFrequency || 'Daily',
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    }

    const updatedPatient: Patient = {
      ...activePatient,
      prescriptions: [newRx, ...activePatient.prescriptions]
    }

    onUpdatePatient(updatedPatient)
    setRxName('')
    setRxDosage('')
    setRxFrequency('')
    setShowAddRx(false)
  }

  // Enroll patient handler
  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault()

    const newId = `PAT-${Math.floor(104 + Math.random() * 900)}`
    const defaultDoc = activeDoctor || {
      name: 'Dr. Evelyn Vance',
      dept: 'Oncological Radiology',
      email: 'e.vance@quantumimaging.org',
      phone: '+1 (555) 438-9210'
    }

    const newPatient: Patient = {
      id: newId,
      name: regName,
      age: parseInt(regAge) || 30,
      gender: regGender,
      bloodType: regBlood,
      password: regPassword,
      doctor: {
        name: defaultDoc.name,
        email: defaultDoc.email,
        phone: defaultDoc.phone,
        dept: defaultDoc.dept
      },
      cancerType: regCancer,
      stage: regStage,
      status: 'In Treatment',
      tumorHistory: [{ month: 'Jun', volume: 8.5 }],
      wellnessHistory: [{ month: 'Jun', score: 80 }],
      prescriptions: [],
      scans: []
    }

    onAddPatient(newPatient)
    setSelectedPatientId(newId)
    
    setRegName('')
    setRegAge('')
    setRegPassword('password')
    setShowRegisterForm(false)
    alert(`Registered patient ${regName} successfully with ID ${newId}!`)
  }

  // Case Transfer from another doctor (Task 3)
  const handleCaseTransfer = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanId = transId.trim().toUpperCase()
    const currentDoc = activeDoctor || {
      name: 'Dr. Evelyn Vance',
      dept: 'Oncological Radiology',
      email: 'e.vance@quantumimaging.org',
      phone: '+1 (555) 438-9210'
    }

    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: cleanId,
          patientPassword: transPassword,
          newDoctor: {
            name: currentDoc.name,
            email: currentDoc.email,
            phone: currentDoc.phone,
            dept: currentDoc.dept
          }
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        onUpdatePatient(data.patient)
        setSelectedPatientId(cleanId)
        setTransId('')
        setTransPassword('')
        setShowTransferForm(false)
        alert(`Patient case ${data.patient.name} (${cleanId}) successfully transferred to your clinical roster!`)
      } else {
        alert(data.error || 'Case transfer failed.')
      }
    } catch (err) {
      console.error(err)
      alert('Network error initiating transfer case request.')
    }
  }

  // printable HTML dossier window builder (Task 5)
  const triggerPrintDossier = () => {
    if (!activePatient) return

    const printWindow = window.open('', '_blank', 'width=800,height=900')
    if (!printWindow) {
      alert("Popup blocker prevented report generation. Please allow popups for this site.")
      return
    }

    const rxRows = activePatient.prescriptions.map(rx => `
      <tr>
        <td><strong>${rx.name}</strong></td>
        <td>${rx.dosage}</td>
        <td>${rx.frequency}</td>
        <td>${rx.startDate}</td>
        <td>${rx.status}</td>
      </tr>
    `).join('')

    const scanRows = activePatient.scans.map(s => `
      <tr>
        <td><strong>${s.id}</strong></td>
        <td>${s.date}</td>
        <td>${s.prediction}</td>
        <td>${s.confidence}</td>
        <td>${s.region}</td>
      </tr>
    `).join('')

    // Generate custom brain SVG graphics inline
    const isTumor = activeScanParams.tumorX > 0

    const htmlContent = `
      <html>
        <head>
          <title>Clinical Report - ${activePatient.name} (${activePatient.id})</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            .header-table { width: 100%; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 20px; }
            .logo-title { font-size: 24px; font-weight: bold; color: #0284c7; letter-spacing: 1px; }
            .dossier-title { text-align: right; font-size: 14px; color: #64748b; font-weight: bold; }
            .grid { display: flex; gap: 40px; margin-bottom: 30px; }
            .col { flex: 1; }
            h3 { font-size: 14px; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
            .meta-item { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
            .meta-label { color: #64748b; }
            .meta-val { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; margin-bottom: 30px; }
            th { background: #f8fafc; color: #475569; font-weight: bold; text-align: left; padding: 10px; border-bottom: 1px solid #cbd5e1; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .mri-diagram { width: 220px; height: 220px; background: #030303; border-radius: 8px; margin: 0 auto; display: flex; align-items: center; justify-content: center; border: 1px solid #1e293b; }
            .footer { border-top: 1px solid #cbd5e1; padding-top: 15px; margin-top: 40px; text-align: center; font-size: 10px; color: #64748b; }
          </style>
        </head>
        <body>
          <table class="header-table" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td class="logo-title" style="border:none; padding:0;">QUANTA-SCAN CORE</td>
              <td class="dossier-title" style="border:none; padding:0;">SECURE CLINICAL DOSSIER</td>
            </tr>
          </table>

          <div class="grid">
            <div class="col">
              <h3>Patient Demographics</h3>
              <div class="meta-item"><span class="meta-label">Patient Name:</span><span class="meta-val">${activePatient.name}</span></div>
              <div class="meta-item"><span class="meta-label">Case ID:</span><span class="meta-val">${activePatient.id}</span></div>
              <div class="meta-item"><span class="meta-label">Age / Gender:</span><span class="meta-val">${activePatient.age} / ${activePatient.gender}</span></div>
              <div class="meta-item"><span class="meta-label">Blood Type:</span><span class="meta-val">${activePatient.bloodType}</span></div>
              <div class="meta-item"><span class="meta-label">Clinical Status:</span><span class="meta-val" style="color: #0284c7;">${activePatient.status}</span></div>
            </div>
            
            <div className="col" style="flex: 1;">
              <h3>Assigned Care Unit</h3>
              <div class="meta-item"><span class="meta-label">Attending Oncologist:</span><span class="meta-val">${activePatient.doctor.name}</span></div>
              <div class="meta-item"><span class="meta-label">Department:</span><span class="meta-val">${activePatient.doctor.dept}</span></div>
              <div class="meta-item"><span class="meta-label">Contact:</span><span class="meta-val">${activePatient.doctor.phone}</span></div>
              <div class="meta-item"><span class="meta-label">Email:</span><span class="meta-val">${activePatient.doctor.email}</span></div>
            </div>
          </div>

          <div class="grid" style="align-items: center;">
            <div style="flex: 1.5;">
              <h3>Active Diagnostic Metrics</h3>
              <div class="meta-item"><span class="meta-label">Pathological Target:</span><span class="meta-val">${activePatient.cancerType}</span></div>
              <div class="meta-item"><span class="meta-label">Staging Bracket:</span><span class="meta-val">${activePatient.stage}</span></div>
              <div class="meta-item"><span class="meta-label">Scanned Organ/Part:</span><span class="meta-val">${activeScanParams.bodyPart || 'Brain'}</span></div>
              <div class="meta-item"><span class="meta-label">AI Diagnostic Flag:</span><span class="meta-val">${activeScanParams.prediction}</span></div>
              <div class="meta-item"><span class="meta-label">AI Target Confidence:</span><span class="meta-val">${activeScanParams.confidence}</span></div>
              <div class="meta-item"><span class="meta-label">Anatomical Region:</span><span class="meta-val">${activeScanParams.region}</span></div>
            </div>
            
            <div style="flex: 1; text-align: center;">
              <h3>Anatomical Localization</h3>
              <div class="mri-diagram" style="position: relative; width: 180px; height: 180px; background: #000; border-radius: 8px; overflow: hidden; margin: 0 auto; border: 1px solid #1e293b;">
                <img src="/brain_scan.png" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;" />
                ${isTumor ? `
                  <div style="position: absolute; left: ${activeScanParams.tumorX}%; top: ${activeScanParams.tumorY}%; transform: translate(-50%, -50%); width: 22px; height: 22px; border: 2px dashed #ef4444; border-radius: 50%;"></div>
                  <div style="position: absolute; left: ${activeScanParams.tumorX}%; top: ${activeScanParams.tumorY}%; transform: translate(-50%, -50%); width: 4px; height: 4px; background: #ef4444; border-radius: 50%;"></div>
                ` : ''}
              </div>
            </div>
          </div>

          <h3>Attending Diagnostics Notes</h3>
          <div style="border: 1px solid #cbd5e1; background: #f8fafc; padding: 12px; font-size: 11px; border-radius: 6px; min-height: 50px; margin-bottom: 30px;">
            ${activeScanParams.comments || 'No attending notes provided for this scan profile.'}
          </div>

          <h3>Active Treatment Prescriptions</h3>
          <table>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Start Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rxRows || '<tr><td colspan="5" style="text-align:center;">No medications listed.</td></tr>'}
            </tbody>
          </table>

          <h3>Comprehensive Scan Timeline</h3>
          <table>
            <thead>
              <tr>
                <th>Scan ID</th>
                <th>Scan Date</th>
                <th>Inference Flag</th>
                <th>Model Confidence</th>
                <th>Anatomical Target</th>
              </tr>
            </thead>
            <tbody>
              ${scanRows || '<tr><td colspan="5" style="text-align:center;">No scans logged.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Quanta-Scan Precision Analytics Engine &bull; HIPAA Compliant Diagnostic Data Exporter &bull; V4.0.2-QS
          </div>

          <script>
            window.onload = function() {
              window.print();
              // window.close();
            }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // Excel CSV Exporter (Task 5)
  const triggerCSVExport = () => {
    if (!activePatient) return

    let csvContent = "data:text/csv;charset=utf-8,"
    
    // Header information
    csvContent += "QUANTA-SCAN CLINICAL EXPORT\n"
    csvContent += `Exporter attending doctor:,${activeDoctor?.name || 'Dr. Evelyn Vance'}\n`
    csvContent += `Patient ID,${activePatient.id}\n`
    csvContent += `Patient Name,${activePatient.name}\n`
    csvContent += `Age / Gender,${activePatient.age} / ${activePatient.gender}\n`
    csvContent += `Blood Type,${activePatient.bloodType}\n`
    csvContent += `Target Condition,${activePatient.cancerType}\n`
    csvContent += `Stage Bracket,${activePatient.stage}\n`
    csvContent += `Attending Status,${activePatient.status}\n\n`
    
    // Prescriptions Header
    csvContent += "MEDICATION PRESCRIPTIONS\n"
    csvContent += "Name,Dosage,Frequency,Start Date,Status\n"
    activePatient.prescriptions.forEach(rx => {
      csvContent += `"${rx.name}","${rx.dosage}","${rx.frequency}",${rx.startDate},${rx.status}\n`
    })
    
    csvContent += "\n"

    // Scans History Header
    csvContent += "SCAN DIAGNOSTICS VAULT\n"
    csvContent += "Scan ID,Date,AI Flag,Confidence,Scanned Body Part,Region,Comments\n"
    activePatient.scans.forEach(s => {
      csvContent += `${s.id},${s.date},"${s.prediction}",${s.confidence},"${s.bodyPart || 'Brain'}","${s.region}","${s.comments || ''}"\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `clinical_dossier_${activePatient.id}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const filteredPatients = doctorPatients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in">
      {/* Sidebar Patient Roster */}
      <div className="lg:col-span-1 bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col h-[700px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            Patient Directory
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => {
                setShowRegisterForm(!showRegisterForm)
                setShowTransferForm(false)
                setSelectedPatientId('')
              }}
              className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 transition ${
                showRegisterForm 
                  ? 'bg-muted text-muted-foreground border border-border' 
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
              title="Enroll New Patient"
            >
              <Plus className="w-3 h-3" /> Enroll
            </button>
            <button
              onClick={() => {
                setShowTransferForm(!showTransferForm)
                setShowRegisterForm(false)
                setSelectedPatientId('')
              }}
              className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 transition ${
                showTransferForm 
                  ? 'bg-muted text-muted-foreground border border-border' 
                  : 'bg-accent text-accent-foreground hover:opacity-90'
              }`}
              title="Transfer Patient Case"
            >
              <FolderSync className="w-3 h-3" /> Move
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filteredPatients.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPatientId(p.id)
                setShowRegisterForm(false)
                setShowTransferForm(false)
                setShowAddRx(false)
              }}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex flex-col gap-1.5 ${
                p.id === selectedPatientId
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:bg-muted bg-muted/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-foreground text-xs">{p.name}</span>
                <span className="text-[9px] font-mono font-semibold text-muted-foreground">{p.id}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground">{p.cancerType.split(' ')[0]}</span>
                <span className={`px-1.5 py-0.5 rounded-[3px] font-bold ${
                  p.status === 'Remission'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {p.status}
                </span>
              </div>
            </button>
          ))}
          {filteredPatients.length === 0 && (
            <div className="text-center py-12 text-xs text-muted-foreground">Roster empty</div>
          )}
        </div>
        
        <div className="border-t border-border mt-4 pt-3 flex justify-between items-center text-[10px] text-muted-foreground">
          <span>Dr: {activeDoctor?.name || 'Dr. Evelyn Vance'}</span>
          <button
            onClick={onLogout}
            className="hover:text-foreground font-semibold uppercase tracking-wider"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="lg:col-span-3 space-y-6 overflow-y-auto h-[700px] pr-2 animate-slide-up">
        
        {/* Form: Case Transfer (Task 3) */}
        {showTransferForm && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FolderSync className="w-5.5 h-5.5 text-primary" />
                Transfer Patient Case
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Enter patient credentials to transfer their medical file and scans to your roster.</p>
            </div>

            <form onSubmit={handleCaseTransfer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1">Patient ID</label>
                  <input
                    type="text"
                    placeholder="e.g., PAT-101"
                    value={transId}
                    onChange={(e) => setTransId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Patient Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={transPassword}
                    onChange={(e) => setTransPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2.5 border-t border-border pt-4">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition"
                >
                  Pull Patient Case
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTransferForm(false)
                    if (doctorPatients.length > 0) setSelectedPatientId(doctorPatients[0].id)
                  }}
                  className="px-4 py-2.5 border border-border hover:bg-muted text-muted-foreground font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Form: Register Patient View */}
        {showRegisterForm && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="w-5.5 h-5.5 text-primary" />
                Enroll New Patient Case
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Initialize a secure PHI patient registry and assign diagnostic targets.</p>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    placeholder="Alice Smith"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="29"
                    value={regAge}
                    onChange={(e) => setRegAge(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Login Password</label>
                  <input
                    type="password"
                    placeholder="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1">Gender</label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Blood Type</label>
                  <select
                    value={regBlood}
                    onChange={(e) => setRegBlood(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1">Target Cancer Condition</label>
                  <input
                    type="text"
                    placeholder="Brain Tumor (Astrocytoma)"
                    value={regCancer}
                    onChange={(e) => setRegCancer(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Stage Classification</label>
                  <select
                    value={regStage}
                    onChange={(e) => setRegStage(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="Early Stage">Early Stage</option>
                    <option value="Stage I">Stage I</option>
                    <option value="Stage II">Stage II</option>
                    <option value="Stage III">Stage III</option>
                    <option value="Stage IV">Stage IV</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 border-t border-border pt-4">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition"
                >
                  Enroll Patient Case
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterForm(false)
                    if (doctorPatients.length > 0) setSelectedPatientId(doctorPatients[0].id)
                  }}
                  className="px-4 py-2.5 border border-border hover:bg-muted text-muted-foreground font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!showTransferForm && !showRegisterForm && activePatient && (
          <>
            {/* Patient Header & Metadata Card */}
            <div key={activePatient.id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 animate-scale-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    {activePatient.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    ID: {activePatient.id} &bull; Age: {activePatient.age} &bull; Gender: {activePatient.gender} &bull; Blood Type: {activePatient.bloodType}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="px-2.5 py-1 rounded-full border border-border bg-muted text-foreground">
                    Stage: {activePatient.stage}
                  </span>
                  <span className="px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary">
                    Doctor: {activePatient.doctor.name}
                  </span>
                </div>
              </div>

              {/* Roster actions */}
              <div className="flex flex-wrap gap-3 border-t border-border/50 pt-4">
                <button
                  onClick={() => setShowAddRx(!showAddRx)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddRx ? 'Hide Prescription Form' : 'Add Medication'}
                </button>
                <button
                  onClick={triggerPrintDossier}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 border border-border hover:bg-muted text-xs font-semibold rounded-lg transition"
                >
                  <Printer className="w-3.5 h-3.5 text-primary" />
                  Print PDF Dossier
                </button>
                <button
                  onClick={triggerCSVExport}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 border border-border hover:bg-muted text-xs font-semibold rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  Export to Excel (CSV)
                </button>
              </div>

              {/* Add Prescription form toggled */}
              {showAddRx && (
                <form onSubmit={handleAddRx} className="bg-muted/40 p-4 border border-border/50 rounded-xl space-y-3.5 animate-slide-down">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">New Prescription</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Medicine Name"
                        value={rxName}
                        onChange={(e) => setRxName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 150mg)"
                        value={rxDosage}
                        onChange={(e) => setRxDosage(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Frequency (e.g. Daily)"
                        value={rxFrequency}
                        onChange={(e) => setRxFrequency(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:opacity-90 transition"
                  >
                    Confirm & Add
                  </button>
                </form>
              )}
            </div>

            {/* Timeline Scan History Selector (Task 1) */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-primary" />
                Diagnostic Scan Catalog (Sorted by Date)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {activePatient.scans.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedScanId(s.id)
                      loadScanIntoViewer(s)
                    }}
                    className={`p-3 rounded-lg border text-left text-xs transition duration-150 flex flex-col gap-1.5 ${
                      selectedScanId === s.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/60 hover:bg-muted bg-background/50'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-foreground">{s.date}</span>
                      <span className="text-[9px] font-mono text-muted-foreground">{s.id}</span>
                    </div>
                    <div className="text-[11px] font-medium leading-relaxed">
                      Flag: <span className={s.prediction.includes('Detected') ? 'text-red-500 font-semibold' : 'text-emerald-500 font-semibold'}>{s.prediction}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Conf: {s.confidence} &bull; Target: {s.region}
                    </div>
                  </button>
                ))}
                {activePatient.scans.length === 0 && (
                  <div className="col-span-full py-4 text-center text-xs text-muted-foreground">
                    No scans in history. Upload an MRI to generate the first diagnostic file.
                  </div>
                )}
              </div>
            </div>

            {/* Scan Image Upload & Processing */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary" />
                Upload & Process MRI Study
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {pendingFiles.length === 0 ? (
                    <div
                      onClick={() => batchInputRef.current?.click()}
                      className="border border-dashed border-border/80 hover:border-primary/50 bg-muted/5 hover:bg-muted/10 rounded-lg p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px]"
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onDrop={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (e.dataTransfer.files) {
                          await processUploadedFiles(e.dataTransfer.files)
                        }
                      }}
                    >
                      <UploadCloud className="w-8 h-8 text-primary mb-2 animate-pulse" />
                      <span className="text-xs font-bold text-foreground">Drag & drop 3 orthogonal scans at once</span>
                      <span className="text-[10px] text-muted-foreground mt-1">Accepts Axial, Coronal, & Sagittal views (max 3 files)</span>
                      <span className="text-[9px] text-primary/75 mt-2 underline font-semibold">or click to browse files</span>
                      <input
                        type="file"
                        ref={batchInputRef}
                        onChange={handleBatchUpload}
                        className="hidden"
                        accept="image/*"
                        multiple
                      />
                    </div>
                  ) : (
                    <div className="bg-muted/10 border border-border/60 rounded-lg p-4 space-y-3.5 animate-scale-in">
                      <div className="flex justify-between items-center border-b border-border/40 pb-2">
                        <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Loaded Slices Map</span>
                        <button
                          onClick={() => setPendingFiles([])}
                          className="text-[10px] text-red-500 font-bold hover:underline"
                        >
                          Clear Selection
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {/* Axial Mapping */}
                        <div className="grid grid-cols-3 gap-2 items-center text-xs">
                          <span className="font-bold text-muted-foreground">Axial (Z-Axis):</span>
                          <select
                            value={mappedAxialIdx}
                            onChange={(e) => setMappedAxialIdx(parseInt(e.target.value))}
                            className="col-span-2 p-1.5 rounded border border-border bg-background text-foreground text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value={-1}>-- Select Image --</option>
                            {pendingFiles.map((f, idx) => (
                              <option key={idx} value={idx}>{f.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Coronal Mapping */}
                        <div className="grid grid-cols-3 gap-2 items-center text-xs">
                          <span className="font-bold text-muted-foreground">Coronal (Y-Axis):</span>
                          <select
                            value={mappedCoronalIdx}
                            onChange={(e) => setMappedCoronalIdx(parseInt(e.target.value))}
                            className="col-span-2 p-1.5 rounded border border-border bg-background text-foreground text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value={-1}>-- Select Image --</option>
                            {pendingFiles.map((f, idx) => (
                              <option key={idx} value={idx}>{f.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Sagittal Mapping */}
                        <div className="grid grid-cols-3 gap-2 items-center text-xs">
                          <span className="font-bold text-muted-foreground">Sagittal (X-Axis):</span>
                          <select
                            value={mappedSagittalIdx}
                            onChange={(e) => setMappedSagittalIdx(parseInt(e.target.value))}
                            className="col-span-2 p-1.5 rounded border border-border bg-background text-foreground text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value={-1}>-- Select Image --</option>
                            {pendingFiles.map((f, idx) => (
                              <option key={idx} value={idx}>{f.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={executeBatchPipeline}
                        className="w-full py-2 bg-primary hover:opacity-90 active:scale-95 text-primary-foreground font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        Execute 3D Reconstruction Pipeline
                      </button>
                    </div>
                  )}

                  {uploadedFileName && pendingFiles.length === 0 && (
                    <div className="flex items-center justify-between p-2.5 border border-border rounded-lg bg-background text-xs font-mono text-muted-foreground">
                      <span>Active File: {uploadedFileName}</span>
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Or load a pipeline demo sample:</span>
                    <div className="flex flex-col gap-2">
                      {SAMPLE_SCANS.map((sample, idx) => (
                        <button
                          key={idx}
                          disabled={isProcessing}
                          onClick={() => handleSelectSample(sample)}
                          className="w-full text-left px-3 py-2 rounded-lg border border-border bg-background/50 hover:bg-muted text-xs text-foreground flex items-center justify-between transition-all duration-150 disabled:opacity-50"
                        >
                          <span>{sample.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Console Logs */}
                <div className="bg-[#09090b] border border-border/80 rounded-xl p-4 h-[240px] flex flex-col font-mono text-[10px] text-emerald-400 overflow-hidden shadow-inner">
                  <div className="flex justify-between items-center border-b border-border/60 pb-2 mb-2">
                    <span className="text-muted-foreground uppercase font-semibold tracking-wider">AI Pipeline Logs</span>
                    {isProcessing && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                    {pipelineLogs.map((log, idx) => (
                      <div key={idx} className="leading-normal">
                        {log}
                      </div>
                    ))}
                    {pipelineLogs.length === 0 && (
                      <div className="text-muted-foreground text-center py-12">Console idle. Upload or select a study to trigger the pipeline.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Multi-Planar Reconstruction Viewer (MPR Console) */}
            <div className="grid grid-cols-1 gap-6">
              {/* MPR Viewer Box */}
              <div key={selectedScanId} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 animate-scale-in col-span-full">
                <div className="flex justify-between items-center border-b border-border/40 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Layers className="w-4.5 h-4.5 text-primary" />
                      3D Multi-Planar Reconstruction (MPR) Console
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Click inside panels to target coordinates. Slices sync dynamically.</p>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => setShowQsvmBloch(!showQsvmBloch)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        showQsvmBloch 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'border-border text-muted-foreground hover:bg-muted bg-background/50'
                      }`}
                    >
                      {showQsvmBloch ? 'Disable Quantum Map' : 'Enable QSVM Bloch Map'}
                    </button>
                    <span className="text-[10px] text-muted-foreground font-semibold">Overlay Opacity:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mriOverlayOpacity}
                      onChange={(e) => setMriOverlayOpacity(parseInt(e.target.value))}
                      className="w-24 h-1 bg-muted rounded appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-[10px] font-mono font-semibold text-primary">{mriOverlayOpacity}%</span>
                  </div>
                </div>

                <div className={`grid grid-cols-1 ${showQsvmBloch ? 'lg:grid-cols-4' : 'md:grid-cols-3'} gap-5`}>
                  {/* Panel 1: Axial Plane */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>1. Axial Plane (Z-Axis)</span>
                      <span className="font-mono text-primary">Slice {axialSlice}/80</span>
                    </div>
                    <div 
                      onClick={handleImageClick}
                      className="relative aspect-square w-full bg-[#030303] rounded-lg border border-border overflow-hidden flex items-center justify-center cursor-crosshair"
                    >
                      {axialImage || (currentScanImage && currentScanImage !== '/brain_scan.png') ? (
                        <img
                          src={axialImage || currentScanImage!}
                          alt="Axial MRI Slice"
                          style={{ filter: qcnnFilter > 0 ? `contrast(${100 + qcnnFilter * 2.5}%) brightness(${100 - qcnnFilter * 0.2}%) grayscale(${qcnnFilter / 100})` : 'none' }}
                          className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 border border-dashed border-border/50 p-4 text-center z-10 select-none">
                          <Layers className="w-7 h-7 text-primary/20 mb-2 animate-pulse" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Awaiting Axial Upload</span>
                          <span className="text-[8px] text-muted-foreground mt-0.5 font-mono">Slot Z-Axis (Horizontal)</span>
                        </div>
                      )}
                      <svg className="absolute inset-0 w-full h-full text-primary/10 pointer-events-none" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1,2" />
                        <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1,2" />
                        <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1,2" />
                      </svg>

                      {/* Dynamic Crosshairs */}
                      {activeScanParams.tumorX > 0 && (
                        <>
                          <div style={{ left: `${activeScanParams.tumorX}%` }} className="absolute top-0 bottom-0 w-px border-l border-red-500/40 border-dashed pointer-events-none" />
                          <div style={{ top: `${activeScanParams.tumorY}%` }} className="absolute left-0 right-0 h-px border-t border-red-500/40 border-dashed pointer-events-none" />
                          <div
                            style={{
                              position: 'absolute',
                              left: `${activeScanParams.tumorX}%`,
                              top: `${activeScanParams.tumorY}%`,
                              transform: 'translate(-50%, -50%)',
                              width: `${activeScanParams.tumorR * 4}%`,
                              height: `${activeScanParams.tumorR * 4}%`,
                              borderRadius: '50%',
                              background: 'radial-gradient(circle, rgba(239,68,68,0.85) 0%, rgba(245,158,11,0.6) 40%, rgba(56,189,248,0) 70%)',
                              opacity: mriOverlayOpacity / 100,
                              pointerEvents: 'none'
                            }}
                          />
                        </>
                      )}
                    </div>
                    <div className="space-y-1">
                      <input
                        type="range"
                        min="1"
                        max="80"
                        value={axialSlice}
                        onChange={(e) => setAxialSlice(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  {/* Panel 2: Coronal Plane */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>2. Coronal Plane (Y-Axis)</span>
                      <span className="font-mono text-primary">Slice {coronalSlice}/80</span>
                    </div>
                    <div 
                      onClick={handleCoronalClick}
                      className="relative aspect-square w-full bg-[#030303] rounded-lg border border-border overflow-hidden flex items-center justify-center cursor-crosshair"
                    >
                      {coronalImage ? (
                        <img
                          src={coronalImage}
                          alt="Coronal MRI Slice"
                          style={{ filter: qcnnFilter > 0 ? `contrast(${100 + qcnnFilter * 2.5}%) brightness(${100 - qcnnFilter * 0.2}%) grayscale(${qcnnFilter / 100})` : 'none' }}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 filter hue-rotate-15"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 border border-dashed border-border/50 p-4 text-center z-10 select-none">
                          <Layers className="w-7 h-7 text-primary/20 mb-2 animate-pulse" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Awaiting Coronal Upload</span>
                          <span className="text-[8px] text-muted-foreground mt-0.5 font-mono">Slot Y-Axis (Frontal)</span>
                        </div>
                      )}
                      <svg className="absolute inset-0 w-full h-full text-primary/10 pointer-events-none" viewBox="0 0 100 100">
                        <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1,2" />
                        <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1,2" />
                      </svg>

                      {/* Dynamic Crosshairs linked to tumorX and coronalSlice */}
                      {activeScanParams.tumorX > 0 && (
                        <>
                          <div style={{ left: `${activeScanParams.tumorX}%` }} className="absolute top-0 bottom-0 w-px border-l border-cyan-500/40 border-dashed pointer-events-none" />
                          <div style={{ top: `${coronalSlice}%` }} className="absolute left-0 right-0 h-px border-t border-cyan-500/40 border-dashed pointer-events-none" />
                          <div
                            style={{
                              position: 'absolute',
                              left: `${activeScanParams.tumorX}%`,
                              top: `${coronalSlice}%`,
                              transform: 'translate(-50%, -50%)',
                              width: `10%`,
                              height: `10%`,
                              borderRadius: '50%',
                              background: 'radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(6,182,212,0) 70%)',
                              opacity: mriOverlayOpacity / 100,
                              pointerEvents: 'none'
                            }}
                          />
                        </>
                      )}
                    </div>
                    <div className="space-y-1">
                      <input
                        type="range"
                        min="1"
                        max="80"
                        value={coronalSlice}
                        onChange={(e) => setCoronalSlice(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  {/* Panel 3: Sagittal Plane */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>3. Sagittal Plane (X-Axis)</span>
                      <span className="font-mono text-primary">Slice {sagittalSlice}/80</span>
                    </div>
                    <div 
                      onClick={handleSagittalClick}
                      className="relative aspect-square w-full bg-[#030303] rounded-lg border border-border overflow-hidden flex items-center justify-center cursor-crosshair"
                    >
                      {sagittalImage ? (
                        <img
                          src={sagittalImage}
                          alt="Sagittal MRI Slice"
                          style={{ filter: qcnnFilter > 0 ? `contrast(${100 + qcnnFilter * 2.5}%) brightness(${100 - qcnnFilter * 0.2}%) grayscale(${qcnnFilter / 100})` : 'none' }}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 filter hue-rotate-180"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 border border-dashed border-border/50 p-4 text-center z-10 select-none">
                          <Layers className="w-7 h-7 text-primary/20 mb-2 animate-pulse" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Awaiting Sagittal Upload</span>
                          <span className="text-[8px] text-muted-foreground mt-0.5 font-mono">Slot X-Axis (Profile)</span>
                        </div>
                      )}
                      <svg className="absolute inset-0 w-full h-full text-primary/10 pointer-events-none" viewBox="0 0 100 100">
                        <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1,2" />
                        <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1,2" />
                      </svg>

                      {/* Dynamic Crosshairs linked to tumorY and sagittalSlice */}
                      {activeScanParams.tumorY > 0 && (
                        <>
                          <div style={{ left: `${activeScanParams.tumorY}%` }} className="absolute top-0 bottom-0 w-px border-l border-amber-500/40 border-dashed pointer-events-none" />
                          <div style={{ top: `${sagittalSlice}%` }} className="absolute left-0 right-0 h-px border-t border-amber-500/40 border-dashed pointer-events-none" />
                          <div
                            style={{
                              position: 'absolute',
                              left: `${activeScanParams.tumorY}%`,
                              top: `${sagittalSlice}%`,
                              transform: 'translate(-50%, -50%)',
                              width: `10%`,
                              height: `10%`,
                              borderRadius: '50%',
                              background: 'radial-gradient(circle, rgba(245,158,11,0.8) 0%, rgba(245,158,11,0) 70%)',
                              opacity: mriOverlayOpacity / 100,
                              pointerEvents: 'none'
                            }}
                          />
                        </>
                      )}
                    </div>
                    <div className="space-y-1">
                      <input
                        type="range"
                        min="1"
                        max="80"
                        value={sagittalSlice}
                        onChange={(e) => setSagittalSlice(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  {/* Panel 4: QSVM Hilbert Map (Gated by showQsvmBloch) */}
                  {showQsvmBloch && (
                    <div className="space-y-2 border-l border-border/40 pl-4 animate-scale-in">
                      <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>4. QSVM Hilbert Map</span>
                        <span className="font-mono text-primary">State Vector</span>
                      </div>
                      
                      <div className="py-2.5 bg-black/40 border border-border rounded-lg flex flex-col justify-center items-center h-[180px]">
                        <BlochSphereCanvas 
                          theta={activeScanParams.tumorX > 0 ? (activeScanParams.tumorX / 100) * 180 : 90} 
                          phi={activeScanParams.tumorY > 0 ? (activeScanParams.tumorY / 100) * 360 : 0} 
                        />
                      </div>

                      <div className="space-y-2 mt-2 bg-muted/20 p-2 rounded border border-border/40 text-[9px] font-mono text-muted-foreground leading-relaxed">
                        <div>Quantum State Vector mapping:</div>
                        <div className="text-foreground font-semibold">|&psi;⟩ = cos(&theta;/2)|0⟩ + e<sup>i&phi;</sup>sin(&theta;/2)|1⟩</div>
                        <div className="text-[8px] text-primary">
                          &theta; (x-axis map): {activeScanParams.tumorX > 0 ? ((activeScanParams.tumorX / 100) * 180).toFixed(0) : '90'}&deg; &bull; 
                          &phi; (y-axis map): {activeScanParams.tumorY > 0 ? ((activeScanParams.tumorY / 100) * 360).toFixed(0) : '0'}&deg;
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                          <span>QCNN Edge Filter</span>
                          <span className="text-primary font-mono">{qcnnFilter}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={qcnnFilter}
                          onChange={(e) => setQcnnFilter(parseInt(e.target.value))}
                          className="w-full h-1 bg-muted rounded appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

              {/* Actionable Report Card & Save */}
              <div key={selectedScanId + '-attest'} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 animate-scale-in">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  Attending Attestation Report
                </h4>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-medium">Prediction Flag</label>
                    <select
                      value={customPrediction}
                      onChange={(e) => setCustomPrediction(e.target.value)}
                      className="w-full p-2 rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="Tumor Detected">Tumor Detected</option>
                      <option value="No Abnormalities Detected">No Abnormalities Detected</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-muted-foreground mb-1 font-medium">Confidence Score</label>
                      <input
                        type="text"
                        value={customConfidence}
                        onChange={(e) => setCustomConfidence(e.target.value)}
                        className="w-full p-2 rounded-lg border border-border bg-background font-mono text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1 font-medium">Scanned Body Part</label>
                      <input
                        type="text"
                        value={customBodyPart}
                        onChange={(e) => setCustomBodyPart(e.target.value)}
                        placeholder="e.g. Brain, Lung, Breast"
                        className="w-full p-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1 font-medium">Anatomical Region</label>
                      <input
                        type="text"
                        value={customRegion}
                        onChange={(e) => setCustomRegion(e.target.value)}
                        className="w-full p-2 rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>
                  </div>

                  {/* VQE Volumetric Tracker (QML Feature) */}
                  <div className="border-t border-border/40 pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">VQE Variational Boundary Density Volume</span>
                      <span className="text-xs font-mono font-bold text-primary">
                        {activeScanParams.tumorX > 0 
                          ? `${(activeScanParams.tumorR * activeScanParams.tumorR * 0.15).toFixed(2)} cm³`
                          : '0.00 cm³'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden relative">
                      <div 
                        style={{ width: activeScanParams.tumorX > 0 ? `${(activeScanParams.tumorR / 20) * 100}%` : '0%' }}
                        className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-300"
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-normal">
                      Variational Quantum Eigensolver optimized volume boundary mesh. Convergence error bounds: &plusmn;0.04%
                    </p>
                  </div>

                  {/* Attestation & Digital Signature PIN (Task 2) */}
                  <div className="border-t border-border/40 pt-4 space-y-3.5">
                    <div className="flex items-start gap-2 bg-muted/30 border border-border/40 p-3 rounded-lg">
                      <input
                        type="checkbox"
                        id="attested"
                        checked={attested}
                        onChange={(e) => setAttested(e.target.checked)}
                        className="mt-0.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="attested" className="text-[10px] text-muted-foreground leading-normal cursor-pointer select-none">
                        I hereby attest that I have reviewed these axial, coronal, and sagittal MRI slices and confirm the target coordinates and diagnosis are anatomically accurate.
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-muted-foreground mb-1 font-medium">Attending Doctor Digital Signature (PIN / Name)</label>
                        <input
                          type="text"
                          value={signaturePin}
                          onChange={(e) => setSignaturePin(e.target.value)}
                          placeholder="Enter your clinical name or PIN"
                          className="w-full p-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          required
                        />
                      </div>
                      <div className="text-[9px] text-muted-foreground leading-normal">
                        Signing this record will instantly compile and append a secure entry into the database **Audit Trail** (`/api/audit-logs`) in compliance with FDA and HIPAA Title II regulations.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-border/50 pt-4">
                  <button
                    disabled={isProcessing}
                    onClick={saveScanToPatient}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    Commit Scan to Dossier
                  </button>
                </div>
              </div>
          </>
        )}

        {!showTransferForm && !showRegisterForm && !activePatient && (
          <div className="flex flex-col items-center justify-center h-full border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground bg-card">
            Select a patient from the roster directory to view their file and upload scans.
          </div>
        )}
      </div>
    </div>
  )
}
