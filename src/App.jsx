import React, { useContext, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import useSessionTimeout from './hooks/useSessionTimeout'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import SessionTimeoutWarning from './components/common/SessionTimeoutWarning'
import Dashboard from './pages/dashboard/Dashboard'
import Documents from './pages/documents/Documents'
import DocumentForm from './pages/documents/DocumentForm'
import Capa from './pages/capa/Capa'
import Deviations from './pages/deviations/Deviations'
import ChangeControls from './pages/change-controls/ChangeControls'
import Complaints from './pages/complaints/Complaints'
import Training from './pages/training/Training'
import Audits from './pages/audits/Audits'
import Suppliers from './pages/suppliers/Suppliers'
import Risk from './pages/risk/Risk'
import Equipment from './pages/equipment/Equipment'
import Production from './pages/production/Production'
import Analytics from './pages/analytics/Analytics'
import Admin from './pages/admin/Admin'

// Detail pages (lazy-loaded for code splitting)
const CAPADetail = lazy(() => import('./pages/capa/CAPADetail'))
const DeviationDetail = lazy(() => import('./pages/deviations/DeviationDetail'))
const ComplaintDetail = lazy(() => import('./pages/complaints/ComplaintDetail'))
const AuditDetail = lazy(() => import('./pages/audits/AuditDetail'))
const DocumentCreate = lazy(() => import('./pages/documents/DocumentCreate'))

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

function LazyFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading module...</p>
      </div>
    </div>
  )
}

function SessionManager() {
  const { logout, isAuthenticated } = useContext(AuthContext)
  const { showWarning, extendSession } = useSessionTimeout(logout, isAuthenticated)
  if (!showWarning) return null
  return <SessionTimeoutWarning onExtend={extendSession} />
}

export default function App() {
  return (
    <>
    <SessionManager />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="documents" element={<Documents />} />
        <Route path="documents/create" element={<DocumentForm />} />
        <Route path="documents/create/new" element={<Suspense fallback={<LazyFallback />}><DocumentCreate /></Suspense>} />
        <Route path="documents/edit/:id" element={<DocumentForm />} />
        <Route path="capa" element={<Capa />} />
        <Route path="capa/:id" element={<Suspense fallback={<LazyFallback />}><CAPADetail /></Suspense>} />
        <Route path="deviations" element={<Deviations />} />
        <Route path="deviations/:id" element={<Suspense fallback={<LazyFallback />}><DeviationDetail /></Suspense>} />
        <Route path="change-controls" element={<ChangeControls />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="complaints/:id" element={<Suspense fallback={<LazyFallback />}><ComplaintDetail /></Suspense>} />
        <Route path="training" element={<Training />} />
        <Route path="audits" element={<Audits />} />
        <Route path="audits/:id" element={<Suspense fallback={<LazyFallback />}><AuditDetail /></Suspense>} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="risk" element={<Risk />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="production" element={<Production />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
