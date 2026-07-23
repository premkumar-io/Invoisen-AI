# Invoisen Backend API Documentation

This document describes the current Express API so another developer can continue backend, frontend, Postman, or integration work from the existing implementation.

## Developer Quick Start

- Runtime: Node.js + Express 5 + TypeScript.
- API base path: `/api/v1`.
- Default local server: `http://localhost:5000`.
- Database: MongoDB via Mongoose.
- Auth: short-lived bearer access token plus HTTP-only refresh cookie.
- Main route mount: `backend/src/routes/index.ts`.
- Validation: Zod schemas in `backend/src/modules/*/*.schema.ts`.
- Response helpers: `backend/src/utils/response.ts`.
- Error handler: `backend/src/middleware/errorHandler.ts`.

Run locally from `backend/`:

```bash
npm install
npm run dev
```

Copy `backend/.env.example` to `.env` and fill secrets before running.

## Global Conventions

### Success Response

```json
{
  "success": true,
  "data": {}
}
```

Paginated responses:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fields": {
      "email": ["Invalid email address"]
    }
  }
}
```

### Common Status Codes

| Code | Meaning | Current usage |
|---:|---|---|
| 200 | OK | Successful reads, updates, logout, refresh, delete-to-trash, restore, permanent delete messages |
| 201 | Created | Register, create invoice, submit contact |
| 400 | Bad Request | Zod validation failures, invalid invoice status transition |
| 401 | Unauthorized | Missing/invalid/expired bearer token, invalid login, invalid refresh token, invalid reset token |
| 403 | Forbidden | Admin-only route without admin role, free plan published invoice limit, self-demotion prevention |
| 404 | Not Found | Resource does not exist, does not belong to user, or is in the wrong trash state |
| 409 | Conflict | Duplicate registration email, profile email already in use |
| 423 | Locked | Account temporarily locked after repeated failed login attempts |
| 429 | Too Many Requests | Rate limit middleware can reject high request volume |
| 500 | Internal Server Error | Unexpected server errors |
| 503 | Service Unavailable | `/ready` when database is not connected |

### Auth Rules

Protected routes require:

```http
Authorization: Bearer <accessToken>
```

Public routes:

- `GET /`
- `GET /health`
- `GET /ready`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/contact`

Admin routes require a valid token for a user with `role: "admin"`.

## Business Workflows

### Approve / Publish Invoice

There is no separate `approve` endpoint yet. Approval is represented by changing invoice `status` to `published`.

Endpoint:

```http
PATCH /api/v1/invoices/{{invoiceId}}
```

Body:

```json
{
  "status": "published"
}
```

Scenarios:

| Scenario | Result |
|---|---|
| Draft invoice is approved | `200`, invoice status becomes `published` |
| Archived invoice is approved again | `200`, allowed transition to `published` |
| Free user already reached monthly published invoice limit | `403 FORBIDDEN` |
| Invalid invoice ID or invoice owned by another user | `404 NOT_FOUND` |
| Invalid status value | `400 VALIDATION_ERROR` |

Allowed invoice status transitions:

| From | To |
|---|---|
| `draft` | `published`, `archived` |
| `published` | `archived`, `draft` |
| `archived` | `draft`, `published` |

### Change / Update Invoice

Endpoint:

```http
PATCH /api/v1/invoices/{{invoiceId}}
```

Changeable fields:

- `clientInfo`
- `businessInfo`
- `items`
- `calculations`
- `customization`
- `invoiceDate`
- `dueDate`
- `status`

When `items` or `calculations` change, totals are recalculated server-side.

### Discard / Move Invoice to Trash

Endpoint:

```http
DELETE /api/v1/invoices/{{invoiceId}}
```

This is a soft delete. It sets `isDeleted: true` and `deletedAt`.

Success:

```json
{
  "success": true,
  "data": {
    "message": "Invoice moved to trash"
  }
}
```

Scenarios:

| Scenario | Result |
|---|---|
| Active invoice is discarded | `200`, moved to trash |
| Already discarded invoice is discarded again | `404 NOT_FOUND` because active-only filter is used |
| Invoice belongs to another user | `404 NOT_FOUND` |

