import { useState } from 'react'
import { Activity, ShieldAlert, Cpu, Heart, CheckCircle2, BarChart3 } from 'lucide-react'

export default function Hero() {
  return (
    <div className="relative max-w-6xl mx-auto py-12 md:py-16 px-4">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pulse-quantum" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="text-left space-y-6 animate-slide-right">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Next-Gen Diagnostic Support
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Quantum-Enhanced <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400 glow-text">
                Medical Imaging
              </span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              An AI-driven decision-support system utilizing quantum computing software for feature selection and hyperparameter optimization to increase cancer detection sensitivity.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#secure-login-gate"
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20"
              >
                Sign In to Portal
              </a>
              <a
                href="#explore-pipeline"
                className="px-6 py-3 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-muted transition-all duration-200"
              >
                Explore System Pipeline
              </a>
            </div>
          </div>

          {/* Right Column: Premium Image of MRI Scanner */}
          <div className="relative group animate-slide-left">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-sky-400 rounded-2xl blur opacity-30 group-hover:opacity-45 transition duration-1000 group-hover:duration-200" />
            <div className="relative border border-border bg-card rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] flex items-center justify-center">
              <img 
                src="/mri_scanner.png" 
                alt="Clinical MRI Machine" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-6 flex flex-col justify-end">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Quanta-Scan Diagnostic Core</span>
                <h4 className="text-white font-bold text-base mt-0.5">High-Coherence Processing Facility</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export function InfoSection() {
  const [activeTab, setActiveTab] = useState<'problem' | 'synergy' | 'quantum'>('problem')

  return (
    <div className="space-y-12">
      {/* Info Tabs: Bottleneck, Synergy, Quantum */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('problem')}
            className={`flex-1 text-center py-4 border-b-2 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'problem'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Clinical Bottlenecks
          </button>
          <button
            onClick={() => setActiveTab('synergy')}
            className={`flex-1 text-center py-4 border-b-2 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'synergy'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className="w-4 h-4" />
            Human + AI Synergy
          </button>
          <button
            onClick={() => setActiveTab('quantum')}
            className={`flex-1 text-center py-4 border-b-2 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'quantum'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Cpu className="w-4 h-4" />
            The Quantum Advantage
          </button>
        </div>

        <div className="min-h-[250px] transition-all duration-300">
          {activeTab === 'problem' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">Why radiology is reaching its limit</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Major hospitals face an overwhelming caseload, with upwards of <strong>500 patients every day</strong> requiring dense, multi-layered scans. Radiologists review hundreds of scans weekly, spending only 5-20 minutes on each.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-red-500/10 p-1 rounded text-red-500">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">Diagnostic Fatigue</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">High volume leads to cognitive fatigue, increasing the risk of missing microscopic, early-stage tumors.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-red-500/10 p-1 rounded text-red-500">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">Specialist Shortage</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Rural and underfunded clinics often lack highly specialized oncological radiologists to confidently screen scans.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-border rounded-2xl overflow-hidden h-64 shadow-sm relative">
                <img src="/mri_scanner.png" alt="Clinical MRI Scanner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-left">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Clinical Facility Scan</span>
                  <h4 className="text-white font-bold text-sm">Next-Gen MRI Scanner Loop</h4>
                  <p className="text-[10px] text-neutral-300 mt-1 max-w-xs">Assisting hospitals handling 500+ scans daily.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'synergy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">Not a replacement, an assistant</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The goal of the system is to empower, not replace, medical staff. By functioning as a clinical decision-support tool, the AI acts as a reliable "second pair of eyes".
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Rapidly flags suspicious regions for immediate doctor inspection.
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Alleviates fatigue by directing attention to high-risk areas first.
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Ensures consistent anomaly highlights regardless of caseload pressure.
                  </li>
                </ul>
              </div>
              <div className="border border-border rounded-2xl overflow-hidden h-64 shadow-sm relative">
                <img src="/brain_scan.png" alt="Grad-CAM Saliency Map" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-left">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Explainable AI (XAI)</span>
                  <h4 className="text-white font-bold text-sm">Grad-CAM Frontal Lobe Highlight</h4>
                  <p className="text-[10px] text-neutral-300 mt-1 max-w-xs">Visually explaining model activations to clinicians.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quantum' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">Optimization, not direct image reading</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The quantum layer does not scan the image directly. Instead, quantum optimization software like <strong>QuantumNow</strong> or <strong>BQPhy SDK</strong> optimizes the machine learning pipeline.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 p-1 rounded text-primary">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">Feature Optimization</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Filters out 10,000 raw features (texture, contrast, intensity, shape) down to 500 optimal features, stripping out useless noise.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 p-1 rounded text-primary">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">Hyperparameter Tuning (HPO)</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Navigates complex multi-dimensional landscapes simultaneously to find absolute optimal model learning settings in seconds.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-muted/30 border border-border p-6 rounded-2xl flex flex-col justify-center items-center h-64 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Classical</div>
                    <div className="text-2xl font-extrabold text-muted-foreground">92%</div>
                  </div>
                  <div className="text-lg font-bold text-muted-foreground">→</div>
                  <div className="text-center">
                    <div className="text-xs text-primary font-semibold">Quantum-Opt</div>
                    <div className="text-3xl font-extrabold text-primary glow-text">97%</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground max-w-xs">
                  By utilizing quantum algorithms, the classifier discards useless noise, yielding a critical <strong>5% gain in accuracy</strong> and preventing overfitting.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Pipeline Section */}
      <div id="explore-pipeline" className="max-w-5xl mx-auto px-4 pt-8">
        <h3 className="text-2xl font-bold tracking-tight text-center text-foreground mb-8">
          The Quantum-Enhanced Diagnostic Pipeline
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border p-5 rounded-xl space-y-3 relative hover:shadow-md transition-all duration-300">
            <span className="absolute top-3 right-3 text-2xl font-black text-muted/20">01</span>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-foreground">1. MRI Scanning</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Patient undergoes a standard imaging protocol. Raw multi-slice dicom files are generated by the clinical scanner.
            </p>
          </div>

          <div className="bg-card border border-border p-5 rounded-xl space-y-3 relative hover:shadow-md transition-all duration-300">
            <span className="absolute top-3 right-3 text-2xl font-black text-muted/20">02</span>
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-foreground">2. Preprocessing</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>SimpleITK</strong> and <strong>MONAI</strong> standardize pixel intensities, crop scans, and run skull-stripping to extract white/gray matter.
            </p>
          </div>

          <div className="bg-card border border-border p-5 rounded-xl space-y-3 relative hover:shadow-md transition-all duration-300">
            <span className="absolute top-3 right-3 text-2xl font-black text-muted/20">03</span>
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-foreground">3. Quantum Filter</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>BQPhy / QuantumNow</strong> filters 10K raw texture and shape features down to 500 optimal predictors, solving computational traps.
            </p>
          </div>

          <div className="bg-card border border-border p-5 rounded-xl space-y-3 relative hover:shadow-md transition-all duration-300">
            <span className="absolute top-3 right-3 text-2xl font-black text-muted/20">04</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-foreground">4. Report & XAI</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Deep CNN classifies anomalies. **Grad-CAM** generates saliency overlays on the scan, rendering a structured report for doctor signoff.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div id="metrics" className="max-w-5xl mx-auto px-4 bg-muted/20 border border-border rounded-2xl p-8">
        <h3 className="text-xl font-bold text-foreground mb-6 text-center md:text-left flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Primary Evaluation & Validation Metrics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">Prioritizing Sensitivity (Recall)</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In oncology, a False Negative (missing a tumor) is far more hazardous than a False Positive. The quantum model tuning focuses on maximizing sensitivity to prevent missed diagnostics.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">Specificity & Selectivity</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ensures healthy, normal tissues are correctly categorised, reducing clinician time spent chasing benign artifacts and alleviating patient anxiety.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">F1-Score and AUC-ROC</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Synthesizes precision and recall into a single harmonic index. Maintains an AUC-ROC of <strong>0.985</strong>, representing exceptional discriminative ability between tumor boundaries.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
