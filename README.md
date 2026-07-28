# ☁️ AWS SBG REC — Student Builder Group & Cloud Learning Portal

<p align="center">
  <img src="https://img.shields.io/badge/Production-Ready-success?style=for-the-badge&logo=rocket" alt="Production Ready" />
  <img src="https://img.shields.io/badge/Framework-Next.js%2015-black?style=for-the-badge&logo=nextdotjs" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Backend-NestJS%2010-E0234E?style=for-the-badge&logo=nestjs" alt="NestJS 10" />
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Cloud-AWS%20Services-FF9900?style=for-the-badge&logo=amazonaws" alt="AWS Services" />
</p>

This repository contains the enterprise web platform and cloud education ecosystem for the **AWS Student Builder Group (SBG)** at **Rajalakshmi Engineering College (REC)**. 

Designed as a high-performance `npm` workspace monorepo, it powers student event registrations, QR ticket validation, interactive visual cloud roadmaps, automated AWS news ingestion via AI summarization, and leadership showcases.

---

## 📋 Table of Contents
- [🔑 Seeded Credentials](#-seeded-credentials)
- [🏗️ System Architecture](#️-system-architecture)
- [🌟 Key Platform Capabilities](#-key-platform-capabilities)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [🚀 Quick Start (Development)](#-quick-start-development)
- [🌐 Production Deployment Guide](#-production-deployment-guide)
  - [1. Database Setup (AWS RDS / Neon)](#1-database-setup-aws-rds--neon)
  - [2. Backend Deployment (AWS EC2 / ECS / PM2)](#2-backend-deployment-aws-ec2--ecs--pm2)
  - [3. Frontend Deployment (Vercel / AWS Amplify)](#3-frontend-deployment-vercel--aws-amplify)
  - [4. Nginx Reverse Proxy Setup](#4-nginx-reverse-proxy-setup)
- [🛠️ Operational Scripts](#️-operational-scripts)
- [🔐 Security & Best Practices](#-security--best-practices)

---

## 🔑 Seeded Credentials

Default seeded test accounts for verifying role access across the application:

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Super Admin / Organizer** | `pranavranjan@rajalakshmi.edu.in` | `pranav123` | Full administrative suite: event creation, QR scanner, user tasks, learning paths, & system metrics. |
| **Enthusiast / Student** | `enthusiasts@rajalakshmi.edu.in` | `Enthusiasts@123` | Student portal: event registration, QR tickets, interactive roadmaps, quizzes, & leaderboards. |

---

## 🏗️ System Architecture

```text
                                 +------------------------+
                                 |   Client Browser UI    |
                                 | (Next.js 15 App Router)|
                                 +-----------+------------+
                                             |
                                   HTTP / REST API (Port 4000)
                                             |
                                             v
                                 +------------------------+
                                 |  NestJS 10 API Engine  |
                                 +----+--------------+----+
                                      |              |
                +---------------------+              +---------------------+
                |                                                          |
                v                                                          v
   +------------------------+                                 +------------------------+
   | PostgreSQL (RDS/Neon)  |                                 | AWS Bedrock / Redis    |
   | (Prisma 5 ORM Engine)  |                                 | (AI Summary & BullMQ)  |
   +------------------------+                                 +------------------------+
```

### Monorepo Structure

```text
AWS_SBG_REC_WEBSITE_COPY/
├── apps/
│   ├── frontend/             # Next.js 15 App Router Frontend (Port 3000)
│   │   ├── src/
│   │   │   ├── app/          # App Router routes (Homepage, Events, Roadmaps, Admin)
│   │   │   ├── components/   # Modular UI components (Faculty Spotlight, Team Carousels)
│   │   │   └── modules/      # Feature-specific state and service handlers
│   │   └── public/           # Static assets, wallpapers, and branding images
│   │
│   └── backend/              # NestJS 10 REST API Backend (Port 4000)
│       ├── src/              # Controllers, services, DTOs, guards, & filters
│       └── prisma/           # Database schema definition & seed scripts
│
├── uploads/                  # Storage directory for event banners and generated QR tickets
├── package.json              # Monorepo workspace configuration
└── README.md                 # Technical & Deployment Documentation
```

---

## 🌟 Key Platform Capabilities

### 📅 Event Management & QR Ticketing
- **Event Wizard**: Dynamic event creator supporting schedule timelines, speaker lists, custom form fields, and venue parameters.
- **Smart QR Tickets**: Automatically renders unique QR-coded digital tickets for attendees.
- **Venue Scanner**: Integrated live camera scanner for on-site ticket validation.
- **Real-Time Filtering**: Automatic event status updates (*Upcoming*, *Live Now*, *Completed*) with paginated API endpoints.

### 🗺️ Visual Cloud Pathways
- **Interactive Node Roadmaps**: Step-by-step guidance for Cloud Engineering, DevOps, Solutions Architecture, and Security.
- **AWS Services Catalog**: Searchable index of core AWS services paired with use cases.
- **Quizzes & Community Leaderboards**: Comprehension quizzes with automated score tracking.

### 🤖 AI AWS News Aggregator
- **Official Ingestion**: Automated fetching of official AWS announcements.
- **AWS Bedrock Summaries**: Generates high-level executive summaries using AI models.

### 👥 Leadership Spotlight & Community Showcase
- **Executive Spotlight**: Dedicated card for the Faculty Coordinator featuring mentorship statements and LinkedIn links.
- **Doodle Wallpaper Showcase**: Custom tileable WhatsApp doodle wall patterns for team carousels.

---

## ⚙️ Environment Configuration

### Backend Environment Variables (`apps/backend/.env`)

```env
# Database Connection (Neon / AWS RDS PostgreSQL)
DATABASE_URL="postgresql://user:password@hostname:5432/dbname?sslmode=require"

# Server Port & Binding
PORT=4000
NODE_ENV="production"

# Authentication Secrets
JWT_SECRET="super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="super-secret-refresh-key-change-in-production"

# Optional Cloud Services
AWS_REGION="ap-southeast-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
```

### Frontend Environment Variables (`apps/frontend/.env`)

```env
# Backend API Base URL
NEXT_PUBLIC_API_URL="http://localhost:4000/api"

# Database Connection (Same PostgreSQL instance)
DATABASE_URL="postgresql://user:password@hostname:5432/dbname?sslmode=require"
```

---

## 🚀 Quick Start (Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: Running locally or via cloud (Neon / AWS RDS)

### 2. Database Sync & Seeding
Run from the repository root:

```bash
# Push Prisma schema to database
npx prisma db push --schema=apps/backend/prisma/schema.prisma

# Generate Prisma client bindings
npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Seed demo users and initial data
npx ts-node apps/backend/prisma/seed.ts
```

### 3. Launch Development Server
```bash
npm run dev
```
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)

---

## 🌐 Production Deployment Guide

### 1. Database Setup (AWS RDS / Neon)
1. Provision a PostgreSQL 15+ instance on **AWS RDS** or **Neon Cloud**.
2. Configure security groups to allow inbound connections on port `5432`.
3. Execute production migrations from the root directory:
```bash
npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
```

---

### 2. Backend Deployment (AWS EC2 / PM2)

#### Step 1: Install PM2 Globally
```bash
sudo npm install -g pm2
```

#### Step 2: Build Backend Application
```bash
npm run build -w backend
```

#### Step 3: Start Application with PM2
```bash
cd apps/backend
pm2 start dist/main.js --name "aws-sbg-backend"
pm2 save
pm2 startup
```

---

### 3. Frontend Deployment (Vercel / AWS Amplify)

#### Option A: Vercel Deployment (Recommended)
1. Import the git repository into **Vercel**.
2. Set **Root Directory** to `apps/frontend`.
3. Configure environment variable: `NEXT_PUBLIC_API_URL = https://api.yourdomain.com/api`.
4. Deploy.

#### Option B: AWS Amplify / EC2 Build
```bash
npm run build -w frontend
npm run start -w frontend -- -p 3000
```

---

### 4. Nginx Reverse Proxy Setup (Production Server)

Create an Nginx configuration file (`/etc/nginx/sites-available/aws-sbg`):

```nginx
server {
    listen 80;
    server_name sbg.rajalakshmi.edu.in api.sbg.rajalakshmi.edu.in;

    # Frontend (Next.js App Router)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (NestJS REST Engine)
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/aws-sbg /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Secure with SSL (Certbot)
```bash
sudo certbot --nginx -d sbg.rajalakshmi.edu.in -d api.sbg.rajalakshmi.edu.in
```

---

## 🛠️ Operational Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs frontend and backend concurrently in development mode. |
| `npm run build` | Builds production artifacts for all workspace packages. |
| `npm run backend` | Launches NestJS server independently (`port 4000`). |
| `npm run frontend` | Launches Next.js frontend independently (`port 3000`). |
| `npx prisma studio` | Opens interactive database GUI on [http://localhost:5555](http://localhost:5555). |

---

## 🔐 Security & Best Practices

- **JWT Token Management**: Access tokens expire in 15 minutes; refresh tokens handle extended session security.
- **Form Input Validation**: Handled via NestJS `class-validator` DTO pipes.
- **Database Access**: Protected via Prisma ORM parameterized SQL queries preventing injection.
- **CORS Protection**: Scoped CORS rules configured in `apps/backend/src/main.ts`.

---

<p align="center">
  Maintained for <b>AWS Student Builder Group</b> · <b>Rajalakshmi Engineering College</b>
</p>
