/**
 * RBAC Utility — 21 CFR Part 11 §11.10(g)
 * Role-based access control for frontend enforcement
 */

// Permission definitions by module
export const PERMISSIONS = {
  documents: {
    view: 'can_view_documents',
    create: 'can_create_documents',
    edit: 'can_edit_documents',
    approve: 'can_approve_documents',
    reject: 'can_reject_documents',
    delete: 'can_delete_documents',
  },
  capa: {
    view: 'can_view_capa',
    create: 'can_create_capa',
    edit: 'can_edit_capa',
    approve: 'can_approve_capa',
    reject: 'can_reject_capa',
  },
  deviations: {
    view: 'can_view_deviations',
    create: 'can_create_deviations',
    edit: 'can_edit_deviations',
    approve: 'can_approve_deviations',
  },
  change_controls: {
    view: 'can_view_change_controls',
    create: 'can_create_change_controls',
    edit: 'can_edit_change_controls',
    approve: 'can_approve_change_controls',
  },
  complaints: {
    view: 'can_view_complaints',
    create: 'can_create_complaints',
    edit: 'can_edit_complaints',
    approve: 'can_approve_complaints',
  },
  training: {
    view: 'can_view_training',
    create: 'can_create_training',
    edit: 'can_edit_training',
    approve: 'can_approve_training',
  },
  audits: {
    view: 'can_view_audits',
    create: 'can_create_audits',
    edit: 'can_edit_audits',
    approve: 'can_approve_audits',
  },
  suppliers: {
    view: 'can_view_suppliers',
    create: 'can_create_suppliers',
    edit: 'can_edit_suppliers',
    approve: 'can_approve_suppliers',
  },
  risk: {
    view: 'can_view_risk',
    create: 'can_create_risk',
    edit: 'can_edit_risk',
  },
  equipment: {
    view: 'can_view_equipment',
    create: 'can_create_equipment',
    edit: 'can_edit_equipment',
  },
  production: {
    view: 'can_view_production',
    create: 'can_create_production',
    edit: 'can_edit_production',
  },
  admin: {
    view: 'can_view_admin',
    manage_users: 'can_manage_users',
    manage_roles: 'can_manage_roles',
    manage_settings: 'can_manage_settings',
  },
}

// Role-to-permission mappings (fallback if backend doesn't provide permissions)
export const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS).flatMap(m => Object.values(m)),
  qa_manager: [
    ...Object.values(PERMISSIONS.documents),
    ...Object.values(PERMISSIONS.capa),
    ...Object.values(PERMISSIONS.deviations),
    ...Object.values(PERMISSIONS.change_controls),
    ...Object.values(PERMISSIONS.complaints),
    ...Object.values(PERMISSIONS.training),
    ...Object.values(PERMISSIONS.audits),
    ...Object.values(PERMISSIONS.suppliers),
    ...Object.values(PERMISSIONS.risk),
    ...Object.values(PERMISSIONS.equipment),
    ...Object.values(PERMISSIONS.production),
  ],
  qa_engineer: [
    PERMISSIONS.documents.view, PERMISSIONS.documents.create, PERMISSIONS.documents.edit,
    PERMISSIONS.capa.view, PERMISSIONS.capa.create, PERMISSIONS.capa.edit,
    PERMISSIONS.deviations.view, PERMISSIONS.deviations.create, PERMISSIONS.deviations.edit,
    PERMISSIONS.complaints.view, PERMISSIONS.complaints.create,
    PERMISSIONS.training.view,
    PERMISSIONS.audits.view,
    PERMISSIONS.equipment.view, PERMISSIONS.equipment.create,
    PERMISSIONS.production.view, PERMISSIONS.production.create,
  ],
  doc_controller: [
    ...Object.values(PERMISSIONS.documents),
    PERMISSIONS.training.view,
    PERMISSIONS.change_controls.view,
  ],
  auditor: [
    PERMISSIONS.documents.view,
    PERMISSIONS.capa.view,
    PERMISSIONS.deviations.view,
    PERMISSIONS.complaints.view,
    ...Object.values(PERMISSIONS.audits),
    PERMISSIONS.training.view,
    PERMISSIONS.suppliers.view,
  ],
  viewer: Object.values(PERMISSIONS).flatMap(m => m.view ? [m.view] : []),
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user, permission) {
  if (!user) return false
  // Superuser/admin always has all permissions
  if (user.is_superuser || user.role === 'admin') return true
  // Check user permissions from backend
  const userPermissions = user.permissions || ROLE_PERMISSIONS[user.role] || []
  return userPermissions.includes(permission)
}

/**
 * Check if user has ANY of the given permissions
 */
export function hasAnyPermission(user, permissions) {
  if (!user) return false
  if (user.is_superuser || user.role === 'admin') return true
  return permissions.some(p => hasPermission(user, p))
}

/**
 * Check if user has ALL of the given permissions
 */
export function hasAllPermissions(user, permissions) {
  if (!user) return false
  if (user.is_superuser || user.role === 'admin') return true
  return permissions.every(p => hasPermission(user, p))
}

/**
 * Get allowed modules for a user (for sidebar rendering)
 */
export function getAllowedModules(user) {
  if (!user) return []
  if (user.is_superuser || user.role === 'admin') {
    return Object.keys(PERMISSIONS)
  }
  return Object.keys(PERMISSIONS).filter(module => {
    const viewPerm = PERMISSIONS[module]?.view
    return viewPerm ? hasPermission(user, viewPerm) : false
  })
}
