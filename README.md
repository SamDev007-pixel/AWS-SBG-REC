# AWS-SBG-REC: Event Registration & Management Platform

A robust, enterprise-grade Event Registration and Ticket Management platform. The application is built using a modern full-stack monorepo architecture: **NestJS** (backend API) and **Next.js 15** (frontend dashboard).

---

## 🔑 Demo Login Credentials

Use these seeded accounts to log in and test different access levels:

| Role | Email Address | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| **Super Admin / Admin / Organizer** | `pranavranjan@rajalakshmi.edu.in` | `pranav123` | Full system control, event creation/management, user management, and analytics dashboard access. |

---

## 📁 Repository Structure

```text
AWS-SBG-REC/
├── apps/
│   ├── backend/        # NestJS REST API server (runs on port 3000)
│   └── frontend/       # Next.js 15 Admin Dashboard (runs on port 3001)
├── uploads/            # Local media & ticket asset storage
└── package.json        # Root package workspace definition
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org) (v18 or higher)
* [PostgreSQL](https://www.postgresql.org/) (running locally or in Docker)

---

### 2. Environment Setup

Configure your environment variables before starting:

#### Backend Config (`apps/backend/.env`)
Create a `.env` file inside `apps/backend/`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/event_registration_core?schema=public"
APP_PORT=3000
APP_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

#### Frontend Config (`apps/frontend/.env.local`)
Create a `.env.local` file inside `apps/frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

### 3. Database Initialization & Seeding
From the **root directory** (or inside `apps/backend`), run the following to sync the database schema and insert the default demo users:

```bash
# Push schema to PostgreSQL database
npx prisma db push

# Generate the type-safe Prisma client
npm run prisma:generate

# Seed the database with default users and events
npm run prisma:seed
```

---

### 4. Running the Applications

#### Run Everything at Once (Recommended)
From the root directory, start the development server for both the frontend and backend:
```bash
npm run dev
```

#### Run Separately
* **Backend API:**
  ```bash
  cd apps/backend
  npm run start:dev
  ```
  *Exposes API Docs (Swagger UI) at `http://localhost:3000/api`*

* **Frontend Dashboard:**
  ```bash
  cd apps/frontend
  npm run dev
  ```
  *Exposes user dashboard interface at `http://localhost:3001`*
