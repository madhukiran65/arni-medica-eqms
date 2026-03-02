import React, { useState, useEffect, useContext } from 'react'
import { Plus, Search, Shield, Building2, Users, Lock, Settings, Sun, Moon } from 'lucide-react'
import { usersAPI } from '../../api'
import { ThemeContext } from '../../contexts/ThemeContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'

export default function Admin() {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateUser, setShowCreateUser] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [uRes, rRes, dRes] = await Promise.allSettled([
        usersAPI.profiles?.list?.(),
        usersAPI.roles?.list?.(),
        usersAPI.departments?.list?.(),
      ])
      if (uRes.status === 'fulfilled' && uRes.value) {
        setUsers(uRes.value.data?.results || uRes.value.data || [])
      } else if (uRes.status === 'rejected') {
        console.error('Failed to load users:', uRes.reason)
      }
      if (rRes.status === 'fulfilled' && rRes.value) {
        setRoles(rRes.value.data?.results || rRes.value.data || [])
      } else if (rRes.status === 'rejected') {
        console.error('Failed to load roles:', rRes.reason)
      }
      if (dRes.status === 'fulfilled' && dRes.value) {
        setDepartments(dRes.value.data?.results || dRes.value.data || [])
      } else if (dRes.status === 'rejected') {
        console.error('Failed to load departments:', dRes.reason)
      }
    } catch (err) {
      console.error('Failed to load admin data:', err)
      setError(err.message || 'Failed to load administration data')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (formData) => {
    try {
      await usersAPI.profiles?.register?.(formData)
      setShowCreateUser(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Registration failed')
    }
  }

  if (loading) return <LoadingSpinner message="Loading administration..." />

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-heading)' }}>Administration</h1>
        <p style={{ color: 'var(--text-secondary)' }}>User management, roles, departments, and system configuration</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchData} className="text-red-300 hover:text-red-200 underline ml-4">Retry</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 pb-3 overflow-x-auto" style={{ borderBottom: '1px solid var(--border-color)' }}>
        {[
          { id: 'users', icon: Users, label: 'Users' },
          { id: 'roles', icon: Shield, label: 'Roles' },
          { id: 'departments', icon: Building2, label: 'Departments' },
          { id: 'settings', icon: Settings, label: 'System Settings' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              tab === t.id
                ? 'bg-blue-500/10 text-blue-400'
                : ''
            }`}
            style={tab !== t.id ? { color: 'var(--text-secondary)' } : {}}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>User Directory</h2>
            <button
              onClick={() => setShowCreateUser(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} /> Register User
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--table-header-bg)' }}>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Name</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Username</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Email</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Employee ID</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Department</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="transition" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>{u.first_name} {u.last_name}</td>
                      <td className="py-3 px-4 font-mono text-blue-400">{u.username}</td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{u.employee_id}</td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{u.department?.name || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          u.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {tab === 'roles' && (
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-heading)' }}>Role Management</h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--table-header-bg)' }}>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Role</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Description</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.id} className="transition" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="py-3 px-4 font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Shield size={14} className="text-blue-400" />
                        {r.name}
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{r.description || '—'}</td>
                      <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {Object.entries(r)
                          .filter(([k, v]) => k.startsWith('can_') && v)
                          .map(([k]) => k.replace('can_', '').replace(/_/g, ' ').toUpperCase())
                          .join(', ') || 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {tab === 'departments' && (
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-heading)' }}>Department Directory</h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--table-header-bg)' }}>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Department</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Description</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => (
                    <tr key={d.id} className="transition" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="py-3 px-4 font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Building2 size={14} className="text-purple-400" />
                        {d.name}
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{d.description || '—'}</td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{d.created_at?.slice(0,10) || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {tab === 'settings' && <SystemSettings />}

      {/* Register User Modal */}
      <Modal isOpen={showCreateUser} onClose={() => setShowCreateUser(false)} title="Register New User" size="lg">
        <RegisterUserForm onSubmit={handleRegister} onCancel={() => setShowCreateUser(false)} />
      </Modal>
    </div>
  )
}

function SystemSettings() {
  const { isDark, setTheme } = useContext(ThemeContext)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-heading)' }}>System Settings</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Configure application appearance and preferences</p>
      </div>

      {/* Appearance Section */}
      <div className="card p-6">
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-heading)' }}>Appearance</h3>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Select your preferred background theme</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          {/* Dark Mode Card */}
          <button
            onClick={() => setTheme('dark')}
            className={`relative rounded-xl p-4 text-left transition-all duration-200 ${
              isDark
                ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20'
                : ''
            }`}
            style={{
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-input)',
              border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-color)'}`
            }}
          >
            {isDark && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#0B0F1A] border border-[#1F2A40] flex items-center justify-center">
                <Moon size={18} className="text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Dark Mode</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Easier on the eyes</div>
              </div>
            </div>
            {/* Mini preview */}
            <div className="rounded-lg overflow-hidden border border-[#1F2A40]">
              <div className="h-3 bg-[#0F172A] flex items-center px-1.5 gap-0.5">
                <div className="w-1 h-1 rounded-full bg-red-400" />
                <div className="w-1 h-1 rounded-full bg-yellow-400" />
                <div className="w-1 h-1 rounded-full bg-green-400" />
              </div>
              <div className="flex h-12">
                <div className="w-8 bg-[#0F172A] border-r border-[#1F2A40]" />
                <div className="flex-1 bg-[#0B0F1A] p-1.5">
                  <div className="h-1.5 w-8 bg-[#1F2A40] rounded mb-1" />
                  <div className="h-1 w-12 bg-[#1F2A40] rounded mb-0.5" />
                  <div className="h-1 w-10 bg-[#1F2A40] rounded" />
                </div>
              </div>
            </div>
          </button>

          {/* Light Mode Card */}
          <button
            onClick={() => setTheme('light')}
            className={`relative rounded-xl p-4 text-left transition-all duration-200 ${
              !isDark
                ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20'
                : ''
            }`}
            style={{
              backgroundColor: !isDark ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-input)',
              border: `1px solid ${!isDark ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-color)'}`
            }}
          >
            {!isDark && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                <Sun size={18} className="text-amber-500" />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Light Mode</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Classic white background</div>
              </div>
            </div>
            {/* Mini preview */}
            <div className="rounded-lg overflow-hidden border border-slate-200">
              <div className="h-3 bg-white flex items-center px-1.5 gap-0.5">
                <div className="w-1 h-1 rounded-full bg-red-400" />
                <div className="w-1 h-1 rounded-full bg-yellow-400" />
                <div className="w-1 h-1 rounded-full bg-green-400" />
              </div>
              <div className="flex h-12">
                <div className="w-8 bg-white border-r border-slate-200" />
                <div className="flex-1 bg-slate-50 p-1.5">
                  <div className="h-1.5 w-8 bg-slate-200 rounded mb-1" />
                  <div className="h-1 w-12 bg-slate-200 rounded mb-0.5" />
                  <div className="h-1 w-10 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Session Settings */}
      <div className="card p-6">
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-heading)' }}>Session & Security</h3>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>21 CFR Part 11 session management</p>
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Session Timeout</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Auto-logout after inactivity (21 CFR 11.10(d))</div>
            </div>
            <div className="text-sm font-semibold text-blue-400">30 minutes</div>
          </div>
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Max Failed Login Attempts</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Account lockout threshold</div>
            </div>
            <div className="text-sm font-semibold text-blue-400">5 attempts</div>
          </div>
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Lockout Duration</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Time before account unlocks</div>
            </div>
            <div className="text-sm font-semibold text-blue-400">15 minutes</div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Electronic Signatures</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Required for workflow transitions</div>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-green-500/20 text-green-400">Enabled</span>
          </div>
        </div>
      </div>

      {/* Compliance Info */}
      <div className="card p-6">
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-heading)' }}>Regulatory Compliance</h3>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Standards this system complies with</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'FDA 21 CFR Part 11', desc: 'Electronic Records' },
            { label: 'FDA 21 CFR 820', desc: 'Quality System Reg' },
            { label: 'ISO 13485:2016', desc: 'Medical Device QMS' },
            { label: 'EU IVDR 2017/746', desc: 'In Vitro Diagnostics' },
            { label: 'ISO 14971', desc: 'Risk Management' },
            { label: 'CDSCO MDR 2017', desc: 'India Regulations' },
            { label: 'ALCOA+', desc: 'Data Integrity' },
            { label: 'GAMP 5', desc: 'Software Validation' },
          ].map((std, i) => (
            <div key={i} className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
              <div className="text-xs font-semibold text-blue-400">{std.label}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{std.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RegisterUserForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    employee_id: '',
    password: ''
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSubmit(form) }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>First Name</label>
          <input
            value={form.first_name}
            onChange={e => set('first_name', e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Last Name</label>
          <input
            value={form.last_name}
            onChange={e => set('last_name', e.target.value)}
            className="input-field"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
        <input
          value={form.username}
          onChange={e => set('username', e.target.value)}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
        <input
          value={form.email}
          onChange={e => set('email', e.target.value)}
          type="email"
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Employee ID</label>
        <input
          value={form.employee_id}
          onChange={e => set('employee_id', e.target.value)}
          className="input-field"
          placeholder="EMP-001"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
        <input
          value={form.password}
          onChange={e => set('password', e.target.value)}
          type="password"
          className="input-field"
          required
          minLength={8}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Lock size={16} /> Register User
        </button>
      </div>
    </form>
  )
}
