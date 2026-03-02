import React from 'react'
import { AlertTriangle } from 'lucide-react'

export default function SessionTimeoutWarning({ onExtend, minutes = 2 }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-yellow-500/50 rounded-xl p-6 max-w-md mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <AlertTriangle className="text-yellow-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-white">Session Timeout Warning</h3>
        </div>
        <p className="text-slate-300 mb-4">
          Your session will expire in approximately {minutes} minutes due to inactivity.
          Per 21 CFR Part 11 requirements, inactive sessions are automatically terminated
          to protect system integrity.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onExtend}
            className="btn-primary px-6"
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  )
}
