# Architecture.md

# INVOISEN System Architecture

## Overview

INVOISEN is a modern AI-powered Invoice Generator SaaS built with a
decoupled frontend and backend architecture.

    Browser
       │
    React + TypeScript + Vite
       │
    TanStack Query
       │ HTTPS
    Express.js REST API
       │
    Business Services
       │
    MongoDB

## High-Level Architecture

``` mermaid
flowchart LR
    U[User]
    F[Frontend<br/>React + Vite]
    A[REST API<br/>Express + TypeScript]
    AU[Authentication]
    INV[Invoice Service]
    CLI[Client Service]
    REP[Reports]
    AI[AI Services]
    PDF[PDF Generator]
    DB[(MongoDB)]
    RES[Resend Email]
    CLO[Cloudinary]
    PAY[Stripe / Razorpay]

    U --> F
    F --> A
    A --> AU
    A --> INV
    A --> CLI
    A --> REP
    A --> AI
    INV --> PDF
    INV --> DB
    CLI --> DB
    REP --> DB
    AU --> DB
    PDF --> RES
    INV --> CLO
    INV --> PAY
```

# Frontend

-   React 19
-   TypeScript
-   Vite
-   Tailwind CSS
-   TanStack Router
-   TanStack Query
-   Radix UI
-   shadcn/ui
-   Framer Motion

## Layers

1.  Pages
2.  Layouts
3.  Feature Modules
4.  Shared Components
5.  API Layer
6.  Authentication
7.  State Management

Suggested structure:

``` text
src/
 ├── app
 ├── routes
 ├── layouts
 ├── features
 │    ├── auth
 │    ├── dashboard
 │    ├── invoices
 │    ├── clients
 │    ├── reports
 │    ├── settings
 │    └── admin
 ├── components
 ├── hooks
 ├── lib
 ├── services
 └── types
```

# Backend

Tech: - Node.js - Express - TypeScript - MongoDB - Mongoose - JWT - Zod

Suggested structure:

``` text
backend/
 ├── src
 │   ├── config
 │   ├── middleware
 │   ├── modules
 │   ├── services
 │   ├── routes
 │   ├── utils
 │   ├── types
 │   └── server.ts
```

## Core Modules

-   Authentication
-   Users
-   Clients
-   Invoices
-   Dashboard
-   Reports
-   Payments
-   Settings
-   Admin
-   Contact
-   Notifications

## Request Flow

``` mermaid
sequenceDiagram
Browser->>Frontend: Action
Frontend->>API: HTTP Request
API->>Middleware: Validate/Auth
Middleware->>Controller: Pass
Controller->>Service: Business Logic
Service->>MongoDB: Read/Write
MongoDB-->>Service: Result
Service-->>Controller: Response
Controller-->>Frontend: JSON
Frontend-->>Browser: UI Update
```

# Database

Collections:

-   users
-   invoices
-   clients
-   invoiceTemplates
-   subscriptions
-   payments
-   settings
-   contacts
-   notifications

# Authentication

-   Email/Password
-   JWT Access Token
-   Refresh Token
-   RBAC
-   Protected Routes

# AI Layer

-   AI Invoice Generator
-   AI Product Description
-   AI Tax Suggestions
-   AI Client Autofill
-   Business Insights

# External Services

-   Resend (Email)
-   Cloudinary (Assets)
-   Puppeteer (PDF)
-   Stripe/Razorpay (Billing)

# Security

-   Helmet
-   CORS
-   Rate Limiting
-   Zod Validation
-   Secure Cookies
-   Password Hashing
-   Audit Logging

# Deployment

Frontend: - Vercel

Backend: - Render / Railway

Database: - MongoDB Atlas

# Scalability

-   Modular architecture
-   REST APIs
-   Feature-based frontend
-   Service-oriented backend
-   Horizontal scaling ready
-   CDN for assets
-   Background jobs
-   Caching layer ready

# Engineering Rules

-   Keep frontend and backend independent.
-   Version APIs.
-   Validate every request.
-   Document API changes.
-   Maintain API documentation and Postman collection whenever endpoints
    change.
