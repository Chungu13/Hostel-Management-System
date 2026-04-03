# Malo - Visitor Verification for Residential Properties 

> A multi-tenant, full-stack visitor verification platform for hostels, apartment complexes, and residential properties. Residents generate status-based QR passes for their visitors, security staff verify them at the gate, and property admins manage the entire operation.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Resident%20Portal-brightgreen)](#)
[![Admin Portal](https://img.shields.io/badge/Live%20Demo-Admin%20Portal-blue)](#)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19%20+%20Vite-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Fully%20Typed-3178C6?logo=typescript)](https://www.typescriptlang.org/)

---

## 🎥 Demo

[![Malo Demo]

https://www.loom.com/share/202d7252a8864fed9cad0cd42dd49113

> Covers the full visitor pass flow — resident generates a QR pass, visitor presents it at the gate, first scan logs arrival and marks the pass as Verified.



---

## 🔗 Live Demo

| Portal | URL |
|---|---|
| Resident Portal | https://hostel-management-system-reeq.vercel.app/login |
| Security Portal | https://hostel-management-system-reeq.vercel.app/login |
| Admin Portal | https://hostel-management-system-one-vert.vercel.app/login |
| API Docs (Swagger) | your-api-url/swagger-ui.html |

---

## 🔐 Demo Credentials

### Admin / Managing Staff
- **Email:** chungumuloshi5086@gmail.com
- **Password:** yourpassword

### Resident
- **Email:** testresident@gmail.com  
- **Password:** yourpassword

## Problem & Solution

Residential properties - hostels, apartments, and complexes, have no reliable way to verify visitors beyond a manual sign-in book. This creates security gaps, no audit trail, and no way for residents to pre-authorise guests.

Malo solves this with a resident-initiated QR pass system: residents generate a reusable, time-limited QR code for their visitor, the visitor presents it at the gate, and security staff scan it to verify entry all.

The platform is multi-tenant, meaning a single deployment serves multiple independent properties, each with fully isolated data.

---

## Tech Stack

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

## Key Engineering Decisions

- **Logical multi-tenancy via `propertyId`** - Shared database schema with every record scoped to a `propertyId`. All API queries are tenant-scoped, preventing cross-property data leakage.

- **Status + time-based QR passes** - Resident-generated passes follow a dual expiry model: status-based (pending → verified → expired) and a hard 24-hour time limit. First scan logs arrival; subsequent scans still show Verified so visitors can pass multiple checkpoints.

- **Hybrid Google OAuth** - Frontend initiates the OAuth flow, backend independently verifies the Google token and issues its own JWT, keeping session control server-side.

- **Unified auth pipeline** - Email/password and Google OAuth both resolve to the same internal user model via Spring Security, with no duplicate logic.

- **Tenant-scoped RBAC** - Roles are evaluated per property, not globally. A user's permissions are always scoped to the property they belong to.

- **Docker-first deployment** - Full stack orchestrated via `docker-compose` for reproducible builds and consistent deployments.

---

##  Features

> Access is controlled via JWT-based RBAC, scoped per tenant. Each role sees only what's relevant to their property and function.

###  Visitor - Frictionless gate entry
- Receives a QR pass from a resident (via link or screenshot)
- Presents QR code at the gate, first scan logs arrival and marks pass as Verified
- Can show the same pass to multiple guards throughout their visit
- Pass automatically expires 24 hours after generation
- No account or app required

###  Resident - Visitor management
- Register via email/password or Google OAuth
- Generate QR passes valid for 24 hours for expected visitors
- Pass status transitions from Pending → Verified on first scan, Expired after 24 hours
- View pass history and visitor activity log

###  Property Admin - Full property oversight
- Manage resident accounts and onboarding
- View all visitor logs and entry history for their property
- Monitor pass activity and flag anomalies
- Configure property settings and security rules

---

## Architecture

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
- **Frontend/Admin** - Vercel with automatic Git deployments
- **Backend** - Dockerized, deployed via docker-compose
- **Database** - MySQL (production), H2 in-memory (development)
- **Security** - Rate limiting via Bucket4j, JWT session management, HTTPS

---

##  Local Setup

### Prerequisites
- Java 17
- Node.js 18+
- Maven
- MySQL (optional - defaults to H2 in development)

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

Built to explore multi-tenant SaaS architecture, OAuth2 authentication flows, and role-scoped access control in a real-world residential security context. Any hostel, apartment complex, or gated community can sign up and run as their own independent space on the platform.
