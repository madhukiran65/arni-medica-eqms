import toast from 'react-hot-toast'

/**
 * Toast notification helpers for eQMS
 * Consistent messaging across all modules
 */

export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message || 'An error occurred. Please try again.'),
  info: (message) => toast(message, { icon: 'ℹ️' }),
  warning: (message) => toast(message, { icon: '⚠️', style: { borderColor: '#f59e0b' } }),

  // Common CRUD messages
  created: (entity) => toast.success(`${entity} created successfully`),
  updated: (entity) => toast.success(`${entity} updated successfully`),
  deleted: (entity) => toast.success(`${entity} deleted successfully`),
  saved: (entity) => toast.success(`${entity} saved successfully`),

  // Workflow messages
  submitted: (entity) => toast.success(`${entity} submitted for review`),
  approved: (entity) => toast.success(`${entity} approved successfully`),
  rejected: (entity) => toast.success(`${entity} has been rejected`),
  transitioned: (entity, newStatus) => toast.success(`${entity} moved to ${newStatus}`),

  // E-signature messages
  signed: () => toast.success('Electronic signature verified and recorded'),
  signFailed: () => toast.error('Electronic signature verification failed'),

  // Error messages
  loadError: (entity) => toast.error(`Failed to load ${entity}. Please refresh.`),
  saveError: (entity) => toast.error(`Failed to save ${entity}. Please try again.`),
  permissionDenied: () => toast.error('You do not have permission to perform this action.'),
  sessionExpired: () => toast.error('Your session has expired. Please log in again.'),

  // API error handler
  apiError: (error) => {
    const message = error?.response?.data?.detail
      || error?.response?.data?.message
      || error?.message
      || 'An unexpected error occurred'
    toast.error(message)
  },

  // Promise-based toast (for async operations)
  promise: (promise, messages = {}) => toast.promise(promise, {
    loading: messages.loading || 'Processing...',
    success: messages.success || 'Done!',
    error: messages.error || 'Something went wrong',
  }),
}
