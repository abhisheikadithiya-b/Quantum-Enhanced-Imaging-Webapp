import { useState, useEffect } from 'react'
import { Cpu, RotateCcw, Play, CheckCircle } from 'lucide-react'

export default function QuantumVisualizer() {
  const [learningRate, setLearningRate] = useState<number>(0.001)
  const [batchSize, setBatchSize] = useState<number>(32)
  const [epochs, setEpochs] = useState<number>(50)
  
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizerProgress, setOptimizerProgress] = useState(0)
  const [hasRun, setHasRun] = useState(false)
  const [qubits, setQubits] = useState<number[]>(new Array(16).fill(0).map(() => Math.random()))

  // Randomize qubits on cycle if optimizing
  useEffect(() => {
    let interval: any
    if (isOptimizing) {
      interval = setInterval(() => {
        setQubits(new Array(16).fill(0).map(() => Math.random()))
        setOptimizerProgress(prev => {
          if (prev >= 100) {
            setIsOptimizing(false)
            setHasRun(true)
            clearInterval(interval)
            return 100
          }
          return prev + 5
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isOptimizing])

  const runQuantumOptimization = () => {
    setIsOptimizing(true)
    setOptimizerProgress(0)
    setHasRun(false)
  }

  const resetOptimizer = () => {
    setIsOptimizing(false)
    setOptimizerProgress(0)
    setHasRun(false)
    setLearningRate(0.001)
    setBatchSize(32)
    setEpochs(50)
  }

  // Calculate simulated parameters
  const optimizedLearningRate = (learningRate * 0.74).toFixed(5)
  const optimizedBatchSize = Math.round(batchSize * 1.5)
  const optimizedEpochs = Math.round(epochs * 0.6)

  return (
    <div className="w-full bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            BQPhy SDK / QuantumNow HPO Solver
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Simulate parallel hyperparameter optimization of learning rate, batch size, and epoch parameters.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetOptimizer}
            disabled={isOptimizing}
            className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all duration-200 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={runQuantumOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-1 text-xs px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all duration-200 shadow-sm disabled:opacity-50 pulse-quantum"
          >
            <Play className="w-3.5 h-3.5" />
            {isOptimizing ? 'Quantum Annealing...' : 'Run Optimization'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Control panel dials */}
        <div className="space-y-5 border-r border-border/50 pr-0 lg:pr-6">
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Classical Dials</h4>
          
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-muted-foreground">Learning Rate (\(\eta\))</span>
              <span className="text-foreground font-mono">{learningRate}</span>
            </div>
            <input
              type="range"
              min="0.0001"
              max="0.01"
              step="0.0005"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              disabled={isOptimizing}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
            />
            <span className="text-[10px] text-muted-foreground block mt-1">Controls model learning step sizes</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-muted-foreground">Batch Size</span>
              <span className="text-foreground font-mono">{batchSize} samples</span>
            </div>
            <input
              type="range"
              min="16"
              max="128"
              step="8"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              disabled={isOptimizing}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
            />
            <span className="text-[10px] text-muted-foreground block mt-1">Number of MRI slices processed per step</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-muted-foreground">Epochs</span>
              <span className="text-foreground font-mono">{epochs} runs</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={epochs}
              onChange={(e) => setEpochs(parseInt(e.target.value))}
              disabled={isOptimizing}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
            />
            <span className="text-[10px] text-muted-foreground block mt-1">Total training loops for weight convergence</span>
          </div>
        </div>

        {/* Center: Live Qubit Lattice Simulation */}
        <div className="flex flex-col justify-center items-center p-4 bg-muted/30 rounded-xl border border-border/50">
          <div className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            {isOptimizing ? `Coherence Phase: ${optimizerProgress}%` : 'Quantum Register (16 Qubits)'}
          </div>
          
          <div className="grid grid-cols-4 gap-4 p-4 border border-border/40 rounded-lg bg-background shadow-inner relative overflow-hidden">
            {isOptimizing && (
              <div className="absolute inset-0 bg-primary/5 pointer-events-none animate-pulse" />
            )}
            {qubits.map((val, idx) => {
              const spinColor = isOptimizing
                ? `hsla(199, 98%, ${Math.round(val * 40 + 40)}%, ${val})`
                : val > 0.5 ? 'var(--primary)' : 'var(--muted-foreground)';
              const glowStyle = isOptimizing
                ? { boxShadow: `0 0 10px hsla(199, 98%, 50%, ${val})` }
                : {};
              
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div
                    style={{ backgroundColor: spinColor, ...glowStyle }}
                    className="w-8 h-8 rounded-full transition-all duration-150 flex items-center justify-center text-[8px] font-bold text-background select-none shadow"
                  >
                    |q<sub>{idx}</sub>⟩
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground">
                    {(val * 100).toFixed(0)}%
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-4 text-center">
            {isOptimizing ? (
              <span className="text-xs text-primary font-medium animate-pulse">Running quantum tunneling state exploration...</span>
            ) : hasRun ? (
              <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Converged on absolute global minimum
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Adjust parameters and click run to begin</span>
            )}
          </div>
        </div>

        {/* Right Side: Results & Convergence Comparisons */}
        <div className="flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Optimization Outcomes</h4>
            
            {hasRun || isOptimizing ? (
              <div className="space-y-3.5">
                <div className="p-3 border border-border/50 rounded-lg bg-background/50 space-y-2">
                  <div className="flex justify-between text-xs border-b border-border/30 pb-1.5">
                    <span className="text-muted-foreground">Optimized \(\eta\):</span>
                    <span className="font-mono text-foreground font-semibold">{isOptimizing ? 'Tuning...' : optimizedLearningRate}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-border/30 pb-1.5">
                    <span className="text-muted-foreground">Optimized Batch:</span>
                    <span className="font-mono text-foreground font-semibold">{isOptimizing ? 'Tuning...' : `${optimizedBatchSize} slices`}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Optimized Epochs:</span>
                    <span className="font-mono text-foreground font-semibold">{isOptimizing ? 'Tuning...' : `${optimizedEpochs} runs`}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Classical Grid Search:</span>
                    <span className="text-foreground font-mono">1.2 hours (92.1% acc)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium text-primary">Quantum HPO:</span>
                    <span className="text-primary font-mono font-semibold">18.5 seconds (97.4% acc)</span>
                  </div>
                </div>

                {/* Energy Minimization Path Chart (Custom CSS/SVG representation) */}
                <div className="h-20 border border-border/50 rounded-lg bg-background/50 p-2 relative overflow-hidden flex items-end">
                  <span className="absolute top-1 left-1.5 text-[8px] text-muted-foreground font-mono">Loss Landscape Convergence</span>
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-rows-3 grid-cols-5 opacity-10 pointer-events-none">
                    <div className="border-b border-r border-foreground"></div>
                    <div className="border-b border-r border-foreground"></div>
                    <div className="border-b border-r border-foreground"></div>
                    <div className="border-b border-r border-foreground"></div>
                    <div className="border-b border-foreground"></div>
                    <div className="border-b border-r border-foreground"></div>
                    <div className="border-b border-r border-foreground"></div>
                    <div className="border-b border-r border-foreground"></div>
                    <div className="border-b border-r border-foreground"></div>
                    <div className="border-b border-foreground"></div>
                  </div>

                  <svg className="w-full h-16 overflow-visible" viewBox="0 0 100 40">
                    {/* Classical Path (red dotty line getting stuck) */}
                    <path
                      d="M0,5 L20,8 L25,25 L45,23 L55,30 L70,30 L90,28"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1"
                      strokeDasharray="1.5,1.5"
                      opacity="0.8"
                    />
                    {/* Quantum Path (blue smooth line reaching absolute bottom) */}
                    <path
                      d={isOptimizing 
                        ? `M0,5 L20,8 L40,${15 + Math.random() * 5} L60,${20 + Math.random() * 5} L80,${28 + Math.random() * 5}` 
                        : "M0,5 L20,8 L40,12 L60,25 L75,34 L90,37 L100,38"}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="1.5"
                      className="transition-all duration-300"
                    />
                    
                    {/* Labels */}
                    <circle cx="70" cy="30" r="1.5" fill="#ef4444" />
                    <text x="73" y="28" fill="#ef4444" fontSize="3" fontFamily="sans-serif">Classical Trap</text>
                    
                    <circle cx="95" cy="38" r="1.5" fill="var(--primary)" />
                    <text x="75" y="38" fill="var(--primary)" fontSize="3" fontFamily="sans-serif">Global Optima</text>
                  </svg>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-lg p-4 text-center">
                <Cpu className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <span className="text-xs text-muted-foreground">Quantum Optimizer inactive. Adjust parameters on the left and click "Run Optimization".</span>
              </div>
            )}
          </div>
          
          <div className="text-[10px] text-muted-foreground border-t border-border/50 pt-2.5 mt-4">
            * Utilizing simulated Quantum Annealing to navigate multi-dimensional loss topologies.
          </div>
        </div>
      </div>
    </div>
  )
}
