# Form Validation Quick Start Guide

**Frontend Location:** `/arni-medica-eqms-frontend/`
**Validation Directory:** `src/validation/schemas.js`
**Components:** `src/components/common/FormField.jsx`, `ValidatedInput.jsx`, `ValidatedForm.jsx`

---

## 1. Use an Existing Schema

If a schema already exists for your form, use it directly:

```jsx
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { capaCreateSchema } from '../../validation/schemas'

export default function CreateCapaPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(capaCreateSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data) => {
    await capaAPI.create(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Title" error={errors.title?.message} required>
        <input {...register('title')} className="input-field" placeholder="Enter title" />
      </FormField>

      <FormField label="Description" error={errors.description?.message} required>
        <textarea {...register('description')} className="input-field" rows={4} />
      </FormField>

      <button type="submit">Create</button>
    </form>
  )
}
```

---

## 2. Create a New Schema

If your form is new, add a schema to `src/validation/schemas.js`:

```javascript
// src/validation/schemas.js
export const myNewSchema = yup.object({
  field1: yup.string().required('Field1 is required').min(3).max(100),
  field2: yup.string().email('Invalid email'),
  field3: yup.number().required('Number required').min(0).max(100),
  field4: yup.date().required('Date required'),
})
```

**Rules:**
- `.required()` — mandatory field
- `.min(N)` / `.max(N)` — length or numeric bounds
- `.email()` — email format validation
- `.oneOf(['a', 'b'])` — enum validation
- `.trim()` — remove leading/trailing spaces

---

## 3. Use ValidatedInput (Simplest)

Pre-integrated inputs that auto-connect to form context:

```jsx
import { ValidatedInput, ValidatedSelect, ValidatedDate } from '../../components/common/ValidatedInput'
import ValidatedForm from '../../components/common/ValidatedForm'
import { myNewSchema } from '../../validation/schemas'

export default function MyForm() {
  return (
    <ValidatedForm schema={myNewSchema} defaultValues={{}} onSubmit={handleSubmit}>
      <ValidatedInput
        name="username"
        label="Username"
        type="text"
        required
        placeholder="Enter username"
      />

      <ValidatedSelect
        name="department"
        label="Department"
        required
        options={[
          { value: 'qa', label: 'QA' },
          { value: 'ops', label: 'Operations' },
        ]}
      />

      <ValidatedDate
        name="start_date"
        label="Start Date"
        required
      />

      <button type="submit">Submit</button>
    </ValidatedForm>
  )
}
```

**Advantages:**
- No manual `register()` needed
- Automatic error display
- Consistent styling
- Less boilerplate

---

## 4. Use FormField (More Control)

Manual `register()` with custom styling:

```jsx
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import FormField from '../../components/common/FormField'
import { myNewSchema } from '../../validation/schemas'

export default function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(myNewSchema),
    mode: 'onBlur',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Title" error={errors.title?.message} required helpText="Min 3 chars">
        <input
          {...register('title')}
          className={`input-field ${errors.title ? 'border-red-500' : ''}`}
          placeholder="Enter title"
        />
      </FormField>

      <button type="submit">Submit</button>
    </form>
  )
}
```

---

## 5. Rich Text Editor (Controller)

Non-standard inputs need `Controller`:

```jsx
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import RichTextEditor from '../../components/common/RichTextEditor'
import FormField from '../../components/common/FormField'
import { capaCreateSchema } from '../../validation/schemas'

export default function MyForm() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(capaCreateSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Description" error={errors.description?.message} required>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Enter description..."
              minHeight="200px"
            />
          )}
        />
      </FormField>

      <button type="submit">Submit</button>
    </form>
  )
}
```

---

## 6. Date Range Validation

Ensure end date > start date:

```javascript
// In schemas.js
export const myDateSchema = yup.object({
  start_date: yup.date().required('Start date required'),
  end_date: yup.date()
    .required('End date required')
    .min(yup.ref('start_date'), 'End date must be after start date'),
})
```

---

## 7. E-Signature Dialog

For approval workflows (21 CFR Part 11):

```jsx
import ESignatureDialog from '../../components/common/ESignatureDialog'

export default function ApproveButton() {
  const [showSignDialog, setShowSignDialog] = useState(false)

  const handleApprove = async (password, meaning) => {
    await documentsAPI.approve(docId, { password, meaning })
    setShowSignDialog(false)
  }

  return (
    <>
      <button onClick={() => setShowSignDialog(true)}>Approve</button>

      <ESignatureDialog
        isOpen={showSignDialog}
        onClose={() => setShowSignDialog(false)}
        onSign={handleApprove}
        title="Approve Document"
        description="Enter your password to electronically sign"
      />
    </>
  )
}
```

---

## 8. Server Error Display

Handle API validation errors:

