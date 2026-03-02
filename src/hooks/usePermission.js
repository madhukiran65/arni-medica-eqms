import { useContext, useMemo } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { hasPermission, hasAnyPermission, hasAllPermissions, getAllowedModules } from '../utils/rbac'

/**
 * RBAC hook — 21 CFR Part 11 §11.10(g)
 * Use in components to check permissions before rendering actions
 *
 * Usage:
 *   const { can, canAny, allowedModules } = usePermission()
 *   if (can('can_create_documents')) { ... }
 */
export function usePermission() {
  const { user } = useContext(AuthContext)

  const helpers = useMemo(() => ({
    can: (permission) => hasPermission(user, permission),
    canAny: (permissions) => hasAnyPermission(user, permissions),
    canAll: (permissions) => hasAllPermissions(user, permissions),
    allowedModules: getAllowedModules(user),
    isAdmin: user?.is_superuser || user?.role === 'admin',
    role: user?.role || null,
  }), [user])

  return helpers
}
