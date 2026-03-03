/**
 * ValidationDocs — Validation Documentation
 * ISO 13485 §7.5.6 / 21 CFR 820.75 / EU IVDR Annex II
 * Covers: IQ/OQ/PQ protocols, validation master plans, CSV, method validation,
 * process validation reports, cleaning validation, transport validation.
 */
import React from 'react'
import { ClipboardCheck } from 'lucide-react'
import DocumentTypeList from './DocumentTypeList'

const VALIDATION_COLUMNS = [
  {
    header: 'Validation Type',
    field: 'custom_fields',
    render: (doc) => {
      const vtype = doc.custom_fields?.validation_type || doc.abbreviation
      const types = {
        'IQ': 'Installation Qualification',
        'OQ': 'Operational Qualification',
        'PQ': 'Performance Qualification',
        'VMP': 'Validation Master Plan',
        'CSV': 'Computer System Validation',
        'MV': 'Method Validation',
        'PV': 'Process Validation',
        'CV': 'Cleaning Validation',
      }
      return types[vtype] || vtype || doc.category?.replace(/_/g, ' ') || '-'
    }
  },
  {
    header: 'Equipment/System',
    field: 'subject_keywords',
    render: (doc) => {
      const kw = doc.subject_keywords || doc.custom_fields?.system_name
      if (Array.isArray(kw)) return kw.join(', ')
      return kw || '-'
    }
  },
]

const VALIDATION_STATS = [
  {
    label: 'Total Validation Docs',
    getValue: (docs) => docs.length || 0,
  },
  {
    label: 'Approved/Effective',
    getValue: (docs) => docs.filter(d => ['effective', 'released'].includes(d.vault_state)).length || 0,
  },
  {
    label: 'Pending Approval',
    getValue: (docs) => docs.filter(d => ['in_review', 'review_validation', 'sign_off'].includes(d.vault_state)).length || 0,
  },
  {
    label: 'Draft',
    getValue: (docs) => docs.filter(d => d.vault_state === 'draft').length || 0,
  },
]

export default function ValidationDocs() {
  return (
    <DocumentTypeList
      title="Validation Documents"
      subtitle="ISO 13485 §7.5.6 / 21 CFR 820.75 — IQ/OQ/PQ protocols, validation master plans, process & method validation"
      infocardType="VAL"
      infocardTypeName="Validation Documentation"
      icon={ClipboardCheck}
      columns={VALIDATION_COLUMNS}
      statsCards={VALIDATION_STATS}
      emptyTitle="No Validation Documents"
      emptyMessage="Create validation protocols (IQ/OQ/PQ), master plans, or process validation reports to meet ISO 13485 §7.5.6 and 21 CFR 820.75."
    />
  )
}
