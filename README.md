# APU Hostel Management System 🏨

A modern, full-stack hostel management system designed for residents and management staff at APU. This project features a robust Spring Boot backend and sleek React-based frontends for both residents and admins.

## 🚀 Overview

The **APU Hostel Management System** streamlines the process of managing hostel stays, property registrations, and resident onboarding. It provides a secure, role-based environment with features like Google OAuth, QR code scanning for check-ins, and a beautiful dashboard for analytics.

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 3.2.2
- **Language:** Java 17
- **Security:** Spring Security, JJWT (JSON Web Token)
- **Authentication:** Google OAuth2 API
- **Database:** MySQL (Production), H2 (Development)
- **Documentation:** SpringDoc OpenAPI 2.0 (Swagger)
- **Rate Limiting:** Bucket4j
- **Build Tool:** Maven

### Frontend (Resident & Admin)
- **Framework:** React 19 + Vite
- **TypeScript:** Fully Typed
- **Styling:** Tailwind CSS 4.0, Framer Motion (Animations)
- **Icons:** Lucide React
- **Features:** 
  - QR Code Scanning & Generation
  - Data Visualization (Recharts)
  - Responsive Design
  - Google OAuth Integration

---

## ✨ Key Features

- **🔐 Secure Authentication:** Multi-method login (Email/Password & Google OAuth).
- **📋 Role-Based Onboarding:** Custom onboarding flows for Residents and Managing Staff.
- **🏢 Property Management:** Admins can register and manage properties.
- **📱 QR Scanner:** Seamless check-in/out logic using integrated QR scanners.
- **📊 Admin Dashboard:** Real-time analytics and resident management.
- **🧪 Production Ready:** Docker support with `docker-compose` and Vercel-ready frontend configurations.
- **🛡️ Security First:** Rate limiting and JWT session management.

---

## 📁 Project Structure

```bash
.
├── admin/            # Admin Dashboard (React + Vite)
├── backend/          # Spring Boot API
│   ├── src/          # Source code
│   ├── pom.xml       # Maven dependencies
│   ├── Dockerfile    # Backend containerization
│   └── .env.example  # Environment template
├── frontend/         # Resident Application (React + Vite)
└── docker-compose.yml # Full-stack orchestration
```

---

## 🚦 Getting Started

### Prerequisites
- Java 17
- Node.js 18+
- MySQL (Optional, default uses H2)
- Maven

### 1. Backend Setup
```bash
cd backend
# Create a .env file from the template and fill in your details
cp .env.example .env
mvn clean install
mvn spring-boot:run
```
Access the API documentation at: `http://localhost:8080/swagger-ui.html`

### 2. Frontend Setup (Resident)
```bash
cd frontend
npm install
npm run dev
```

### 3. Admin Setup
```bash
cd admin
npm install
npm run dev
```

---

## 🐳 Docker Deployment

To run the entire system using Docker:
```bash
docker-compose up --build
```

---

## 📝 License

This project is licensed under the MIT License.

---

*Built with ❤️ for APU Students.*
