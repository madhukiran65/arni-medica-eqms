// Module Pages - Import all page components for easy routing setup
export { default as LoginPage } from './Login'
export { default as DashboardPage } from './dashboard/Dashboard'
export { default as DocumentsPage } from './documents/Documents'
export { default as CapaPage } from './capa/Capa'
export { default as DeviationsPage } from './deviations/Deviations'
export { default as ChangeControlsPage } from './change-controls/ChangeControls'
export { default as ComplaintsPage } from './complaints/Complaints'
export { default as TrainingPage } from './training/Training'
export { default as AuditsPage } from './audits/Audits'
export { default as SuppliersPage } from './suppliers/Suppliers'
export { default as RiskPage } from './risk/Risk'
export { default as EquipmentPage } from './equipment/Equipment'
export { default as ProductionPage } from './production/Production'
export { default as AnalyticsPage } from './analytics/Analytics'
export { default as AdminPage } from './admin/Admin'

// Re-export all pages for convenient routing
export const pageRoutes = {
  login: { path: '/login', component: 'LoginPage' },
  dashboard: { path: '/dashboard', component: 'DashboardPage' },
  documents: { path: '/documents', component: 'DocumentsPage' },
  capa: { path: '/quality/capa', component: 'CapaPage' },
  deviations: { path: '/quality/deviations', component: 'DeviationsPage' },
  changeControls: { path: '/quality/change-controls', component: 'ChangeControlsPage' },
  complaints: { path: '/quality/complaints', component: 'ComplaintsPage' },
  training: { path: '/training', component: 'TrainingPage' },
  audits: { path: '/audits', component: 'AuditsPage' },
  suppliers: { path: '/suppliers', component: 'SuppliersPage' },
  risk: { path: '/risk', component: 'RiskPage' },
  equipment: { path: '/equipment', component: 'EquipmentPage' },
  production: { path: '/production', component: 'ProductionPage' },
  analytics: { path: '/analytics', component: 'AnalyticsPage' },
  admin: { path: '/admin', component: 'AdminPage' },
}
