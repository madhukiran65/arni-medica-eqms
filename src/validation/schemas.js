import * as yup from 'yup'

// === LOGIN ===
export const loginSchema = yup.object({
  username: yup.string().trim().required('Username is required').min(2, 'Username must be at least 2 characters'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
})

// === E-SIGNATURE (§11.50, §11.200(a)) ===
export const eSignatureSchema = yup.object({
  password: yup.string().required('Password is required for electronic signature').min(6, 'Password must be at least 6 characters'),
  signing_meaning: yup.string().required('Signing reason is required per 21 CFR Part 11 §11.50').oneOf(['approval', 'rejection', 'review', 'authorship', 'verification'], 'Invalid signing reason'),
  comment: yup.string().max(2000, 'Comment cannot exceed 2000 characters'),
})

// === DOCUMENT (§11.10(f)) ===
export const documentCreateSchema = yup.object({
  title: yup.string().trim().required('Document title is required').min(3, 'Title must be at least 3 characters').max(255, 'Title cannot exceed 255 characters'),
  document_type: yup.string().required('Document type is required'),
  description: yup.string().max(5000, 'Description cannot exceed 5000 characters'),
})

// === CAPA — Phase-gated validation ===
export const capaCreateSchema = yup.object({
  title: yup.string().trim().required('Title is required').min(5, 'Title must be at least 5 characters').max(255, 'Title cannot exceed 255 characters'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
  priority: yup.string().required('Priority is required').oneOf(['low', 'medium', 'high', 'critical'], 'Invalid priority'),
  source: yup.string(),
})

export const capaInvestigationSchema = yup.object({
  investigation_summary: yup.string().required('Investigation summary is required').min(50, 'Summary must be at least 50 characters'),
  root_cause_category: yup.string().required('Root cause category is required'),
  investigation_method: yup.string().required('Investigation method is required'),
})

// === DEVIATION ===
export const deviationCreateSchema = yup.object({
  title: yup.string().trim().required('Title is required').min(5, 'Title must be at least 5 characters'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
  deviation_type: yup.string().required('Deviation type is required').oneOf(['minor', 'major', 'critical'], 'Invalid deviation type'),
  department: yup.string().required('Department is required'),
  discovery_date: yup.date().required('Discovery date is required').max(new Date(), 'Discovery date cannot be in the future'),
})

// === CHANGE CONTROL ===
export const changeControlCreateSchema = yup.object({
  title: yup.string().trim().required('Title is required').min(5, 'Title must be at least 5 characters'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
  change_type: yup.string().required('Change type is required'),
  justification: yup.string().required('Justification is required').min(20, 'Justification must be at least 20 characters'),
})

// === COMPLAINT ===
export const complaintCreateSchema = yup.object({
  title: yup.string().trim().required('Title is required').min(5, 'Title must be at least 5 characters'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
  complaint_source: yup.string().required('Complaint source is required'),
  product: yup.string().required('Product is required'),
  severity: yup.string().required('Severity is required').oneOf(['low', 'medium', 'high', 'critical'], 'Invalid severity'),
  received_date: yup.date().required('Received date is required').max(new Date(), 'Date cannot be in the future'),
})

// === AUDIT ===
export const auditCreateSchema = yup.object({
  title: yup.string().trim().required('Title is required').min(5, 'Title must be at least 5 characters'),
  audit_type: yup.string().required('Audit type is required'),
  scope: yup.string().required('Scope is required'),
  planned_start_date: yup.date().required('Start date is required'),
  planned_end_date: yup.date().required('End date is required').min(yup.ref('planned_start_date'), 'End date must be after start date'),
})

// === TRAINING ===
export const trainingCourseSchema = yup.object({
  title: yup.string().trim().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required'),
  training_type: yup.string().required('Training type is required'),
  duration_hours: yup.number().positive('Duration must be positive').required('Duration is required'),
})

// === SUPPLIER ===
export const supplierCreateSchema = yup.object({
  name: yup.string().trim().required('Supplier name is required').min(2, 'Name must be at least 2 characters'),
  supplier_type: yup.string().required('Supplier type is required'),
  contact_email: yup.string().email('Invalid email address'),
  contact_phone: yup.string(),
})

// === RISK ASSESSMENT ===
export const riskAssessmentSchema = yup.object({
  title: yup.string().trim().required('Title is required').min(5, 'Title must be at least 5 characters'),
  description: yup.string().required('Description is required'),
  risk_category: yup.string().required('Risk category is required'),
  product: yup.string(),
})

// === EQUIPMENT ===
export const equipmentCreateSchema = yup.object({
  name: yup.string().trim().required('Equipment name is required'),
  equipment_type: yup.string().required('Equipment type is required'),
  serial_number: yup.string().required('Serial number is required'),
  location: yup.string().required('Location is required'),
})

// === BATCH RECORD ===
export const batchRecordSchema = yup.object({
  batch_number: yup.string().trim().required('Batch number is required'),
  product: yup.string().required('Product is required'),
  planned_quantity: yup.number().positive('Quantity must be positive').required('Planned quantity is required'),
  planned_start_date: yup.date().required('Start date is required'),
})

// === WORKFLOW TRANSITION (generic) ===
export const transitionSchema = yup.object({
  action: yup.string().required('Action is required'),
  comment: yup.string().max(2000, 'Comment cannot exceed 2000 characters'),
})
