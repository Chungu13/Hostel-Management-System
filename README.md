# GatePass — Visitor Verification for Residential Properties 🏨

> A multi-tenant, full-stack visitor verification platform for hostels, apartment complexes, and residential properties. Residents generate session-scoped QR passes for their visitors, security staff verify them at the gate, and property admins manage the entire operation from a live dashboard.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Resident%20Portal-brightgreen)](#)
[![Admin Portal](https://img.shields.io/badge/Live%20Demo-Admin%20Portal-blue)](#)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19%20+%20Vite-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Fully%20Typed-3178C6?logo=typescript)](https://www.typescriptlang.org/)

---

## 🎥 Demo

[![GatePass Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

> Covers the full visitor pass flow — resident generates a QR code, visitor presents it at the gate, security verifies entry.

*Replace `YOUR_VIDEO_ID` with your YouTube or Loom link before publishing.*

---

## 🔗 Live Demo

| Portal | URL |
|---|---|
| 🏠 Resident Portal | your-resident-url |
| 🛠️ Admin Dashboard | your-admin-url |
| 📖 API Docs (Swagger) | your-api-url/swagger-ui.html |

---

## 🧩 Problem & Solution

Residential properties — hostels, apartments, and complexes — have no reliable way to verify visitors beyond a manual sign-in book. This creates security gaps, no audit trail, and no way for residents to pre-authorise guests.

GatePass solves this with a resident-initiated QR pass system: residents generate a time-limited, single-use QR code for their visitor, the visitor presents it at the gate, and security staff scan it to verify entry — all with a full audit log per property.

The platform is multi-tenant, meaning a single deployment serves multiple independent properties, each with fully isolated data.

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2.2 |
| Security | Spring Security, JJWT, Google OAuth2 |
| Database | MySQL (production), H2 (development) |
| Multi-Tenancy | Shared database, logical isolation via `propertyId` |
| Frontend | React 19, Vite, TypeScript |
| Styling | Tailwind CSS 4.0, Framer Motion |
| API Docs | SpringDoc OpenAPI 2.0 (Swagger) |
| Rate Limiting | Bucket4j |
| Deployment | Docker, docker-compose, Vercel |

---

## 🔑 Key Engineering Decisions

- **Logical multi-tenancy via `propertyId`** — All tenants share the same database schema, with every record scoped to a `propertyId`. This keeps infrastructure simple and cost-effective while enforcing strict data isolation at the application layer. Every API query is tenant-scoped, preventing cross-property data leakage.

- **Resident-initiated visitor QR passes** — Rather than issuing QR codes centrally, residents generate passes themselves. Each pass is tied to a specific visitor and validity window, with a status-based lifecycle (pending → verified → expired). The first scan officially logs the visitor's arrival; subsequent scans continue to show "Verified" — mirroring how a physical visitor badge works, so a visitor can present their pass to multiple guards throughout their visit without being blocked.

- **Hybrid Google OAuth flow** — The frontend initiates Google's OAuth consent flow and receives an identity token. The backend independently verifies the token against Google's public keys and issues its own JWT, keeping session management fully under application control rather than delegating it to Google.

- **Dual authentication methods** — Supports both email/password and Google OAuth through a unified authentication pipeline, with Spring Security resolving both flows to the same internal user model.

- **Role-based access per tenant** — Each property has its own Resident, Security, and Admin roles. A user's permissions are always evaluated in the context of their tenant, not globally — meaning the same person could be an admin at one property and a resident at another.

- **Docker-first deployment** — The entire backend stack is orchestrated via `docker-compose`, making environment setup reproducible and deployment consistent across machines.

---

## ✨ Features

> Access is controlled via JWT-based RBAC, scoped per tenant. Each role sees only what's relevant to their property and function.

### 🧍 Visitor — Frictionless gate entry
- Receives a QR pass from a resident (via link or screenshot)
- Presents QR code at the gate — first scan logs arrival and marks pass as Verified
- Can show the same pass to multiple guards throughout their visit
- No account or app required

### 🏠 Resident — Visitor management
- Register via email/password or Google OAuth
- Generate time-limited QR passes for expected visitors
- Pass status transitions from Pending → Verified on first scan
- View pass history and visitor activity log

### 👑 Property Admin — Full property oversight
- Manage resident accounts and onboarding
- View all visitor logs and entry history for their property
- Monitor pass activity and flag anomalies
- Configure property settings and security rules

---

## 🏗️ Architecture

```
.
├── admin/              # Admin Dashboard (React + Vite + TypeScript)
├── backend/            # Spring Boot REST API
│   ├── src/            # Source code
│   ├── pom.xml         # Maven dependencies
│   ├── Dockerfile      # Backend containerization
│   └── .env.example    # Environment variable template
├── frontend/           # Resident Application (React + Vite + TypeScript)
└── docker-compose.yml  # Full-stack orchestration
```

**Production Infrastructure:**
- **Frontend/Admin** — Vercel with automatic Git deployments
- **Backend** — Dockerized, deployed via docker-compose
- **Database** — MySQL (production), H2 in-memory (development)
- **Security** — Rate limiting via Bucket4j, JWT session management, HTTPS

---

## 🚀 Local Setup

### Prerequisites
- Java 17
- Node.js 18+
- Maven
- MySQL (optional — defaults to H2 in development)

### 1. Clone

```bash
git clone https://github.com/your-username/gatepass.git
cd gatepass
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in your credentials in .env
mvn clean install
mvn spring-boot:run
```

API docs available at: `http://localhost:8080/swagger-ui.html`

### 3. Resident Portal

```bash
cd frontend
npm install
npm run dev
```

### 4. Admin Dashboard

```bash
cd admin
npm install
npm run dev
```

### 5. Or run everything with Docker

```bash
docker-compose up --build
```

---

## 📌 About

Built to explore multi-tenant SaaS architecture, OAuth2 authentication flows, and role-scoped access control in a real-world residential security context. Designed to be property-agnostic — any hostel, apartment complex, or gated community can onboard as an independent tenant.
