# Document API Reference

**Base URL:** `https://arni-medica-backend-production.up.railway.app/api/documents/` (or localhost equivalent)

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## Document CRUD Operations

### List Documents
**Endpoint:** `GET /documents/`
**Frontend Method:** `documentsAPI.list(params)`
**Authentication:** Required

**Query Parameters:**
- `page` (int) — Page number (default: 1)
- `search` (string) — Search by title, document_id
- `vault_state` (string) — Filter by status
- `ordering` (string) — Sort field

**Response:**
```json
{
  "count": 42,
  "next": "https://.../documents/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "document_id": "DOC-2026-001",
      "title": "QMS Procedure",
      "description": "Main procedure",
      "category": "procedure",
      "vault_state": "draft",
      "current_version": "1.0",
      "created_at": "2026-03-02T10:00:00Z",
      "updated_at": "2026-03-02T10:00:00Z"
    }
  ]
}
```

---

### Get Document Detail
**Endpoint:** `GET /documents/{id}/`
**Frontend Method:** `documentsAPI.get(id)`
**Authentication:** Required

**Path Parameters:**
- `id` (int) — Document ID

**Response:**
```json
{
  "id": 1,
  "document_id": "DOC-2026-001",
  "title": "QMS Procedure v2",
  "description": "Complete quality management procedure",
  "category": "procedure",
  "content_html": "<h2>Introduction</h2><p>...</p>",
  "vault_state": "draft",
  "current_version": "1.0",
  "review_cycle_days": 365,
  "effective_date": "2026-03-02",
  "owner_id": 5,
  "created_at": "2026-03-02T10:00:00Z",
  "updated_at": "2026-03-02T10:00:00Z",
  "created_by": {
    "id": 5,
    "username": "john.doe",
    "email": "john@company.com"
  },
  "updated_by": { /* user object */ }
}
```

---

### Create Document
**Endpoint:** `POST /documents/`
**Frontend Method:** `documentsAPI.create(data)`
**Authentication:** Required

**Request Body:**
```json
{
  "document_id": "DOC-2026-001",
  "title": "QMS Procedure",
  "description": "Brief description",
  "category": "procedure",
  "content_html": "<h2>Title</h2><p>Content...</p>",
  "effective_date": "2026-03-02",
  "review_cycle_days": 365
}
```

**Response:**
```json
{
  "id": 1,
  "document_id": "DOC-2026-001",
  "title": "QMS Procedure",
  "vault_state": "draft",
  "created_at": "2026-03-02T10:00:00Z",
  /* ... full object ... */
}
```

**Status Codes:**
- `201 Created` — Document created successfully
- `400 Bad Request` — Validation error (see detail for field errors)
- `401 Unauthorized` — No valid JWT token
- `403 Forbidden` — Insufficient permissions

---

### Update Document
**Endpoint:** `PATCH /documents/{id}/`
**Frontend Method:** `documentsAPI.update(id, data)`
**Authentication:** Required