```jsx
const [serverError, setServerError] = useState('')

const onSubmit = async (data) => {
  try {
    await API.create(data)
  } catch (err) {
    setServerError(err.response?.data?.detail || 'Failed to create')
  }
}

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    {serverError && (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 mb-4">
        {serverError}
      </div>
    )}
    {/* form fields */}
  </form>
)
```

---

## Available Schemas Reference

| Schema | Fields | Min/Max | Enums |
|--------|--------|---------|-------|
| `loginSchema` | username, password | 2/6 char | — |
| `eSignatureSchema` | password, signing_meaning, comment | — | approval, rejection, review, authorship, verification |
| `documentCreateSchema` | title, document_type, description | 3/255 | — |
| `capaCreateSchema` | title, description, priority, source | 5/255 | low, medium, high, critical |
| `capaInvestigationSchema` | investigation_summary, root_cause_category, investigation_method | 50 char | — |
| `deviationCreateSchema` | title, description, deviation_type, department | 5/20 char | minor, major, critical |
| `changeControlCreateSchema` | title, description, change_type, justification | 5/20 char | — |
| `complaintCreateSchema` | title, description, complaint_source, product, severity | 5/20 char | low, medium, high, critical |
| `auditCreateSchema` | title, audit_type, scope, start_date, end_date | — | (end > start) |
| `trainingCourseSchema` | title, description, training_type, duration_hours | 3 char | — |
| `supplierCreateSchema` | name, supplier_type, contact_email, contact_phone | 2 char | — |
| `riskAssessmentSchema` | title, description, risk_category, product | 5 char | — |
| `equipmentCreateSchema` | name, equipment_type, serial_number, location | — | — |
| `batchRecordSchema` | batch_number, product, planned_quantity, planned_start_date | — | (positive qty) |
| `transitionSchema` | action, comment | — | — |

---

## Error Display Patterns

### Single Field Error
```jsx
<FormField label="Title" error={errors.title?.message} required>
  <input {...register('title')} className="input-field" />
</FormField>
```

### Optional Help Text
```jsx
<FormField
  label="Email"
  error={errors.email?.message}
  helpText="We'll never share your email"
>
  <input {...register('email')} className="input-field" />
</FormField>
```

### Inline Conditional Styling
```jsx
<input
  {...register('field')}
  className={`input-field ${errors.field ? 'border-red-500/50' : ''}`}
/>
```

### All Form Errors (Server Response)
```jsx
{serverError && (
  <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-red-400 text-sm mb-4">
    {serverError}
  </div>
)}
```

---

## Testing Your Form

### Test 1: Validation Works
```
1. Type short text in required field
2. Tab/blur to trigger validation
3. See error message appear
```

### Test 2: Form Won't Submit Invalid Data
```
1. Fill title with 1 char (below min 5)
2. Click Submit
3. Form should not submit, error displayed
4. Button should not be disabled (just validation fails)
```

### Test 3: Form Submits Valid Data
```
1. Fill all required fields correctly
2. Click Submit
3. Loading state appears
4. API call executes
5. Modal closes or redirect happens
```

### Test 4: Server Errors Display
```
1. Submit valid form with duplicate data
2. Server returns 400/validation error
3. serverError state updates
4. Error banner appears at top of form
```

---

## Common Issues & Fixes

### Issue: Validation not triggering
**Check:** `resolver: yupResolver(schema)` is set in `useForm()`

### Issue: Error not displaying
**Check:** Using optional chaining `errors.field?.message` (not `errors.field.message`)

### Issue: Form context undefined in child
**Check:** Child component is wrapped in `<ValidatedForm>` or `<FormProvider>`

### Issue: Controller not working with RichTextEditor
**Check:** Using `Controller` component with `control` prop and `field.value`/`field.onChange`

### Issue: Custom input won't validate
**Fix:** Use `Controller` for non-standard inputs (anything that's not `<input>` or `<textarea>`)

---

## Compliance Notes

- **21 CFR Part 11 §11.10(b):** All form fields validated at entry
- **21 CFR Part 11 §11.200(a):** E-signature dialog captures meaning
- **21 CFR Part 11 §11.50:** Signature includes signer identity, timestamp, meaning
- **ISO 13485:** Data validation before API submission
- **ALCOA+:** Audit trail captures form changes

---

## Next Steps

1. **Review existing schemas** → `src/validation/schemas.js`
2. **Pick a form component style** → ValidatedForm (simplest) or FormField (control)
3. **Add form to your page** → Import schema, use useForm/ValidatedForm
4. **Test validation** → Blur fields, submit invalid data
5. **Test API integration** → Submit valid data, check response handling

---

## Resources

- **React Hook Form Docs:** https://react-hook-form.com/
- **Yup Docs:** https://github.com/jquense/yup
- **Examples in Codebase:** Check `Login.jsx`, `Capa.jsx`, `Complaints.jsx`
- **Full Guide:** `FORM_VALIDATION_SUMMARY.md`