### Restore Discarded Invoice

Endpoint:

```http
PATCH /api/v1/invoices/{{invoiceId}}/restore
```

Scenarios:

| Scenario | Result |
|---|---|
| Invoice is in trash | `200`, `isDeleted` becomes `false` |
| Invoice is not in trash | `404 NOT_FOUND` |

### Permanent Delete

Endpoint:

```http
DELETE /api/v1/invoices/{{invoiceId}}/permanent
```

Only discarded invoices can be permanently deleted.

Success:

```json
{
  "success": true,
  "data": {
    "message": "Invoice permanently deleted"
  }
}
```

### Contact Request Review

There is no separate `approve` endpoint for contacts. Admins change contact status.

Endpoint:

```http
PATCH /api/v1/admin/contacts/{{contactId}}
```

Body:

```json
{
  "status": "read"
}
```

Allowed statuses: `new`, `read`, `resolved`.

## Endpoint Reference

### Health

| Method | Path | Auth | Success | Errors |
|---|---|---|---:|---|
| GET | `/` | No | 200 | 500 |
| GET | `/health` | No | 200 | 500 |
| GET | `/ready` | No | 200 | 503, 500 |

### Auth

#### Register

```http
POST /api/v1/auth/register
```

Body:

```json
{
  "fullName": "Prem Kumar",
  "email": "prem@example.com",
  "password": "ChangeMe123!"
}
```

Status codes:

- `201`: User created, default settings created, refresh cookie set, access token returned.
- `400`: Invalid full name, email, or password.
- `409`: Email already registered.
- `429`: Auth rate limit.
- `500`: Unexpected server or email service error.

#### Login

```http
POST /api/v1/auth/login
```

Body:

```json
{
  "email": "prem@example.com",
  "password": "ChangeMe123!"
}
```

Status codes:

- `200`: Login successful, refresh cookie set, access token returned.
- `400`: Invalid body.
- `401`: Invalid email or password.
- `423`: Account temporarily locked after repeated failed attempts.
- `429`: Auth rate limit.
- `500`: Unexpected error.

#### Logout

```http
POST /api/v1/auth/logout
```

Status codes:

- `200`: Refresh token hash cleared and cookie removed.
- `401`: Missing, invalid, or expired bearer token.
- `429`: Auth/global rate limit.
- `500`: Unexpected error.

#### Refresh Token

```http
POST /api/v1/auth/refresh
```

Uses the refresh cookie.

Status codes:

- `200`: New access token returned and refresh cookie rotated.
- `401`: Refresh token missing, invalid, reused, or version mismatch.
- `429`: Auth rate limit.
- `500`: Unexpected error.

#### Forgot Password

```http
POST /api/v1/auth/forgot-password
```

Body:

```json
{
  "email": "prem@example.com"
}
```

Status codes:

- `200`: Always returns a generic success message when body is valid.
- `400`: Invalid email.
- `429`: Auth rate limit.
- `500`: Unexpected email or server error.

#### Reset Password

```http
POST /api/v1/auth/reset-password
```

Body:

```json
{
  "token": "{{resetToken}}",
  "password": "NewChangeMe123!"
}
```

Status codes:

- `200`: Password changed, old refresh tokens invalidated.
- `400`: Invalid body.
- `401`: Invalid or expired reset token.
- `429`: Auth rate limit.
- `500`: Unexpected error.

### Users

All user routes require bearer auth.

| Method | Path | Success | Notes |
|---|---|---:|---|
| GET | `/api/v1/users/me` | 200 | Returns safe profile |
| PATCH | `/api/v1/users/me` | 200 | Changes `fullName` and/or `email` |
| GET | `/api/v1/users/me/export` | 200 | Returns profile, settings, invoices, `exportedAt` |

Update profile body:

```json
{
  "fullName": "Prem Kumar",
  "email": "prem@example.com"
}
```

Possible errors:

- `400 VALIDATION_ERROR`: Invalid profile fields.
- `401 UNAUTHORIZED`, `TOKEN_EXPIRED`, `TOKEN_INVALID`: Auth failure.
- `404 NOT_FOUND`: User not found.
- `409 CONFLICT`: Email already in use.
- `500 INTERNAL_ERROR`: Unexpected error.

