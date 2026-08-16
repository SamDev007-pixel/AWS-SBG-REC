# AWS SBG REC - Production Deployment Guide

This guide details how to deploy the **AWS SBG REC Platform** across production environments, including **Docker Compose** (VPS / AWS EC2), **AWS Cloud Native (ECS Fargate + RDS + ElastiCache)**, and **Vercel / Render** hybrid setups.

---

## 🏗️ Architecture Overview

The system consists of:
1. **Next.js 15 Frontend**: Standalone React 19 web application (Port `3000`).
2. **NestJS 10 Backend**: Modular REST API with Swagger & BullMQ queues (Port `4000`).
3. **PostgreSQL 16 Database**: Relational database with `pgvector` extension for AI RAG embeddings (Port `5432`).
4. **Redis 7**: High-performance in-memory cache and background job broker (Port `6379`).

---

## 🚀 Option 1: Docker Compose Deployment (Recommended for VPS / AWS EC2)

Deploy the entire stack with a single command on any Linux VPS (Ubuntu, Debian, Amazon Linux 2023).

### Prerequisites
- Docker Engine 24+ (`docker --version`)
- Docker Compose V2 (`docker compose version`)
- Git

### 1. Clone Repository & Setup Environment
```bash
git clone https://github.com/SamDev007-pixel/AWS-SBG-REC.git /opt/aws-sbg-rec
cd /opt/aws-sbg-rec

# Copy and configure environment variables
cp .env.example .env
nano .env  # Update JWT_SECRET, database passwords, and domain URLs
```

### 2. Build & Launch Containers
```bash
# Build and run all services in background
docker compose up -d --build

# View container health and logs
docker compose ps
docker compose logs -f
```

### 3. Run Database Migrations & Seeds
Database migrations execute automatically on container startup. To manually run seeds or migrations:
```bash
# Apply migrations
docker compose exec backend npx prisma migrate deploy

# Run seed data
docker compose exec backend npm run prisma:seed
```

### 4. Nginx Reverse Proxy with SSL (Certbot)
To expose your domain (e.g., `events.awsclub.dev` and `api.awsclub.dev`) with HTTPS:

```nginx
# /etc/nginx/sites-available/aws-sbg-rec.conf
server {
    server_name events.awsclub.dev;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    server_name api.awsclub.dev;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Obtain free SSL certificate:
```bash
sudo certbot --nginx -d events.awsclub.dev -d api.awsclub.dev
```

---

## ☁️ Option 2: AWS Managed Services (ECS Fargate + RDS + ElastiCache)

For high-availability, auto-scaling enterprise deployment on AWS:

### 1. Database & Cache
- **Amazon RDS for PostgreSQL**:
  - Engine: PostgreSQL 16
  - Parameter Group: Enable `shared_preload_libraries = 'vector'` for `pgvector`.
- **Amazon ElastiCache for Redis**:
  - Cluster Mode: Disabled (Single-node or replication group).

### 2. Backend Container (Amazon ECS Fargate)
- Build and push backend image to **Amazon ECR**:
  ```bash
  aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
  docker build -t aws-sbg-backend -f apps/backend/Dockerfile .
  docker tag aws-sbg-backend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/aws-sbg-backend:latest
  docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/aws-sbg-backend:latest
  ```
- Configure ECS Task Definition with environment variables referencing AWS Secrets Manager for `DATABASE_URL` and `JWT_SECRET`.
- Attach Application Load Balancer (ALB) on port 4000.

### 3. Frontend Container (Amazon ECS or AWS Amplify / Vercel)
- Build and push frontend image to Amazon ECR:
  ```bash
  docker build -t aws-sbg-frontend -f apps/frontend/Dockerfile .
  docker tag aws-sbg-frontend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/aws-sbg-frontend:latest
  docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/aws-sbg-frontend:latest
  ```

---

## ⚡ Option 3: Hybrid Deployment (Vercel + Render / Railway)

### 1. Backend on Render / Railway
1. Create a new Web Service pointing to `apps/backend`.
2. Set Build Command: `npm ci && npm run build`
3. Set Start Command: `npx prisma migrate deploy && npm run start:prod`
4. Attach a PostgreSQL Database (with pgvector) and a Redis instance.
5. Set environment variables from `apps/backend/.env.example`.

### 2. Frontend on Vercel
1. Import repository and set Root Directory to `apps/frontend`.
2. Framework Preset: `Next.js`
3. Environment Variables:
   - `BACKEND_URL`: `https://your-backend-service.onrender.com`
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-service.onrender.com`
4. Deploy!

---

## 🛠️ Monorepo Build Commands

| Command | Description |
|---|---|
| `npm run build` | Builds both backend (NestJS) and frontend (Next.js standalone) |
| `npm run build:backend` | Compiles the NestJS TypeScript backend into `dist/` |
| `npm run build:frontend` | Generates the optimized Next.js production build |
| `npm run start:backend` | Starts the production NestJS server (`node dist/main`) |
| `npm run start:frontend` | Starts the production Next.js server (`next start`) |
| `npm run prisma:deploy` | Applies all pending database migrations in production |
| `npm run prisma:generate` | Regenerates Prisma Client for the current database schema |

---

## 🔒 Production Security Checklist

- [x] **Secure Secrets**: Generate a 64-character random string for `JWT_SECRET`.
- [x] **Database Isolation**: Keep PostgreSQL port `5432` closed to public internet; only allow connections within Docker network or VPC security groups.
- [x] **CORS Origin Protection**: Set `FRONTEND_URL` in backend `.env` to your exact production domain.
- [x] **Compression & Headers**: Gzip/Brotli compression enabled, `X-Powered-By` header stripped.
- [x] **Standalone Next.js**: Minimal footprint container without redundant build tools or dev dependencies.
