# SMARTERA DIGITAL — Agency Operations Management CRM

A production-ready internal CRM and agency operations management system specifically built for **Smartera Digital**, a full-service digital marketing agency.

The system manages the entire operational lifecycle from end-to-end:

$$\text{Lead} \longrightarrow \text{Sales} \longrightarrow \text{Client} \longrightarrow \text{Package} \longrightarrow \text{Payment} \longrightarrow \text{Work Planning} \longrightarrow \text{Shoot} \longrightarrow \text{Editing} \longrightarrow \text{Approval} \longrightarrow \text{Scheduling} \longrightarrow \text{Posting} \longrightarrow \text{Ads} \longrightarrow \text{Expiry} \longrightarrow \text{Renewal}$$

> 📖 **[Click here to view the Complete Agency Workflow Documentation & SOP Manual (WORKFLOW_DOCUMENTATION.md)](file:///c:/Users/Shubham%20Shrivastava/Desktop/smartera-crm/WORKFLOW_DOCUMENTATION.md)**

---

## 🌟 Key Features & Business Operations

### 1. Lead Pipeline & 1-Click Conversion Engine
- Comprehensive lead records (Lead ID, contact person, WhatsApp, acquisition source, category, budget, sales rep, follow-ups).
- **One-Click Lead → Client Conversion Wizard**: Instantly creates a Client, Client Business Profile, binds package template, and records onboarding advance payment with **zero duplicate data entry** while preserving the full lead history.

### 2. Client Business Profiles & Monthly Work Boards
- Detailed creative metadata: brand colors (hex), brand tone, target audience, competitor benchmarks, and client-specific shooting SOPs.
- **Client Monthly Work Board**: Visual progress bars tracking deliverables (Posted, In Editing, Shoot Scheduled, Scripting, Quota Remaining) with live completion percentages (e.g. 4 / 12 Reels = 33%).

### 3. Packages, Multi-Installment Payments & Expiry Engine
- Package templates (Starter Growth, Pro Scaling, Elite Domination) with quotas for reels, posts, stories, shoots, and Meta Ads.
- Multi-installment payment ledger automatically calculating total paid and remaining balance (`Remaining = Final Price - Total Paid`).
- Expiry monitor with automated notifications at 15d, 7d, 3d, 1d, and 0d before expiration.
- 1-Click Package Renewal preserving all historical client data and packages.

### 4. 5-Stage Reel Workflow Matrix (Metadata Tracking)
- Granular 5-stage tracking for each reel without storing heavy raw video files inside the CRM:
  1. **Script Status**: Not Started $\to$ In Progress $\to$ Ready $\to$ Completed
  2. **Shoot Status**: Not Required $\to$ Planned $\to$ Scheduled $\to$ Completed $\to$ Cancelled
  3. **Editing Status**: Not Started $\to$ In Progress $\to$ Internal Review $\to$ Revision Required $\to$ Completed
  4. **Client Approval Status**: Not Sent $\to$ Pending $\to$ Approved $\to$ Changes Requested (with feedback notes)
  5. **Posting Status**: Not Scheduled $\to$ Scheduled $\to$ Posted $\to$ Cancelled
- Auto-calculated overall stage indicator and external review URL (Google Drive / Frame.io).

### 5. Shoots Management & Double-Booking Prevention
- Schedule on-location and studio shoots with call times, locations, cameramen, and models.
- **Collision Detection Engine**: Automatically detects date/time conflicts for cameramen and models, showing real-time warning alerts to prevent double-booking.

### 6. Role-Based Access Control (RBAC) & Sandbox Switcher
- Granular permissions for 8 roles: Super Admin, Admin/Operations, Sales Person, Social Media Manager, Video Editor, Camera Man, Model, Ads Manager.
- Built-in instant **Role Switcher** in the top navigation for rapid UI testing across all team personas.

### 7. Automated Cron Reminders & Immutable Audit Trail
- Automated idempotent reminder engine checking package expirations, overdue follow-ups, overdue tasks, and shoot call times.
- Immutable activity audit log tracking every critical mutation with actor, timestamp, IP, and payload diffs.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, React Router v6, Tailwind CSS, TanStack Query (React Query), Recharts, Lucide Icons, Zustand.
- **Backend**: Node.js, Express.js, TypeScript, REST API architecture, Zod validation, JWT authentication, RBAC middleware, Centralized Error Handling.
- **Database**: PostgreSQL (Supabase compatible) with reproducible SQL migrations in `server/migrations/` and built-in relational store.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm (v8+)

### 2. Installation
```bash
# Clone or navigate to the repository
cd smartera-crm

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file from `.env.example`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=smartera_super_secret_jwt_key_2026_marketing_agency_crm
JWT_EXPIRES_IN=7d
DATABASE_URL=
CLIENT_URL=http://localhost:5173
```

### 4. Run Development Servers
```bash
# Start both Backend (Port 5000) and Frontend (Port 5173) concurrently:
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👥 Demo Logins & Test Personas

The system includes pre-seeded demo accounts. Click any profile on the login page or use the **Role Switcher** in the top navigation:

| Role | Name | Email | Password |
|---|---|---|---|
| **Super Admin** | Aarav Sharma | `admin@smarteradigital.com` | `smartera123` |
| **Sales Person** | Priya Verma | `priya.sales@smarteradigital.com` | `smartera123` |
| **Social Media Manager** | Neha Gupta | `neha.smm@smarteradigital.com` | `smartera123` |
| **Video Editor** | Rohan Mehta | `rohan.editor@smarteradigital.com` | `smartera123` |
| **Camera Man** | Rahul Sen | `rahul.camera@smarteradigital.com` | `smartera123` |
| **Model** | Simran Kaur | `simran.model@smarteradigital.com` | `smartera123` |
| **Ads Manager** | Vikram Malhotra | `vikram.ads@smarteradigital.com` | `smartera123` |

---

## 📁 Project Structure

```
smartera-crm/
├── server/
│   ├── config/              # Configuration constants
│   ├── controllers/         # REST API Controllers
│   ├── cron/                # Automated reminders & expiry scheduler
│   ├── db/
│   │   ├── connection.ts    # Relational Database connection layer
│   │   ├── migrate.ts       # Database migration runner
│   │   ├── seed.ts          # Seed runner
│   │   └── seedData.ts      # Comprehensive agency seed dataset
│   ├── middlewares/         # Auth, RBAC, Audit, and Error handling
│   ├── migrations/          # Reproducible SQL schema migrations
│   ├── routes/              # Express API router
│   ├── services/            # Business logic service layer
│   ├── types/               # Server TypeScript interfaces
│   ├── validators/          # Zod validation schemas
│   └── index.ts             # Express server entry point
│
├── src/
│   ├── api/                 # Typed API client wrapper
│   ├── components/          # Reusable UI components & dialogs
│   ├── layouts/             # AppLayout with sidebar & header
│   ├── pages/               # Feature pages (Dashboard, Leads, Reels, etc.)
│   ├── store/               # Zustand auth & role switcher store
│   ├── types/               # Frontend TypeScript interfaces
│   ├── App.tsx              # Router setup
│   ├── index.css            # Tailwind & Design tokens
│   └── main.tsx             # Frontend entry
│
├── .env.example
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 📡 Key REST API Endpoints

- **Auth**: `POST /api/auth/login`, `GET /api/auth/me`
- **Leads**: `GET /api/leads`, `POST /api/leads`, `POST /api/leads/convert`, `POST /api/leads/followups`
- **Clients**: `GET /api/clients`, `GET /api/clients/:id`, `GET /api/clients/:id/work-board`
- **Packages**: `GET /api/packages/templates`, `GET /api/packages/client-packages`, `POST /api/packages/client-packages/:id/renew`
- **Payments**: `GET /api/payments`, `POST /api/payments`, `GET /api/payments/summary`
- **Reels Matrix**: `GET /api/reels`, `POST /api/reels`, `PUT /api/reels/:id`
- **Shoots & Conflicts**: `GET /api/shoots`, `POST /api/shoots/check-conflicts`, `POST /api/shoots`
- **Reports**: `GET /api/reports/dashboard`, `GET /api/reports/full`
- **Notifications**: `GET /api/notifications`, `PUT /api/notifications/:id/read`
