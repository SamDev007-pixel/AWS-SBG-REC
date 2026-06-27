# AWS SBG REC: Student Branch Group & Learning Portal

Welcome to the official portal for the **AWS Student Branch Group (SBG)** at **Rajalakshmi Engineering College (REC)**. 

This platform serves as a comprehensive hub for cloud learning, community building, and campus event coordination, offering features ranging from interactive learning pathways to robust event ticketing and crew coordination.

---

## 🔑 Demo Login Credentials

Use these seeded accounts to log in and test different platform capabilities:

| Role | Email Address | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| **Super Admin / Admin / Organizer** | `pranavranjan@rajalakshmi.edu.in` | `pranav123` | Full system control, event management, learning content publishing, task assignments, and analytics dashboard access. |
| **Enthusiast / Learner** | `enthusiasts@rajalakshmi.edu.in` | `Enthusiasts@123` | Access to learning modules, roadmaps, interactive quizzes, leaderboards, and event registration. |

---

## 🌟 Key Platform Modules

### 1. 📅 Event Management & Ticketing
* **Custom Event Wizard:** Create and configure events with schedules, custom speaker lists, and custom registration forms.
* **Smart Ticketing:** Generates unique QR-coded tickets sent directly to registrants.
* **QR Check-in scanner:** Interactive scanning dashboard for check-in verification at the venue.

### 2. 🗺️ Career Pathways & Roadmaps
* **Visual Learning Roadmaps:** Interactive, node-based roadmaps illustrating paths to becoming a Cloud Engineer, DevOps specialist, Solutions Architect, etc.
* **AWS Services Directory:** Structured catalogue outlining core AWS services and their use cases.

### 3. 🎓 Learning Platform & Quizzes
* **Curriculum & Topics:** Study modules for various AWS concepts.
* **Knowledge Checks:** Built-in quizzes to test comprehension.
* **Leaderboards:** Friendly community competition tracking score ranking of active learners.

### 4. 📰 Ingested AWS News Feed
* **News Aggregator:** Automatically pulls the latest AWS updates and announcements.
* **AI Article Summarization:** Briefly explains complex technical announcements into easy-to-read highlights.

### 5. 👥 Task & Crew Workspace
* **Collaboration Board:** Staff workspace for organizing volunteer schedules.
* **Task Boards:** Trello-like task assignments for managing branch operations.

---

## 📁 Repository Structure

```text
AWS-SBG-REC/
├── apps/
│   ├── backend/        # NestJS REST API server (runs on port 4000)
│   └── frontend/       # Next.js 15 Web & Admin Dashboard (runs on port 3000)
├── uploads/            # Local media & ticket asset storage
└── package.json        # Root package workspace definition
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org) (v18 or higher)
* [PostgreSQL](https://www.postgresql.org/) (running locally or in Neon/Docker)

---

### 2. Environment Setup

Configure your environment variables:

#### Backend Config (`apps/backend/.env`)
Create a `.env` file inside `apps/backend/`:
```env
DATABASE_URL="postgresql://neondb_owner:npg_suieOgbTG40v@ep-jolly-lab-aopatnec-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
APP_PORT=4000
APP_URL=http://localhost:4000
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

#### Frontend Config (`apps/frontend/.env`)
Create a `.env` file inside `apps/frontend/`:
```env
DATABASE_URL="postgresql://neondb_owner:npg_suieOgbTG40v@ep-jolly-lab-aopatnec-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

---

### 3. Database Initialization & Seeding
From the **root directory**, run the following to sync the database schema and insert the default demo users/content:

```bash
# Push schema to PostgreSQL database
npx prisma db push

# Generate the type-safe Prisma client
npm run prisma:generate

# Seed the database with default users, events, roadmaps, and services
npm run prisma:seed
```

### 4. Running the Applications

#### Run Everything at Once (Recommended)
From the root directory, start the development server for both the frontend and backend:
```bash
npm run dev
```