**Path Parameters:**
- `id` (int) — Document ID

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "work_instruction",
  "content_html": "<h2>Updated</h2>...",
  "effective_date": "2026-04-01",
  "review_cycle_days": 730
}
```

**Response:**
```json
{
  "id": 1,
  "document_id": "DOC-2026-001",
  "title": "Updated Title",
  "updated_at": "2026-03-02T11:00:00Z",
  /* ... updated object ... */
}
```

**Status Codes:**
- `200 OK` — Update successful
- `400 Bad Request` — Validation error
- `401 Unauthorized` — No valid JWT token
- `403 Forbidden` — Insufficient permissions
- `404 Not Found` — Document doesn't exist

---

### Delete Document
**Endpoint:** `DELETE /documents/{id}/`
**Frontend Method:** `documentsAPI.delete(id)`
**Authentication:** Required

**Path Parameters:**
- `id` (int) — Document ID

**Response:** (No content)
- `204 No Content` — Delete successful

**Status Codes:**
- `204 No Content` — Document deleted
- `401 Unauthorized` — No valid JWT token
- `403 Forbidden` — Insufficient permissions (document may be approved)
- `404 Not Found` — Document doesn't exist

---

## Document Workflow Operations

### Submit for Review
**Endpoint:** `POST /documents/{id}/submit_for_review/`
**Frontend Method:** `documentsAPI.submitForReview(id, data)`
**Authentication:** Required (requires e-signature)

**Request Body:**
```json
{
  "password": "user_password",
  "meaning": "I certify this document is ready for review"
}
```

**Response:** Updated document object

---

### Approve Document
**Endpoint:** `POST /documents/{id}/approve/`
**Frontend Method:** `documentsAPI.approve(id, data)`
**Authentication:** Required (requires e-signature + approval permission)

**Request Body:**
```json
{
  "password": "approver_password",
  "meaning": "I approve this document"
}
```

**Response:** Updated document object with vault_state="approved"

---

### Final Approve
**Endpoint:** `POST /documents/{id}/final_approve/`
**Frontend Method:** `documentsAPI.finalApprove(id, data)`
**Authentication:** Required (QA/Final Approver role)

**Request Body:**
```json
{
  "password": "password",
  "meaning": "Final approval granted"
}
```

---

### Make Effective
**Endpoint:** `POST /documents/{id}/make_effective/`
**Frontend Method:** `documentsAPI.makeEffective(id, data)`
**Authentication:** Required (Administrator role)

**Request Body:**
```json
{
  "password": "password",
  "meaning": "Document is now effective"
}
```

---

### Make Obsolete
**Endpoint:** `POST /documents/{id}/make_obsolete/`
**Frontend Method:** `documentsAPI.makeObsolete(id, data)`
**Authentication:** Required (Administrator role)

---

## Document Checkout/Checkin

### Checkout Document
**Endpoint:** `POST /documents/{id}/checkout/`
**Frontend Method:** `documentsAPI.checkout(id)`
**Authentication:** Required

**Request Body:** (Optional)
```json
{
  "reason": "Edit procedure",
  "expected_checkin": "2026-03-05"
}
```

**Response:**
```json
{
  "id": 1,
  "checkout_user": { "id": 5, "username": "john.doe" },
  "checkout_reason": "Edit procedure",
  "checkout_date": "2026-03-02T10:00:00Z"
}
```

**Status Codes:**
- `200 OK` — Checkout successful
- `409 Conflict` — Document already checked out by another user

---

### Checkin Document
**Endpoint:** `POST /documents/{id}/checkin/`
**Frontend Method:** `documentsAPI.checkin(id, data)`
**Authentication:** Required (same user who checked out)

**Request Body:**
```json
{
  "comments": "Completed edits",
  "changes_made": "Updated section 3"
}
```

**Response:** Updated checkout status (checked in)

---

## Document Content Management

### Get Document Content
**Endpoint:** `GET /documents/{id}/content/`
**Frontend Method:** `documentsAPI.content(id)`
**Authentication:** Required

**Response:**
```json
{
  "id": 1,
  "content_html": "<h2>Full HTML content</h2>..."
}
```

---

### Update Document Content
**Endpoint:** `PUT /documents/{id}/content/`
**Frontend Method:** `documentsAPI.updateContent(id, data)`
**Authentication:** Required

**Request Body:**
```json
{
  "content_html": "<h2>Updated content</h2>..."
}
```

**Response:** Updated content object

---

## Document Utilities

### Get Available Transitions
**Endpoint:** `GET /documents/{id}/available_transitions/`
**Frontend Method:** `documentsAPI.availableTransitions(id)`
**Authentication:** Required

**Response:**
```json
{
  "current_state": "draft",
  "available_transitions": [
    {
      "action": "submit_for_review",
      "label": "Submit for Review",
      "requires_esig": true
    },
    {
      "action": "save_draft",
      "label": "Save Draft",
      "requires_esig": false
    }
  ]
}
```

---

### Get Comments
**Endpoint:** `GET /documents/{id}/comments/`
**Frontend Method:** `documentsAPI.comments(id)`
**Authentication:** Required

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "user": { "id": 5, "username": "john.doe" },
      "text": "Please review section 2",
      "created_at": "2026-03-02T10:00:00Z",
      "replies": []
    }
  ]
}
```

---

### Add Comment
**Endpoint:** `POST /documents/{id}/comments/`
**Frontend Method:** `documentsAPI.addComment(id, data)`
**Authentication:** Required

**Request Body:**
```json
{
  "text": "Comment text"
}
```

---

### Get Snapshots
**Endpoint:** `GET /documents/{id}/snapshots/`
**Frontend Method:** `documentsAPI.snapshots(id)`
**Authentication:** Required

