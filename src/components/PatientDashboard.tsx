import { useState } from 'react'
import { User, Shield, BriefcaseMedical, Calendar, Download, TrendingDown, Activity, Cpu } from 'lucide-react'

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

interface PatientDashboardProps {
  activePatient: Patient;
  onLogout: () => void;
}

export default function PatientDashboard({ activePatient, onLogout }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'recovery' | 'prescriptions' | 'scans'>('profile')
  const [selectedScan, setSelectedScan] = useState<Scan | null>(activePatient.scans[0] || null)

  const tumorMax = Math.max(...activePatient.tumorHistory.map(d => d.volume), 1)
  const wellnessMax = 100

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Top Banner Profile Summary */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl uppercase">
            {activePatient.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{activePatient.name}</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border border-primary/30 bg-primary/5 text-primary">
                {activePatient.id}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                activePatient.status === 'Remission' 
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500'
                  : 'border-amber-500/30 bg-amber-500/5 text-amber-500'
              }`}>
                {activePatient.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Age: {activePatient.age} &bull; Gender: {activePatient.gender} &bull; Blood Type: {activePatient.bloodType}
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={onLogout}
            className="flex-1 md:flex-initial text-center px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all duration-200"
          >
            Log Out Portal
          </button>
        </div>
      </div>

      {/* Main Grid navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center gap-2.5 ${
              activeTab === 'profile'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            Medical Profile & Doctor
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center gap-2.5 ${
              activeTab === 'recovery'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            State & Recovery Graphs
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center gap-2.5 ${
              activeTab === 'prescriptions'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
            }`}
          >
            <BriefcaseMedical className="w-4 h-4" />
            Medical Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('scans')}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center gap-2.5 ${
              activeTab === 'scans'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
            }`}
          >
            <Calendar className="w-4 h-4" />
            MRI Scans & Reports
          </button>
        </div>

        {/* Tab Contents */}
        <div className="lg:col-span-3">
          {/* Tab 1: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Diagnoses Card */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Clinical Diagnosis
                  </h3>
                  <div className="space-y-2 border-t border-border/50 pt-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Condition:</span>
                      <span className="font-semibold text-foreground">{activePatient.cancerType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Classification:</span>
                      <span className="font-semibold text-foreground">{activePatient.stage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Care Status:</span>
                      <span className="font-semibold text-foreground text-primary">{activePatient.status}</span>
                    </div>
                  </div>
                </div>

                {/* Assigned Doctor Card */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Your Lead Oncologist
                  </h3>
                  <div className="space-y-2 border-t border-border/50 pt-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Doctor Name:</span>
                      <span className="font-semibold text-foreground">{activePatient.doctor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Specialty:</span>
                      <span className="font-semibold text-foreground">{activePatient.doctor.dept}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-mono text-foreground">{activePatient.doctor.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-mono text-foreground">{activePatient.doctor.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Rights / HIPAA notice */}
              <div className="p-4 bg-muted/40 border border-border/50 rounded-xl text-xs text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-primary" /> HIPAA Security Standards
                </p>
                <p>
                  This portal complies with the Health Insurance Portability and Accountability Act (HIPAA). All medical health information (PHI) is heavily encrypted in transit and at rest. Access is strictly audited.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Recovery Graphs */}
          {activeTab === 'recovery' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Graph 1: Tumor Size Progression */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4 uppercase tracking-wider">
                    <TrendingDown className="w-4 h-4 text-primary" />
                    Tumor Size Index (cc/cm)
                  </h3>
                  
                  {/* Custom SVG Line Chart */}
                  <div className="h-56 bg-muted/30 border border-border/40 rounded-lg p-4 relative flex items-end">
                    <span className="absolute top-1 right-2 text-[9px] text-muted-foreground font-mono">Month-over-Month</span>
                    
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
                      <line x1="0" y1="10" x2="100" y2="10" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
                      <line x1="0" y1="25" x2="100" y2="25" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
                      <line x1="0" y1="40" x2="100" y2="40" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
                      
                      {(() => {
                        const pts = activePatient.tumorHistory.map((pt, idx) => {
                          const x = idx * 22 + 6
                          const y = 45 - (pt.volume / tumorMax) * 35
                          return { x, y, val: pt.volume, label: pt.month }
                        })
                        const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
                        
                        return (
                          <>
                            <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2" />
                            {pts.map((p, i) => (
                              <g key={i}>
                                <circle cx={p.x} cy={p.y} r="3" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
                                <text x={p.x} y={p.y - 5} fill="var(--foreground)" fontSize="3.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                                  {p.val}
                                </text>
                                <text x={p.x} y="49" fill="var(--muted-foreground)" fontSize="3" textAnchor="middle" fontFamily="sans-serif">
                                  {p.label}
                                </text>
                              </g>
                            ))}
                          </>
                        )
                      })()}
                    </svg>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-3 text-center">
                    * Displays the primary spatial mass volume/diameter computed via automated segmentation.
                  </p>
                </div>

                {/* Graph 2: Wellness Index */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4 uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Patient Wellness Score (%)
                  </h3>
                  
                  {/* Custom SVG Bar Chart */}
                  <div className="h-56 bg-muted/30 border border-border/40 rounded-lg p-4 relative flex items-end">
                    <span className="absolute top-1 right-2 text-[9px] text-muted-foreground font-mono">Patient Feedback Rating</span>
                    
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
                      <line x1="0" y1="10" x2="100" y2="10" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
                      <line x1="0" y1="25" x2="100" y2="25" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
                      <line x1="0" y1="40" x2="100" y2="40" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
                      
                      {(() => {
                        const pts = activePatient.wellnessHistory.map((pt, idx) => {
                          const x = idx * 22 + 6
                          const barH = (pt.score / wellnessMax) * 35
                          const y = 43 - barH
                          return { x, y, barH, val: pt.score, label: pt.month }
                        })
                        
                        return (
                          <>
                            {pts.map((p, i) => (
                              <g key={i}>
                                <rect x={p.x - 4} y={p.y} width="8" height={p.barH} fill="var(--accent)" stroke="var(--primary)" strokeWidth="0.5" rx="1.5" />
                                <text x={p.x} y={p.y - 3} fill="var(--accent-foreground)" fontSize="3.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                                  {p.val}%
                                </text>
                                <text x={p.x} y="49" fill="var(--muted-foreground)" fontSize="3" textAnchor="middle" fontFamily="sans-serif">
                                  {p.label}
                                </text>
                              </g>
                            ))}
                          </>
                        )
                      })()}
                    </svg>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-3 text-center">
                    * Combines patient report feedback (energy levels, therapy tolerance, sleep cycle).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Prescriptions */}
          {activeTab === 'prescriptions' && (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <BriefcaseMedical className="w-5 h-5 text-primary" />
                  Active Treatment Prescriptions
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm text-left">
                  <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="px-5 py-3">Medicine Name</th>
                      <th className="px-5 py-3">Dosage</th>
                      <th className="px-5 py-3">Frequency</th>
                      <th className="px-5 py-3">Start Date</th>
                      <th className="px-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {activePatient.prescriptions.map((rx, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-all">
                        <td className="px-5 py-3.5 font-bold text-foreground">{rx.name}</td>
                        <td className="px-5 py-3.5 text-muted-foreground font-mono">{rx.dosage}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{rx.frequency}</td>
                        <td className="px-5 py-3.5 text-muted-foreground font-mono">{rx.startDate}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            rx.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : rx.status === 'Completed'
                              ? 'bg-muted text-muted-foreground border border-border'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {rx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {activePatient.prescriptions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-muted-foreground text-xs">No active prescriptions registered.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Scans */}
          {activeTab === 'scans' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
              {/* Scan List (Left Side) */}
              <div className="xl:col-span-2 space-y-4">
                {activePatient.scans.map((scan, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedScan(scan)}
                    className={`w-full text-left bg-card border rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${
                      selectedScan?.id === scan.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border/60 hover:shadow-md hover:bg-muted/35 bg-background/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-primary border border-border">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-foreground text-base">{scan.type}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-muted text-muted-foreground">
                            ID: {scan.id}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Scan Date: {scan.date} &bull; Region: {scan.region}
                        </p>
                        
                        <div className="mt-2.5 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-[11px] font-medium border-t border-border/40 pt-2.5">
                          <div>
                            <span className="text-muted-foreground font-semibold">Flag: </span>
                            <span className={scan.prediction.includes('Detected') ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>
                              {scan.prediction}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-semibold">Confidence: </span>
                            <span className="font-mono text-foreground">{scan.confidence}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-semibold">Target Lobe: </span>
                            <span className="text-foreground">{scan.region}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                            hospital: "Quantum Imaging Clinic",
                            patientId: activePatient.id,
                            patientName: activePatient.name,
                            scanId: scan.id,
                            scanDate: scan.date,
                            diagnosis: scan.prediction,
                            confidence: scan.confidence,
                            region: scan.region,
                            comments: scan.comments || '',
                            signatures: "Dr. Evelyn Vance & Quantum-Enhanced AI Classifier (BQPhy SDK)"
                          }, null, 2));
                          const downloadAnchor = document.createElement('a');
                          downloadAnchor.setAttribute("href", dataStr);
                          downloadAnchor.setAttribute("download", `clinical_report_${scan.id}.json`);
                          document.body.appendChild(downloadAnchor);
                          downloadAnchor.click();
                          downloadAnchor.remove();
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-accent text-accent-foreground font-semibold text-xs hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Report
                      </button>
                    </div>
                  </button>
                ))}
                {activePatient.scans.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card text-muted-foreground text-xs">
                    No scans currently uploaded for this patient case.
                  </div>
                )}

                {/* Patient 3D Slice Viewer mapping (locked copy of MPR) */}
                {selectedScan && (
                  <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 animate-scale-in">
                    <div className="border-b border-border/40 pb-2 flex justify-between items-center">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Patient 3D MPR Slice Inspector
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase">Locked Slices Coordinates</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Axial Panel */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase text-center">1. Axial View (Z-Axis)</div>
                        <div className="relative aspect-square w-full bg-black rounded-lg border border-border/60 overflow-hidden flex items-center justify-center">
                          {selectedScan.imageSrc ? (
                            <img
                              src={selectedScan.imageSrc}
                              alt="Patient Axial Slice"
                              className="absolute inset-0 w-full h-full object-cover opacity-80"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-2">
                              <span className="text-[8px] font-bold text-muted-foreground uppercase">Template View</span>
                            </div>
                          )}
                          {selectedScan.tumorX > 0 && (
                            <>
                              <div style={{ left: `${selectedScan.tumorX}%` }} className="absolute top-0 bottom-0 w-px border-l border-red-500/40 border-dashed pointer-events-none" />
                              <div style={{ top: `${selectedScan.tumorY}%` }} className="absolute left-0 right-0 h-px border-t border-red-500/40 border-dashed pointer-events-none" />
                              <div
                                style={{
                                  position: 'absolute',
                                  left: `${selectedScan.tumorX}%`,
                                  top: `${selectedScan.tumorY}%`,
                                  transform: 'translate(-50%, -50%)',
                                  width: `${selectedScan.tumorR * 4}%`,
                                  height: `${selectedScan.tumorR * 4}%`,
                                  borderRadius: '50%',
                                  background: 'radial-gradient(circle, rgba(239,68,68,0.8) 0%, rgba(245,158,11,0.5) 40%, rgba(56,189,248,0) 70%)',
                                  pointerEvents: 'none'
                                }}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Coronal Panel */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase text-center">2. Coronal View (Y-Axis)</div>
                        <div className="relative aspect-square w-full bg-black rounded-lg border border-border/60 overflow-hidden flex items-center justify-center">
                          {selectedScan.coronalImageSrc ? (
                            <img
                              src={selectedScan.coronalImageSrc}
                              alt="Patient Coronal Slice"
                              className="absolute inset-0 w-full h-full object-cover opacity-60 filter hue-rotate-15"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-2 block">
                              <span className="text-[8px] font-bold text-muted-foreground uppercase">Awaiting Upload</span>
                            </div>
                          )}
                          {selectedScan.tumorX > 0 && (
                            <>
                              <div style={{ left: `${selectedScan.tumorX}%` }} className="absolute top-0 bottom-0 w-px border-l border-cyan-500/40 border-dashed pointer-events-none" />
                              <div style={{ top: `38%` }} className="absolute left-0 right-0 h-px border-t border-cyan-500/40 border-dashed pointer-events-none" />
                              <div
                                style={{
                                  position: 'absolute',
                                  left: `${selectedScan.tumorX}%`,
                                  top: `38%`,
                                  transform: 'translate(-50%, -50%)',
                                  width: `10%`,
                                  height: `10%`,
                                  borderRadius: '50%',
                                  background: 'radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(6,182,212,0) 70%)',
                                  pointerEvents: 'none'
                                }}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Sagittal Panel */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase text-center">3. Sagittal View (X-Axis)</div>
                        <div className="relative aspect-square w-full bg-black rounded-lg border border-border/60 overflow-hidden flex items-center justify-center">
                          {selectedScan.sagittalImageSrc ? (
                            <img
                              src={selectedScan.sagittalImageSrc}
                              alt="Patient Sagittal Slice"
                              className="absolute inset-0 w-full h-full object-cover opacity-60 filter hue-rotate-180"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-2 block">
                              <span className="text-[8px] font-bold text-muted-foreground uppercase">Awaiting Upload</span>
                            </div>
                          )}
                          {selectedScan.tumorY > 0 && (
                            <>
                              <div style={{ left: `${selectedScan.tumorY}%` }} className="absolute top-0 bottom-0 w-px border-l border-amber-500/40 border-dashed pointer-events-none" />
                              <div style={{ top: `50%` }} className="absolute left-0 right-0 h-px border-t border-amber-500/40 border-dashed pointer-events-none" />
                              <div
                                style={{
                                  position: 'absolute',
                                  left: `${selectedScan.tumorY}%`,
                                  top: `50%`,
                                  transform: 'translate(-50%, -50%)',
                                  width: `10%`,
                                  height: `10%`,
                                  borderRadius: '50%',
                                  background: 'radial-gradient(circle, rgba(245,158,11,0.8) 0%, rgba(245,158,11,0) 70%)',
                                  pointerEvents: 'none'
                                }}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantum Explanation Card & Signature verification (Right Side) */}
              <div className="xl:col-span-1 space-y-5 animate-scale-in">
                {selectedScan && (
                  <>
                    {/* Certified Oncologist Attestation seal */}
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                        <User className="w-4 h-4 text-emerald-500" />
                        Clinical Verification Seal
                      </h4>
                      <div className="space-y-3.5 text-xs border-t border-border/40 pt-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Certified By:</span>
                          <span className="font-bold text-foreground">{activePatient.doctor.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Verification Date:</span>
                          <span className="font-mono text-foreground">{selectedScan.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Signature Type:</span>
                          <span className="text-emerald-500 font-semibold">Attesting PIN Verification</span>
                        </div>
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-[10px] text-emerald-500 leading-normal flex flex-col gap-1">
                          <span className="font-bold">Attested Notes:</span>
                          <span>&ldquo;{selectedScan.comments || 'Scan sequence confirmed and verified inside the secure clinical registry.'}&rdquo;</span>
                        </div>
                      </div>
                    </div>

                    {/* Quantum Technology Dictionary */}
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                        <Cpu className="w-4 h-4 text-primary" />
                        Quantum-Enhanced Diagnostics
                      </h4>
                      <div className="space-y-4 text-[11px] border-t border-border/40 pt-3">
                        <div className="space-y-1">
                          <span className="font-bold text-foreground block">QUBO Feature Selection</span>
                          <p className="text-muted-foreground leading-normal">
                            Maps MRI pixels to binary correlation lattices. Quantum tunneling finds optimized paths, eliminating scanning artifacts and noise.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-foreground block">QCNN Image Filtering</span>
                          <p className="text-muted-foreground leading-normal">
                            Superposition edge detection maps complex density interfaces. Enhances micro-calcification borders to detect early tumors.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-foreground block">VQE Volume Calculations</span>
                          <p className="text-muted-foreground leading-normal">
                            Computes variational boundary density volume with sub-millimeter precision, providing exact growth tracking.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
