import { useState } from 'react'
import { User, Plus, Trash2, Edit, Save, X, ShieldAlert } from 'lucide-react'

interface Doctor {
  id: string; // License ID: QS-XXXX-XXXX
  name: string;
  dept: string;
  email: string;
  phone: string;
  password: string;
}

interface AdminDashboardProps {
  doctors: Doctor[];
  onAddDoctor: (doc: Doctor) => void;
  onUpdateDoctor: (doc: Doctor) => void;
  onRemoveDoctor: (id: string) => void;
  onLogout: () => void;
}

export default function AdminDashboard({ 
  doctors, onAddDoctor, onUpdateDoctor, onRemoveDoctor, onLogout 
}: AdminDashboardProps) {
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Doctor form fields
  const [docName, setDocName] = useState('')
  const [docId, setDocId] = useState('')
  const [docDept, setDocDept] = useState('Oncological Radiology')
  const [docEmail, setDocEmail] = useState('')
  const [docPhone, setDocPhone] = useState('')
  const [docPassword, setDocPassword] = useState('')
  
  // Edit form fields
  const [editName, setEditName] = useState('')
  const [editDept, setEditDept] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editPassword, setEditPassword] = useState('')

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault()
    
    // License ID format validation (rough check)
    const formattedId = docId.trim().toUpperCase()
    if (!formattedId.startsWith('QS-')) {
      alert("Doctor License ID should start with 'QS-' (e.g., QS-2026-1001)")
      return
    }

    // Check if ID already exists
    if (doctors.some(d => d.id === formattedId)) {
      alert("A doctor with this License ID is already registered!")
      return
    }

    const newDoc: Doctor = {
      id: formattedId,
      name: docName,
      dept: docDept,
      email: docEmail,
      phone: docPhone,
      password: docPassword || 'password'
    }

    onAddDoctor(newDoc)
    
    // Reset form
    setDocName('')
    setDocId('')
    setDocEmail('')
    setDocPhone('')
    setDocPassword('')
    setShowAddForm(false)
  }

  const startEdit = (doc: Doctor) => {
    setEditingId(doc.id)
    setEditName(doc.name)
    setEditDept(doc.dept)
    setEditEmail(doc.email)
    setEditPhone(doc.phone)
    setEditPassword(doc.password)
  }

  const handleSaveEdit = (id: string) => {
    const updatedDoc: Doctor = {
      id,
      name: editName,
      dept: editDept,
      email: editEmail,
      phone: editPhone,
      password: editPassword
    }
    onUpdateDoctor(updatedDoc)
    setEditingId(null)
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            System Administration Portal
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage doctor credentials, departments, and software access privileges.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:opacity-90 flex items-center gap-1.5 transition duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddForm ? 'Hide Form' : 'Register New Doctor'}
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-2 border border-border hover:bg-muted text-muted-foreground text-xs font-semibold rounded-lg transition"
          >
            Log Out Portal
          </button>
        </div>
      </div>

      {/* Add Doctor Form */}
      {showAddForm && (
        <form onSubmit={handleAddDoctor} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 animate-slide-down">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Register Doctor Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-muted-foreground mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Dr. Alexander Fleming"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Medical License ID</label>
              <input
                type="text"
                placeholder="QS-1234-5678"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground font-mono"
                required
              />
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Format: must start with QS-</span>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Department</label>
              <select
                value={docDept}
                onChange={(e) => setDocDept(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="Oncological Radiology">Oncological Radiology</option>
                <option value="Neurology & MRI Center">Neurology & MRI Center</option>
                <option value="Pulmonary Medicine">Pulmonary Medicine</option>
                <option value="General Oncology">General Oncology</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-muted-foreground mb-1">Institutional Email</label>
              <input
                type="email"
                placeholder="a.fleming@quantumimaging.org"
                value={docEmail}
                onChange={(e) => setDocEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 012-3456"
                value={docPhone}
                onChange={(e) => setDocPhone(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground font-mono"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Console Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={docPassword}
                onChange={(e) => setDocPassword(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:opacity-90 transition"
          >
            Confirm Registration
          </button>
        </form>
      )}

      {/* Doctor List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-primary" />
            Active Clinical Staff Registry ({doctors.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider border-b border-border font-semibold">
              <tr>
                <th className="px-5 py-3.5">License ID</th>
                <th className="px-5 py-3.5">Doctor Name</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Phone</th>
                <th className="px-5 py-3.5">Password</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {doctors.map(doc => (
                <tr key={doc.id} className="hover:bg-muted/20 transition duration-150">
                  <td className="px-5 py-3 font-mono font-semibold text-primary">{doc.id}</td>
                  <td className="px-5 py-3">
                    {editingId === doc.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="p-1 border border-border bg-background rounded text-foreground font-bold"
                      />
                    ) : (
                      <span className="font-bold text-foreground">{doc.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === doc.id ? (
                      <select
                        value={editDept}
                        onChange={(e) => setEditDept(e.target.value)}
                        className="p-1 border border-border bg-background rounded text-foreground"
                      >
                        <option value="Oncological Radiology">Oncological Radiology</option>
                        <option value="Neurology & MRI Center">Neurology & MRI Center</option>
                        <option value="Pulmonary Medicine">Pulmonary Medicine</option>
                        <option value="General Oncology">General Oncology</option>
                      </select>
                    ) : (
                      <span className="text-muted-foreground">{doc.dept}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === doc.id ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="p-1 border border-border bg-background rounded text-foreground font-mono"
                      />
                    ) : (
                      <span className="text-muted-foreground font-mono">{doc.email}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === doc.id ? (
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="p-1 border border-border bg-background rounded text-foreground font-mono"
                      />
                    ) : (
                      <span className="text-muted-foreground font-mono">{doc.phone}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === doc.id ? (
                      <input
                        type="text"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="p-1 border border-border bg-background rounded text-foreground font-mono"
                      />
                    ) : (
                      <span className="text-muted-foreground font-mono">••••••••</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {editingId === doc.id ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleSaveEdit(doc.id)}
                          className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded transition"
                          title="Save changes"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-muted text-muted-foreground hover:bg-border rounded transition"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => startEdit(doc)}
                          className="p-1.5 bg-accent text-accent-foreground hover:opacity-90 rounded transition"
                          title="Edit doctor details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove Dr. ${doc.name}?`)) {
                              onRemoveDoctor(doc.id)
                            }
                          }}
                          className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded transition"
                          title="Delete doctor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
