# Invoizmo - Invoice Generator SaaS
## Product Requirements Document (PRD)

**Version:** 1.0  
**Product Type:** SaaS Web Application  
**Product Name:** Invoizmo  
**Target Market:** Freelancers, Agencies, Consultants, Startups, Small Businesses

---

# 1. Product Vision

## Problem Statement

Businesses and freelancers often create invoices manually using spreadsheets or document editors, resulting in:

- Time-consuming workflows
- Calculation errors
- Inconsistent branding
- Poor invoice tracking
- Lack of invoice history management

## Solution

Invoizmo enables users to create, customize, manage, and download professional invoices quickly through a modern SaaS platform.

---

# 2. Brand Identity

## Brand Name

**Invoizmo**

### Brand Meaning

Invoice + Modern + Automation

### Brand Values

- Professional
- Fast
- Reliable
- Modern
- Business-Friendly

---

# 3. Logo Requirements

Create logo concepts using Brandmark.io.

## Variation 1 - Modern Minimal

- Clean invoice icon
- Letter "I" integration
- SaaS style

## Variation 2 - AI Invoice

- Invoice sheet
- Automation-inspired design
- Futuristic appearance

## Variation 3 - Purple Premium

- Elegant typography
- Purple SaaS branding
- Financial technology feel

## Variation 4 - Abstract Professional

- Geometric shapes
- Document-inspired logo
- Scalable icon system

---

# 4. Design System

## Theme 1 - Light

- Primary: #2563EB
- Secondary: #3B82F6
- Background: #FFFFFF
- Card: #F8FAFC

## Theme 2 - Dark

- Primary: #60A5FA
- Background: #0F172A
- Card: #1E293B
- Text: #FFFFFF

## Theme 3 - Purple SaaS

- Primary: #7C3AED
- Secondary: #8B5CF6
- Background: #F8F5FF

## Theme 4 - Premium Black

- Primary: #111827
- Accent: #F59E0B
- Background: #000000

---

# 5. User Personas

## Freelancer

### Goals

- Create invoices quickly
- Download professional PDFs
- Maintain invoice history

### Pain Points

- Manual invoice creation
- Time-consuming edits

---

## Agency Owner

### Goals

- Manage multiple invoices
- Professional branding

### Pain Points

- Invoice inconsistency
- Client management issues

---

## Small Business Owner

### Goals

- GST compliant invoices
- Organized records

### Pain Points

- Tax calculations
- Record keeping

---

# 6. User Roles

## User

Permissions:

- Create invoice
- Edit invoice
- Delete invoice
- Restore invoice
- Download invoice
- Manage profile

## Admin

Permissions:

- Manage users
- View analytics
- Manage subscriptions
- Manage templates
- Monitor invoices
- Manage contact requests

---

# 7. User Flow

Visitor

→ Landing Page

→ Signup/Login

→ Dashboard

→ Create Invoice

→ Select Template

→ Customize Invoice

→ Save Draft

→ Publish Invoice

→ Download PDF

→ Archive

---

# 8. Website Pages

## Home

### Sections

- Header
- Hero
- Features
- Benefits
- Testimonials
- Footer

### Hero CTA

- Get Started Free
- View Pricing

---

## About

### Sections

- Company Mission
- Why Invoizmo
- Product Vision
- Future Roadmap

---

## Contact Us

### Fields

- Name
- Email
- Subject
- Message

---

## Privacy Policy

### Sections

- Data Collection
- Cookies
- Data Security
- User Rights

---

## Pricing

### Free Plan

- 10 invoices/month
- Basic templates
- PDF download

### Pro Plan ($6/month)

- Unlimited invoices
- Premium templates
- Priority support
- Multi-currency

### Enterprise Plan

- Custom pricing
- White-label
- Team access
- Dedicated support

---

# 9. Authentication

## Email Authentication

Features:

- Signup
- Login
- Logout
- Forgot Password
- Reset Password

---

# 10. Dashboard

## Dashboard Widgets

- Total Invoices
- Draft Invoices
- Published Invoices
- Archived Invoices

## Recent Invoices Table

Columns:

- Invoice Number
- Client Name
- Amount
- Status
- Date

---

# 11. Invoice Module

## Create Invoice

### Business Details

- Business Name
- Logo
- Address
- Email
- Phone
- GST Number

### Client Details

- Client Name
- Email
- Address

### Invoice Details

- Invoice Number
- Invoice Date
- Due Date

### Invoice Items

- Item Name
- Description
- Quantity
- Rate
- Amount

### Calculations

- Subtotal
- Tax
- Discount
- Total

---

# 12. Invoice Status System

## Draft

Invoice is being prepared.

