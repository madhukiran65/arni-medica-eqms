export const MODULE_NAMES = {
  DASHBOARD: 'Dashboard',
  DOCUMENTS: 'Document Control',
  CAPA: 'CAPA',
  DEVIATIONS: 'Deviations',
  CHANGE_CONTROL: 'Change Control',
  COMPLAINTS: 'Complaints/PMS',
  TRAINING: 'Training',
  AUDITS: 'Audits & Regulatory',
  SUPPLIERS: 'Suppliers',
  RISK_DESIGN: 'Risk & Design',
  EQUIPMENT: 'Equipment',
  PRODUCTION: 'Production & QA',
  ANALYTICS: 'Analytics',
  ADMIN: 'Administration',
}

export const STATUS_COLORS = {
  approved: { bg: 'bg-green-500/10', text: 'text-green-400' },
  in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400' },
  draft: { bg: 'bg-slate-500/10', text: 'text-slate-300' },
}

export const API_ENDPOINTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  DOCUMENTS: '/documents',
  CAPA: '/quality-events/capa',
  DEVIATIONS: '/quality-events/deviations',
  CHANGE_CONTROL: '/quality-events/change-control',
  COMPLAINTS: '/complaints',
  TRAINING: '/training',
  AUDITS: '/audits',
  SUPPLIERS: '/suppliers',
  RISK: '/risk',
  EQUIPMENT: '/equipment',
  PRODUCTION: '/production',
}