### Settings

All settings routes require bearer auth.

| Method | Path | Success | Notes |
|---|---|---:|---|
| GET | `/api/v1/settings` | 200 | Returns user settings |
| PATCH | `/api/v1/settings` | 200 | Updates theme, currency, prefix, business profile |

Update body:

```json
{
  "theme": "light",
  "defaultCurrency": "INR",
  "invoicePrefix": "INV",
  "businessProfile": {
    "name": "Invoisen Pvt Ltd",
    "logoUrl": "",
    "address": "Chennai, India",
    "email": "billing@Invoisen.com",
    "phone": "+91 9876543210",
    "gstNumber": "29ABCDE1234F1Z5"
  }
}
```

Possible errors:

- `400 VALIDATION_ERROR`: Invalid currency, prefix, URL, email, or length.
- `401`: Auth failure.
- `404`: Settings not found.
- `500`: Unexpected error.

### Invoices

All invoice routes require bearer auth and ownership. A valid Mongo ObjectId is required for `:id`; invalid IDs currently return `404`.

#### List Invoices

```http
GET /api/v1/invoices?page=1&limit=20&status=draft&search=&sort=-createdAt&trash=false
```

Query parameters:

| Name | Values | Default |
|---|---|---|
| `page` | integer >= 1 | `1` |
| `limit` | integer 1-100 | `20` |
| `status` | `draft`, `published`, `archived` | optional |
| `search` | max 100 chars | optional |
| `sort` | `invoiceDate`, `-invoiceDate`, `total`, `-total`, `createdAt`, `-createdAt` | `-createdAt` |
| `trash` | `true`, `false` | `false` |

Status codes: `200`, `400`, `401`, `500`.

#### Create Invoice

```http
POST /api/v1/invoices
```

Body:

```json
{
  "clientInfo": {
    "name": "Acme Client",
    "email": "client@example.com",
    "address": "42 Client Street, Bengaluru"
  },
  "businessInfo": {
    "name": "Invoisen Pvt Ltd",
    "logoUrl": "",
    "address": "Chennai, India",
    "email": "billing@Invoisen.com",
    "phone": "+91 9876543210",
    "gstNumber": "29ABCDE1234F1Z5"
  },
  "items": [
    {
      "name": "Website Design",
      "description": "Landing page and invoice dashboard UI",
      "quantity": 1,
      "rate": 25000
    }
  ],
  "calculations": {
    "taxType": "GST",
    "taxRate": 18,
    "discount": 1000
  },
  "customization": {
    "fontFamily": "Inter",
    "fontSize": 14,
    "themeColor": "#2563eb",
    "backgroundColor": "#ffffff",
    "signatureDataUrl": "",
    "currency": "INR",
    "templateId": "modern"
  },
  "invoiceDate": "2026-06-22",
  "dueDate": "2026-07-07",
  "status": "draft"
}
```

Status codes:

- `201`: Invoice created.
- `400`: Invalid body.
- `401`: Auth failure.
- `403`: Free plan limit reached if creating directly as `published`.
- `500`: Unexpected error.

#### Get Invoice

```http
GET /api/v1/invoices/{{invoiceId}}
```

Status codes: `200`, `401`, `404`, `500`.

#### Update Invoice / Change / Approve

```http
PATCH /api/v1/invoices/{{invoiceId}}
```

Body may include any create fields as partial values. Use `status: "published"` to approve/publish.

Status codes:

- `200`: Invoice updated.
- `400`: Invalid body or invalid status transition.
- `401`: Auth failure.
- `403`: Free plan publish limit reached.
- `404`: Invoice not found, not owned by user, deleted, or invalid ID.
- `500`: Unexpected error.

#### Download PDF

```http
GET /api/v1/invoices/{{invoiceId}}/pdf
```

Status codes:

- `200`: Returns `application/pdf`.
- `401`: Auth failure.
- `404`: Invoice not found.
- `500`: PDF generation or unexpected error.

#### Discard / Restore / Permanent Delete

