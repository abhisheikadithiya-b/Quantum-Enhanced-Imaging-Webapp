import { useState, useEffect } from 'react'
import { ShieldCheck, User, LogIn, Key, Brain, Info, ArrowRight } from 'lucide-react'
import Hero, { InfoSection } from './components/Hero'
import DoctorDashboard from './components/DoctorDashboard'
import PatientDashboard from './components/PatientDashboard'
import AdminDashboard from './components/AdminDashboard'
import QuantumVisualizer from './components/QuantumVisualizer'
import ThemeToggle from './components/ThemeToggle'



export default function App() {
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  
  // Auth state
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('auth_token'))
  const [activeRole, setActiveRole] = useState<'guest' | 'doctor' | 'patient' | 'student' | 'admin'>(() => {
    return (sessionStorage.getItem('active_role') as any) || 'guest'
  })
  const [loggedInUser, setLoggedInUser] = useState<any>(() => {
    const user = sessionStorage.getItem('logged_user')
    return user ? JSON.parse(user) : null
  })
  
  // Central Login Card fields
  const [loginTab, setLoginTab] = useState<'doctor' | 'patient' | 'student' | 'admin'>('doctor')
  const [authId, setAuthId] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Load patient and doctor databases from API endpoints
  const fetchDoctorsAndPatients = async () => {
    if (!token) return
    try {
      const headers = { 'Authorization': `Bearer ${token}` }
      
      if (activeRole === 'patient') {
        const resPatient = await fetch(`/api/patients?id=${loggedInUser.id}`, { headers })
        if (resPatient.ok) {
          const data = await resPatient.json()
          setLoggedInUser(data)
          sessionStorage.setItem('logged_user', JSON.stringify(data))
        }
        return
      }

      const resPatients = await fetch('/api/patients', { headers })
      if (resPatients.ok) {
        const data = await resPatients.json()
        setPatients(data)
      }
      
      if (activeRole === 'admin') {
        const resDoctors = await fetch('/api/doctors', { headers })
        if (resDoctors.ok) {
          const data = await resDoctors.json()
          setDoctors(data)
        }
      }
    } catch (e) {
      console.error('Error fetching clinical databases:', e)
    }
  }

  useEffect(() => {
    fetchDoctorsAndPatients()
  }, [token, activeRole])

  // Doctor CRUD handlers
  const handleAddDoctor = async (doc: any) => {
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(doc)
      })
      if (res.ok) {
        setDoctors(prev => [...prev, doc])
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add doctor')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdateDoctor = async (updatedDoc: any) => {
    try {
      const res = await fetch('/api/doctors', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedDoc)
      })
      if (res.ok) {
        setDoctors(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleRemoveDoctor = async (id: string) => {
    try {
      const res = await fetch(`/api/doctors?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        setDoctors(prev => prev.filter(d => d.id !== id))
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Patient CRUD handlers
  const handleUpdatePatient = async (updatedPatient: any) => {
    try {
      const res = await fetch('/api/patients', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedPatient)
      })
      if (res.ok) {
        const doc = await res.json()
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? doc : p))
        if (loggedInUser && loggedInUser.id === updatedPatient.id) {
          setLoggedInUser(doc)
          sessionStorage.setItem('logged_user', JSON.stringify(doc))
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddPatient = async (patient: any) => {
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patient)
      })
      if (res.ok) {
        const doc = await res.json()
        setPatients(prev => [...prev, doc])
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Central login verification handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: loginTab, id: authId, password: authPassword })
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setToken(data.token)
        setActiveRole(loginTab as any)
        setLoggedInUser(data.user)
        sessionStorage.setItem('auth_token', data.token)
        sessionStorage.setItem('active_role', loginTab)
        sessionStorage.setItem('logged_user', JSON.stringify(data.user))
        setAuthId('')
        setAuthPassword('')
      } else {
        setAuthError(data.error || 'Authentication failed.')
      }
    } catch (err) {
      console.error(err)
      setAuthError('Connection error to database server.')
    }
  }

  const handleLogOut = () => {
    setActiveRole('guest')
    setLoggedInUser(null)
    setToken(null)
    sessionStorage.clear()
  }

  // Define inputs label dynamically based on selected login tab
  const getFieldLabel = () => {
    switch(loginTab) {
      case 'doctor': return 'MEDICAL LICENSE ID'
      case 'patient': return 'PATIENT CASE ID'
      case 'admin': return 'ADMINISTRATOR ID'
      default: return 'ID'
    }
  }

  const getFieldPlaceholder = () => {
    switch(loginTab) {
      case 'doctor': return 'QS-XXXX-XXXX'
      case 'patient': return 'PAT-XXX'
      case 'admin': return 'admin'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300 dark">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div 
            onClick={() => { if (activeRole === 'guest') { window.scrollTo({top: 0, behavior: 'smooth'}); } else { handleLogOut(); } }} 
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            {/* Microscope logo used as app logo */}
            <img src="/logo.svg" alt="Microscope Logo" className="w-8 h-8 text-primary group-hover:scale-105 transition-all filter invert dark:invert-0" />
            <span className="font-extrabold text-base tracking-wider text-foreground group-hover:text-primary transition-colors uppercase">
              QUANTA-SCAN
            </span>
          </div>

          <nav className="flex items-center gap-3">
            {activeRole !== 'guest' && (
              <span className="text-xs font-semibold text-muted-foreground mr-1 hidden sm:inline-block">
                Authenticated as: <strong className="text-foreground">{loggedInUser?.name}</strong>
              </span>
            )}
            
            {activeRole !== 'guest' ? (
              <button
                onClick={handleLogOut}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-border text-foreground transition-all"
              >
                Log Out
              </button>
            ) : (
              <a
                href="#secure-login-gate"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </a>
            )}
            
            <span className="h-4 w-px bg-border" />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Workspace Router */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 space-y-16">
        {activeRole === 'guest' ? (
          <>
            {/* 1. Hero overview */}
            <Hero />
            
            {/* 2. Secure Gate consolidated Login Section (Matches Screenshot Design) */}
            <section id="secure-login-gate" className="max-w-4xl mx-auto py-12 px-4 border-t border-border/60 animate-fade-in">
              <div className="text-center mb-10 space-y-2">
                {/* Microscope brand icon */}
                <img src="/logo.svg" alt="Microscope Logo" className="w-12 h-12 mx-auto filter invert dark:invert-0 mb-4" />
                <h2 className="text-3xl font-extrabold tracking-wider text-foreground uppercase">QUANTA-SCAN</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  PRECISION DIAGNOSTICS INTERFACE
                </p>
              </div>

              {/* Login block card layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left panel: Info status card (matches screenshot bottom-left) */}
                <div className="lg:col-span-1 space-y-4 animate-slide-up">
                  <div className="quanta-update-panel rounded-xl p-4 space-y-3.5 shadow-sm text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <Brain className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase block">Last System Update</span>
                        <h4 className="text-[11px] font-bold text-foreground font-mono">Precision Phase I Active</h4>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Security audits registered. Hyperparameter neural arrays calibrated. BQPhy qubits in coherence.
                    </p>
                  </div>

                  <div className="quanta-update-panel rounded-xl p-4 space-y-2.5 shadow-sm text-xs text-left">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase block mb-1">Security & Encryption</span>
                    <div className="space-y-1 text-muted-foreground leading-normal text-[10px]">
                      <div>• AES-256 Bit Data Encryption at Rest</div>
                      <div>• TLS 1.3 Secure Volumetric Transmission</div>
                      <div>• HIPAA & HITECH Framework Compliant</div>
                      <div>• Audited OAuth 2.0 Identity Gateway</div>
                    </div>
                  </div>
                </div>

                {/* Center / Right: Consolidated Login Card (Matches image layout) */}
                <div className="lg:col-span-2 quanta-login-card rounded-xl p-6 md:p-8 relative overflow-hidden animate-slide-up">
                  <div className="flex justify-between items-center mb-6">
                    <span className="quanta-badge px-2.5 py-1 rounded text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> SECURE PORTAL
                    </span>
                    
                    {/* Tab Selector */}
                    <div className="flex gap-1 bg-muted/40 p-0.5 rounded-lg border border-border">
                      {(['doctor', 'patient', 'admin'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => {
                            setLoginTab(tab)
                            setAuthError('')
                          }}
                          className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition ${
                            loginTab === tab 
                              ? 'bg-primary text-primary-foreground shadow-sm' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-left mb-6">
                    <h3 className="text-xl font-bold text-foreground">Clinical Authentication</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Access authorized diagnostic protocols and patient datasets.
                    </p>
                  </div>

                  {authError && (
                    <div className="mb-4 p-3 border border-red-500/20 bg-red-500/10 text-red-500 text-xs rounded-lg font-medium text-left">
                      {authError}
                    </div>
                  )}

                  <form onSubmit={handleSignIn} className="space-y-4 text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        {getFieldLabel()}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={getFieldPlaceholder()}
                          value={authId}
                          onChange={(e) => setAuthId(e.target.value)}
                          className="quanta-input w-full pl-10 pr-4 py-2.5 rounded-lg text-xs"
                          required
                        />
                        <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          SECURITY CREDENTIALS
                        </label>
                        <span className="text-[9px] text-muted-foreground hover:text-primary cursor-pointer">
                          Forgot Credentials?
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="quanta-input w-full pl-10 pr-4 py-2.5 rounded-lg text-xs"
                          required={loginTab !== 'patient'} // Patient password optional
                        />
                        <Key className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      </div>
                    </div>

                    <div className="quanta-info-bar rounded-lg p-3 flex items-start gap-2 text-[10px] text-muted-foreground">
                      <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>Two-Factor Authentication (2FA) required upon sign-in.</span>
                    </div>

                    <button
                      type="submit"
                      className="cyan-glow-button w-full py-3 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="flex justify-between items-center border-t border-border/40 pt-4 mt-6 text-[9px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="h-4 w-1.5 bg-primary rounded-[1px] inline-block" />
                      <span>SYSTEM READY | V4.0.2-QS</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="hover:text-foreground cursor-pointer">SUPPORT</span>
                      <span className="hover:text-foreground cursor-pointer">PRIVACY POLICY</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>
            
            {/* 3. Info Tab Analytics Section (Moved after Login Fold - Task 2) */}
            <div className="border-t border-border/60 pt-10">
              <InfoSection />
            </div>
            
            {/* Interactive Sandbox for preview */}
            <div className="border-t border-border/60 pt-10">
              <div className="max-w-4xl mx-auto space-y-4 mb-6">
                <h3 className="text-xl font-bold text-foreground text-center">Interactive Quantum Optimizer Sandbox</h3>
                <p className="text-xs text-muted-foreground text-center max-w-md mx-auto">
                  Try out the HPO compiler dial controls below to see how quantum annealing solver models filter noisy feature sets.
                </p>
              </div>
              <QuantumVisualizer />
            </div>
          </>
        ) : (
          /* Logged In Dashboard Views */
          <div className="space-y-6">
            {activeRole === 'doctor' && (
              <DoctorDashboard
                patients={patients}
                activeDoctor={loggedInUser}
                onUpdatePatient={handleUpdatePatient}
                onAddPatient={handleAddPatient}
                onLogout={handleLogOut}
                token={token}
              />
            )}

            {activeRole === 'patient' && (
              <PatientDashboard
                activePatient={loggedInUser}
                onLogout={handleLogOut}
              />
            )}

            {activeRole === 'admin' && (
              <AdminDashboard
                doctors={doctors}
                onAddDoctor={handleAddDoctor}
                onUpdateDoctor={handleUpdateDoctor}
                onRemoveDoctor={handleRemoveDoctor}
                onLogout={handleLogOut}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-6 mt-12 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Microscope Logo" className="w-5 h-5 filter invert dark:invert-0" />
            <span>&copy; 2026 Quanta-Scan Diagnostic Core. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <ShieldCheck className="w-4 h-4" /> HIPAA Secured
            </span>
            <span className="font-semibold text-primary">PWA Offline Mode Active</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
