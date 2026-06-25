# Malo - Visitor Verification for Residential Properties

> A multi-tenant, full-stack visitor verification platform for hostels, apartment complexes, and residential properties. Residents generate QR passes for their visitors, security staff verify them at the gate, and property admins manage the entire operation from a dedicated portal.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Fully%20Typed-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)

---

## Demo

https://www.loom.com/share/202d7252a8864fed9cad0cd42dd49113

> Covers the full visitor pass flow — resident generates a QR pass, visitor presents it at the gate, security staff scans or enters the code to verify entry.

---

## Live Demo

All three portals run on a single deployment:

| Portal | URL |
|---|---|
| Resident Portal | https://hostel-management-system-reeq.vercel.app/login |
| Security Portal | https://hostel-management-system-reeq.vercel.app/security/login |
| Admin Portal | https://hostel-management-system-reeq.vercel.app/admin/login |

---

## Demo Credentials

### Admin (Managing Staff)
- **Email:** chungumuloshi5086@gmail.com
- **Password:** yourpassword

### Resident
- **Email:** testresident@gmail.com
- **Password:** yourpassword

### Security Staff
Security staff accounts are created by the admin. Login uses **name + passkey** (not email), at the Security Portal above.

---

## Problem & Solution

Residential properties — hostels, apartments, and gated communities — have no reliable way to verify visitors beyond a manual sign-in book. This creates security gaps, no audit trail, and no way for residents to pre-authorise guests.

Malo solves this with a resident-initiated QR pass system: residents generate a pass for their visitor, the visitor presents it at the gate, and security staff scan or enter the code to verify entry. The platform is multi-tenant — a single deployment serves multiple independent properties, each with fully isolated data enforced at the database layer via Row Level Security.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database & Auth | Supabase (Postgres + Auth + Row Level Security) |
| Server-side Auth | `@supabase/ssr` — cookie-based session management |
| Styling | Tailwind CSS v4, Framer Motion |
| QR Scanning | `html5-qrcode` — live camera QR verification |
| Deployment | Vercel (single deployment, all portals) |

---

## Key Engineering Decisions

- **Supabase RLS for multi-tenancy** — Every table has a `property_id` column. Row Level Security policies enforce that authenticated users can only read and write records belonging to their own property. No application-layer filtering needed — the database rejects cross-property access outright.

- **Single Next.js app, three portals** — Route groups (`(admin)`, `(resident)`, `(security)`) isolate each portal's layouts, middleware redirects, and auth flows without duplicating code or deploying separate apps.

- **Admin-controlled security staff auth** — Security staff don't self-register. The admin creates their account with a name and passkey. The system derives a synthetic auth email (`name@staff.malo`) and uses Supabase's service role API to provision the account server-side. Staff log in with name + passkey only — no email required.

- **Status-based QR passes** — Passes move through `Approved → Verified → Expired`. First scan by security marks it Verified and logs the entry. Subsequent scans continue to show Verified so visitors can pass multiple checkpoints. Passes expire after the visit date.

- **Service role API route** — Staff account creation requires bypassing RLS (since the admin is creating accounts for other users). A Next.js API route at `/api/admin/create-staff` uses the Supabase service role key server-side, keeping the secret off the client.

- **Resident approval gate** — Residents who register go to a pending-approval state. The resident layout server component checks `is_approved` on every request and redirects unapproved users to a holding page. A Postgres trigger syncs `residents.approved → users.is_approved` automatically when the admin approves.

---

## Features

### Visitor — Frictionless gate entry
- Receives a QR pass link from a resident
- Presents QR code or pass code at the gate
- No account or app required
- Pass automatically expires after the visit date

### Resident — Visitor management
- Register with email and password
- Pending admin approval before access is granted
- Generate QR passes for expected visitors
- View full visit history and pass status

### Security Staff — Gate verification
- Admin-created account (name + passkey login)
- Toggle on/off duty status from the dashboard
- Verify visitors by scanning QR code with device camera or entering code manually
- View verification records for the property

### Property Admin — Full oversight
- Register and onboard a property during setup
- Approve or reject resident applications
- Create and manage security staff accounts with passkeys
- Post notices to residents
- View full visitor history and verification logs

---

## Architecture

```
.
└── nextjs/                         # Single Next.js app (all portals)
    └── src/
        ├── app/
        │   ├── (admin)/            # Admin portal — layout + dashboard pages
        │   ├── (resident)/         # Resident portal — layout + dashboard pages
        │   ├── (security)/         # Security portal — layout + dashboard pages
        │   ├── admin/              # Admin auth pages (login, register)
        │   ├── security/           # Security auth pages (login)
        │   ├── (auth)/             # Resident auth pages (login, register)
        │   ├── api/admin/          # Server-side API routes (service role operations)
        │   ├── onboarding/         # Post-registration profile setup
        │   ├── pending-approval/   # Holding page for unapproved residents
        │   └── guest-pass/[code]/  # Public QR pass view (no auth required)
        ├── components/
        │   ├── Sidebar.tsx         # Role-aware navigation sidebar
        │   └── QrScanner.tsx       # Camera-based QR code scanner
        ├── lib/supabase/           # Supabase client (browser + server)
        └── middleware.ts           # Role-based route protection
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com/) project (free tier works)

### 1. Clone

```bash
git clone https://github.com/Chungu13/Hostel-Management-System.git
cd Hostel-Management-System/nextjs
```

### 2. Environment variables

Create a `.env.local` file inside the `nextjs/` folder:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database

Run `supabase-schema.sql` in your Supabase SQL editor to create all tables, RLS policies, and triggers.

### 4. Run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`. All three portals are available:
- Resident: `/login`
- Security: `/security/login`
- Admin: `/admin/login`

---

## About

Built to explore multi-tenant SaaS architecture, Row Level Security as an access control primitive, and role-scoped authentication flows in a real-world residential security context. Any hostel, apartment complex, or gated community can onboard as an independent tenant on a single deployment.