## Published

Invoice finalized and downloadable.

## Archived

Stored for future reference.

---

# 13. Invoice Templates

### Template 1

Modern

### Template 2

Corporate

### Template 3

Minimal

### Template 4

Creative

---

# 14. Invoice Customization

## Typography

- Font Family
- Font Size

## Colors

- Theme Color
- Background Color

## Signature

Canvas Signature Pad

Features:

- Draw
- Clear
- Save

## Currency Support

- USD
- INR
- EUR
- GBP
- AUD
- CAD

## Tax Support

- GST
- VAT
- Sales Tax
- Custom Tax

---

# 15. Invoice Numbering

Automatic invoice numbering.

Example:

- INV-0001
- INV-0002
- INV-0003

---

# 16. Invoice History

## Features

- Search
- Sort
- Filter

### Filters

- Draft
- Published
- Archived

---

# 17. Trash Management

Deleted invoices move to Trash.

Retention Period:

30 Days

Actions:

- Restore
- Permanent Delete

---

# 18. PDF Export

Features:

- A4 Format
- Download PDF
- Print Invoice

---

# 19. Notifications

Email Notifications:

- Welcome Email
- Password Reset
- Subscription Confirmation

---

# 20. Database Design

## Users Collection

```json
{
  "_id": "",
  "fullName": "",
  "email": "",
  "password": "",
  "role": "",
  "plan": ""
}
```

## Invoices Collection

```json
{
  "_id": "",
  "userId": "",
  "invoiceNumber": "",
  "clientInfo": {},
  "items": [],
  "total": 0,
  "status": ""
}
```

## Settings Collection

```json
{
  "_id": "",
  "userId": "",
  "theme": "",
  "defaultCurrency": "",
  "invoicePrefix": ""
}
```

## Subscription Collection

```json
{
  "_id": "",
  "userId": "",
  "plan": "",
  "status": ""
}
```

---

# 21. API Endpoints

## Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

POST /api/auth/forgot-password

POST /api/auth/reset-password

## Invoice

GET /api/invoices

POST /api/invoices

GET /api/invoices/:id

PATCH /api/invoices/:id

DELETE /api/invoices/:id

PATCH /api/invoices/:id/restore

DELETE /api/invoices/:id/permanent

## User

GET /api/users/profile

PATCH /api/users/profile

## Contact

POST /api/contact

---

# 22. Analytics Dashboard

## Revenue Metrics

- Monthly Revenue
- Yearly Revenue

## User Metrics

- Active Users
- New Registrations

## Invoice Metrics

- Total Invoices
- Published Invoices
- Archived Invoices

---

# 23. Tech Stack

## Frontend

- Next.js
- React
- Tailwind CSS
- ShadCN UI
- React Hook Form
- Zod

## Backend

- Node.js
- Express.js
- JWT Authentication
- Nodemailer

## Database

- MongoDB Atlas
- Mongoose

## Deployment

### Frontend

- Vercel

### Backend

- Railway / Render

### Database

- MongoDB Atlas

---

# 24. Roadmap

## Phase 1 - MVP

- Authentication
- Dashboard
- Invoice Creation
- Templates
- PDF Export
- Invoice History
- Pricing Page

## Phase 2

- Razorpay Integration
- Subscription Management
- Analytics Dashboard

## Phase 3

- Stripe Integration
- Recurring Invoices
- Team Collaboration

## Phase 4

- AI Invoice Generator
- AI Tax Suggestions
- Revenue Insights

---

# 25. Success Metrics

## Month 1

- 100 Users
- 500 Invoices Generated

## Month 3

- 500 Users
- 3000 Invoices Generated

## Month 6

- 2000 Users
- 15000 Invoices Generated

## Revenue Goals

### Month 3

- 20 Paid Users

### Month 6

- 100 Paid Users

### Month 12

- $1000+ MRR

---

# 26. Tech Stack

## Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- ShadCN UI
- React Hook Form
- TanStack Query
- Zod

## Backend

- Node.js
- Express.js
- TypeScript
- JWT Authentication
- Nodemailer

## Database

- MongoDB Atlas
- Mongoose

## Authentication

- Email-Based Authentication
- JWT Access Token
- Refresh Token

---

# 27. MVP Scope

### Included in Version 1.0

- User Authentication
- Dashboard
- Invoice Generator
- Invoice Templates
- Invoice Customization
- PDF Download
- Invoice History
- Trash Recovery
- Pricing Page
- Contact Page
- Privacy Policy
- Multi Currency Support
- Auto Invoice Numbering

---

**Document Version:** 1.0  
**Product:** Invoizmo SaaS  
**Prepared For:** Product Development & Engineering Team