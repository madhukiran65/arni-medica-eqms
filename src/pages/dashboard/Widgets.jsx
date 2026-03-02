import React, { useState } from 'react'
import { Plus, GripVertical, Trash2, Settings, Sliders } from 'lucide-react'

export default function CustomizableWidgets() {
  const [widgets, setWidgets] = useState([
    { id: 1, name: 'Quality Events', icon: 'AlertTriangle', visible: true },
    { id: 2, name: 'CAPA Status', icon: 'CheckCircle', visible: true },
    { id: 3, name: 'Compliance Calendar', icon: 'Calendar', visible: true },
    { id: 4, name: 'KPI Metrics', icon: 'BarChart3', visible: true },
    { id: 5, name: 'Recent Audits', icon: 'Shield', visible: true },
  ])

  const toggleWidget = (id) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w))
  }

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id))
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customizable Dashboard Widgets</h1>
          <p className="text-slate-400">Configure which widgets appear on your dashboard</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Widget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {widgets.map((widget) => (
          <div key={widget.id} className="card p-6 flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <button className="p-2 cursor-grab active:cursor-grabbing">
                <GripVertical size={20} className="text-slate-500" />
              </button>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-2">{widget.name}</h3>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={widget.visible}
                      onChange={() => toggleWidget(widget.id)}
                      className="rounded"
                    />
                    Visible
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded hover:bg-slate-700 transition">
                <Settings size={18} className="text-slate-400 hover:text-slate-300" />
              </button>
              <button
                onClick={() => removeWidget(widget.id)}
                className="p-2 rounded hover:bg-red-500/10 transition"
              >
                <Trash2 size={18} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card p-6">
        <h3 className="text-lg font-medium mb-4">Available Widgets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Quality Metrics', 'Supplier Health', 'Training Status', 'Validation Schedule', 'Document Changes', 'Risk Heatmap'].map((item, i) => (
            <div key={i} className="p-4 border border-eqms-border rounded-lg hover:bg-slate-800/50 transition cursor-pointer">
              <p className="text-sm font-medium text-slate-300 mb-2">{item}</p>
              <button className="btn-sm btn-primary">Add</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