| Method | Path | Success | Behavior |
|---|---|---:|---|
| DELETE | `/api/v1/invoices/{{invoiceId}}` | 200 | Soft delete; move to trash |
| PATCH | `/api/v1/invoices/{{invoiceId}}/restore` | 200 | Restore from trash |
| DELETE | `/api/v1/invoices/{{invoiceId}}/permanent` | 200 | Permanently delete trashed invoice |

Possible errors: `401`, `404`, `500`.

### Contact

Public contact submission is rate limited.

```http
POST /api/v1/contact
```

Body:

```json
{
  "name": "Prem Kumar",
  "email": "prem@example.com",
  "subject": "Need help with invoice setup",
  "message": "I need help configuring invoice templates and GST settings for my account."
}
```

Status codes:

- `201`: Contact request created with status `new`.
- `400`: Invalid body.
- `429`: Contact rate limit.
- `500`: Unexpected error.

### Dashboard

```http
GET /api/v1/dashboard/stats
```

Requires bearer auth.

Status codes:

- `200`: Dashboard stats returned.
- `401`: Auth failure.
- `500`: Unexpected error.

### Admin

All admin routes require bearer auth plus `role: "admin"`.

#### List Users

```http
GET /api/v1/admin/users?page=1&limit=20&search=
```

Status codes: `200`, `400`, `401`, `403`, `500`.

#### Change User Role or Plan

```http
PATCH /api/v1/admin/users/{{userId}}
```

Body:

```json
{
  "role": "admin",
  "plan": "pro"
}
```

Status codes:

- `200`: User changed.
- `400`: Invalid body or ID.
- `401`: Auth failure.
- `403`: Not admin, or admin attempted self-demotion to `user`.
- `404`: User not found.
- `500`: Unexpected error.

#### Analytics

```http
GET /api/v1/admin/analytics
```

Returns user, invoice, and pending contact counts.

Status codes: `200`, `401`, `403`, `500`.

#### List Contacts

```http
GET /api/v1/admin/contacts?page=1&limit=20&status=new
```

Status values: `new`, `read`, `resolved`.

Status codes: `200`, `400`, `401`, `403`, `500`.

#### Change Contact Status

```http
PATCH /api/v1/admin/contacts/{{contactId}}
```

Body:

```json
{
  "status": "read"
}
```

Status codes:

- `200`: Contact status changed.
- `400`: Invalid body or ID.
- `401`: Auth failure.
- `403`: Not admin.
- `404`: Contact request not found.
- `500`: Unexpected error.

## Data Models

### User

Public/safe fields:

- `_id`
- `fullName`
- `email`
- `role`: `user`, `admin`
- `plan`: `free`, `pro`, `enterprise`
- `createdAt`
- `updatedAt`

Private fields:

- `password`
- `refreshTokenHash`
- `refreshTokenVersion`
- `failedLoginAttempts`
- `lockUntil`

### Invoice

Key fields:

- `_id`
- `userId`
- `invoiceNumber`
- `status`: `draft`, `published`, `archived`
- `isDeleted`
- `deletedAt`
- `businessInfo`
- `clientInfo`
- `items`
- `calculations`
- `customization`
- `invoiceDate`
- `dueDate`
- `createdAt`
- `updatedAt`

Invoice numbers are generated per user as `{invoicePrefix}-{0001}`.

### Settings

- `theme`
- `defaultCurrency`: `USD`, `INR`, `EUR`, `GBP`, `AUD`, `CAD`
- `invoicePrefix`
- `businessProfile`

### Contact Request

- `name`
- `email`
- `subject`
- `message`
- `status`: `new`, `read`, `resolved`
- `createdAt`
- `updatedAt`

## Known Gaps / Recommended Next Documentation

- Add an OpenAPI 3.1 file so docs, Postman, mocks, SDKs, and tests can be generated from one contract.
- Add response examples for every endpoint after the frontend response needs stabilize.
- Add authentication sequence diagrams for login, refresh rotation, logout, and reset password.
- Add environment documentation for email, PDF generation, CORS, and production deployment.
- Add test data and seed credentials for local development.
- Add changelog or API version history once frontend integration begins.
