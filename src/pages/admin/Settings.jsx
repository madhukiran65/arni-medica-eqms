import React, { useState } from 'react'
import { Save, Cog } from 'lucide-react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    companyName: 'Arni Medica',
    companyLogo: '',
    dateFormat: 'DD-MM-YYYY',
    timeZone: 'Asia/Kolkata',
    enableAuditTrail: true,
    enableElectronicSignature: true,
    maxSessionTimeout: 30,
    enableNotifications: true,
  })

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
        <p className="text-slate-400">Configure global system settings and preferences</p>
      </div>

      <div className="card p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
              className="input-field"
            >
              <option>DD-MM-YYYY</option>
              <option>MM-DD-YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Time Zone</label>
            <select
              value={settings.timeZone}
              onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
              className="input-field"
            >
              <option>Asia/Kolkata</option>
              <option>America/New_York</option>
              <option>Europe/London</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.maxSessionTimeout}
              onChange={(e) => setSettings({ ...settings, maxSessionTimeout: parseInt(e.target.value) })}
              className="input-field"
            />
          </div>

          <div className="space-y-3 border-t border-eqms-border pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAuditTrail}
                onChange={(e) => setSettings({ ...settings, enableAuditTrail: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-300">Enable Audit Trail</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableElectronicSignature}
                onChange={(e) => setSettings({ ...settings, enableElectronicSignature: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-300">Enable Electronic Signature</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-300">Enable Notifications</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-6 border-t border-eqms-border">
            <button className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save size={18} />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
