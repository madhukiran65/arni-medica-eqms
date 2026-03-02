import React from 'react'
import { usePermission } from '../../hooks/usePermission'

/**
 * PermissionGate — Conditionally renders children based on RBAC
 * 21 CFR Part 11 §11.10(g) — access limited to authorized individuals
 *
 * Usage:
 *   <PermissionGate permission="can_create_documents">
 *     <button>New Document</button>
 *   </PermissionGate>
 *
 *   <PermissionGate permissions={["can_approve_capa", "can_reject_capa"]} requireAll={false}>
 *     <ApprovalPanel />
 *   </PermissionGate>
 */
export default function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}) {
  const { can, canAny, canAll } = usePermission()

  let allowed = false

  if (permission) {
    allowed = can(permission)
  } else if (permissions && permissions.length > 0) {
    allowed = requireAll ? canAll(permissions) : canAny(permissions)
  } else {
    allowed = true // No permission specified = render always
  }

  return allowed ? <>{children}</> : fallback
}