**Response:**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "version": "1.0",
      "vault_state": "draft",
      "created_at": "2026-03-02T10:00:00Z",
      "created_by": { /* user */ }
    }
  ]
}
```

---

### Get Audit Trail
**Endpoint:** `GET /documents/{id}/audit_trail/`
**Frontend Method:** `documentsAPI.auditTrail(id)`
**Authentication:** Required

**Response:**
```json
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "user": { "id": 5, "username": "john.doe" },
      "action": "create",
      "timestamp": "2026-03-02T10:00:00Z",
      "old_values": null,
      "new_values": { /* created object */ }
    }
  ]
}
```

---

### Export Document
**Endpoint:** `GET /documents/{id}/export/{format}/`
**Frontend Method:** `documentsAPI.exportDoc(id, format)`
**Authentication:** Required

**Path Parameters:**
- `id` (int) — Document ID
- `format` (string) — "pdf", "docx", "html", "txt"

**Response:** Binary file (download)

---

## Statistics & Reporting

### Get Document Statistics
**Endpoint:** `GET /documents/document_stats/`
**Frontend Method:** `documentsAPI.stats()`
**Authentication:** Required

**Response:**
```json
{
  "total_documents": 42,
  "by_status": {
    "draft": 5,
    "submitted_for_review": 2,
    "approved": 10,
    "effective": 25
  },
  "by_category": {
    "procedure": 20,
    "work_instruction": 15,
    "form": 7
  },
  "due_for_review": 3
}
```

---

### Get Pending Review
**Endpoint:** `GET /documents/pending_review/`
**Frontend Method:** `documentsAPI.pendingReview()`
**Authentication:** Required

**Response:**
```json
{
  "count": 8,
  "results": [
    {
      "id": 1,
      "document_id": "DOC-2026-001",
      "title": "Document Title",
      "submitted_at": "2026-03-01T10:00:00Z",
      "submitted_by": { /* user */ }
    }
  ]
}
```

---

### Get My Checkouts
**Endpoint:** `GET /documents/my_checkouts/`
**Frontend Method:** `documentsAPI.myCheckouts()`
**Authentication:** Required

**Response:**
```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "document_id": "DOC-2026-001",
      "title": "Document Title",
      "checkout_date": "2026-03-02T10:00:00Z",
      "expected_checkin": "2026-03-05"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
**Validation Errors:**
```json
{
  "title": ["This field may not be blank."],
  "document_id": ["Document with this Document id already exists."],
  "content_html": ["This field may not be blank."]
}
```

---

### 401 Unauthorized
**Missing/Invalid Token:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### 403 Forbidden
**Insufficient Permissions:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

### 404 Not Found
**Resource Not Found:**
```json
{
  "detail": "Not found."
}
```

---

### 409 Conflict
**Conflict (e.g., already checked out):**
```json
{
  "detail": "Document is already checked out by another user."
}
```

---

## Request/Response Examples

### Example: Create Document with Rich Content
**Request:**
```bash
POST /api/documents/documents/ HTTP/1.1
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
  "document_id": "QMS-2026-001",
  "title": "Quality Management System Procedure",
  "description": "Main QMS procedure for all operations",
  "category": "procedure",
  "content_html": "<h2>1. Purpose</h2><p>This procedure establishes...</p><h2>2. Scope</h2><p>Applies to all operations...</p><h3>2.1 Inclusions</h3><ul><li>Item 1</li><li>Item 2</li></ul>",
  "effective_date": "2026-03-15",
  "review_cycle_days": 365
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "document_id": "QMS-2026-001",
  "title": "Quality Management System Procedure",
  "vault_state": "draft",
  "current_version": "1.0",
  "created_at": "2026-03-02T10:00:00Z"
}
```

---

### Example: Update Document
**Request:**
```bash
PATCH /api/documents/documents/1/ HTTP/1.1
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
  "title": "Quality Management System Procedure v2",
  "content_html": "<h2>1. Purpose</h2><p>Updated text...</p>"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "document_id": "QMS-2026-001",
  "title": "Quality Management System Procedure v2",
  "updated_at": "2026-03-02T11:00:00Z"
}
```

---

## Rate Limiting

- **Per minute:** 60 requests per minute per IP
- **Per hour:** 1000 requests per hour per IP
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Authentication

### Get JWT Token
**Endpoint:** `POST /api/auth/login/`

**Request:**
```json
{
  "username": "john.doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": { "id": 5, "username": "john.doe" }
}
```

### Token Refresh
**Endpoint:** `POST /api/auth/token/refresh/`

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## Notes

- All times are in UTC/ISO 8601 format
- HTML content is automatically sanitized on backend
- Large documents may take longer to process
- Concurrent edits (without checkout) may cause conflicts
- Always use HTTPS in production
- JWT tokens expire in 30 minutes (refresh token valid 7 days)

---

**Last Updated:** 2026-03-02
**API Version:** 1.0
**Status:** Production Ready
