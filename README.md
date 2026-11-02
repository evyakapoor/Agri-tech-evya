# 🌱 Agri-Tech — Full-Stack Smart Farming Management System

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A modern, full-stack precision agriculture and IoT farm management platform built on the MERN stack. Designed with a nature-inspired aesthetic to empower farmers and agricultural researchers with data-driven crop analytics, rule-based soil health recommendations, hyper-local weather forecasting, integrated pest management, and an agricultural inputs marketplace.

---

## 📌 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Key Modules & Features](#-key-modules--features)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Database Setup & Seeding](#-database-setup--seeding)
- [Creating the Administrator](#-creating-the-administrator)
- [Running the Application (Single-Link & Dev Mode)](#-running-the-application)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Automated Testing](#-automated-testing)
- [Deployment Guide](#-deployment-guide)
- [Security & Reliability](#-security--reliability)

---

## 🌾 Overview & Architecture

Agri-Tech delivers end-to-end digital farm management by bringing together:
1. **Unified Deployment Architecture**: Both the React client and Express API can run either independently in development (with Vite HMR) or unified under a **single link / host** in production (Express serves compiled SPA assets with client-side route fallback).
2. **Precision Agronomy Engine**: Transparent, rule-based diagnostics based on FAO and ICAR extension standards for soil N-P-K, pH correction, and organic matter.
3. **Provable Data Integrity**: Clearly distinguishes between certified laboratory measurements, manual farmer sensors, and simulated demo records.
4. **Resilient Weather Service**: Seamless integration with OpenWeatherMap with automatic fallback to regional agronomic snapshots when API keys are unconfigured or unavailable.
5. **Multilingual Accessibility**: Real-time language switching between **English (EN)** and **हिन्दी (Hindi)** with language persistence.

---

## 🚀 Key Modules & Features

| Module | Features & Capabilities |
| :--- | :--- |
| **Farmer Dashboard** | Real-time statistics: total acreage, active crops, next harvest countdown, weather snapshot, soil chemical profile, crop growth charts (Recharts), and smart advisories. |
| **Farm Management** | Complete CRUD operations for farm parcels, geographical coordinates, area units (acres/hectares/bigha), soil classifications, and irrigation systems (Drip/Sprinkler/Flood). Full ownership security enforced. |
| **Crop Portfolio** | Track planting dates, expected harvest dates, crop variety, acreage, growth stages (*Sowing* to *Harvested*), health ratings, and growth-stage-specific advisories. |
| **Soil Health Analysis** | Log pH (0–14), Nitrogen, Phosphorus, Potassium, Moisture %, and Organic Carbon. Generates actionable rule-based agronomic recommendations. |
| **Weather Forecasting** | Hyper-local current conditions and 5-day forecasts. Shows temperature, humidity, rainfall volume, and agricultural spray advisories. Caches snapshots into MongoDB. |
| **Pest & Disease Alerts** | Observation logging, severity tags (*Low*, *Moderate*, *High*, *Critical*), symptoms tracking, safe Integrated Pest Management (IPM) guidelines, and in-app alert notifications. |
| **Agri Marketplace** | Certified seeds, bio-fertilizers, IPM sticky traps, and irrigation kits. Features server-side atomic stock validation to prevent overselling, and cash-on-delivery order processing. |
| **Expert Consultations** | Direct inquiry channel for farmers to submit agronomic questions. Research officers & admins provide verified responses. |
| **Community Forum** | Farmer discussion feed categorized by topics (Farming Tips, Pest Warnings, Tech). Includes comments, author tags, and moderation controls. |
| **Farm Activity Log** | Chronological journal of field tasks (Irrigation, Fertilization, Spraying, Planting, Harvesting) with expense tracking. |
| **In-App Notifications** | Real-time notifications for pest warnings, agronomist replies, and order updates with mark-as-read and mark-all-as-read persistence. |
| **Admin Control Panel** | Full administrator authority: platform metrics, user role toggling (Farmer ⇄ Admin), destructive user deletion with confirmation, product catalog CRUD, order fulfillment, and forum moderation. |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **Styling**: Bootstrap 5, Bootstrap Icons, and custom CSS palette (`#1b4332`, `#2d6a4f`, `#40916c`, `#d8f3dc`)
- **State & Routing**: React Context API, React Router v7
- **HTTP Client**: Axios with automated bearer token interceptors & session expiration handling
- **Visualizations**: Recharts (Growth stage distribution & soil macronutrient bar charts)
- **Internationalization**: `i18next` & `react-i18next` (English & Hindi)
- **Notifications**: React Toastify & custom in-app notification center

### Backend
- **Runtime**: Node.js (v20+ LTS / v24)
- **Web Framework**: Express.js 4
- **Database**: MongoDB with Mongoose 8 (Atlas or configurable URI, with in-memory fallback for offline test suites)
- **Authentication**: JSON Web Tokens (JWT) with bcryptjs password hashing
- **Security**: Helmet security headers, CORS origin whitelisting, centralized express-rate-limit
- **Validation**: express-validator with sanitized input schemas
- **Logging**: Morgan HTTP request logging

### Testing
- **Backend API**: Jest with Supertest & experimental VM modules (`npm run test:server`)
- **Frontend UI**: Vitest & React Testing Library with JSDOM (`npm run test:client`)

---

## 📁 Project Directory Structure

```
Agri-tech-evya/
├── client/                     # Vite React Frontend
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── api/                # Axios API client with interceptors
│   │   ├── components/         # Reusable UI components (Navbar, Sidebar, StatCard, etc.)
│   │   ├── context/            # AuthContext (user, token, role, login, register)
│   │   ├── i18n/               # i18next configuration & JSON locales (en.json, hi.json)
│   │   ├── layouts/            # DashboardLayout (Sidebar+Navbar) & MainLayout
│   │   ├── pages/              # 14 distinct application pages
│   │   ├── __tests__/          # Vitest React Testing Library tests
│   │   ├── App.jsx             # Main routing configuration
│   │   ├── main.jsx            # Application root
│   │   └── index.css           # Custom theme & responsive CSS
│   ├── index.html              # HTML5 root with SEO metadata
│   ├── vite.config.js          # Vite config with proxy & vitest environment
│   └── package.json
│
├── server/                     # Node.js Express Backend
│   ├── src/
│   │   ├── config/             # Database connection & environment loader
│   │   ├── controllers/        # RESTful controllers for all 12 modules
│   │   ├── middleware/         # Auth, Role guards, Rate limiter, Error handler
│   │   ├── models/             # 12 Mongoose data models with validation & indexes
│   │   ├── routes/             # Express API route modules
│   │   ├── services/           # WeatherService, AgronomyService, NotificationService
│   │   ├── validators/         # express-validator schemas
│   │   ├── utils/              # JWT signing & helper utilities
│   │   ├── scripts/            # Seed data & createAdmin CLI scripts
│   │   ├── tests/              # Supertest integration test suite
│   │   ├── app.js              # Express app setup & SPA static serving
│   │   └── server.js           # Server entry point & graceful shutdown
│   ├── lib/                    # Native OpenSSL compatibility libraries
│   ├── package.json
│   └── .env.example
│
├── package.json                # Root workspace configuration
├── .gitignore                  # Git secret & build exclusions
├── .env.example                # Root environment placeholder template
└── README.md                   # Full documentation
```

---

## ⚙️ Prerequisites

- **Node.js**: Version 20.x or newer LTS (`node -v`)
- **npm**: Version 9.x or newer (`npm -v`)
- **MongoDB**: MongoDB Atlas cloud cluster (recommended) or a local MongoDB instance. If no URI is provided during local testing, the application falls back safely to an in-memory database instance.

---

## 📥 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/evyakapoor/Agri-tech-evya.git
   cd Agri-tech-evya
   ```

2. **Install all dependencies (Root, Server, and Client):**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

---

## 🔐 Environment Variables

Ensure your `.env` contains the required settings:

```env
# Server Port & Mode
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Atlas or Local)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/agritech?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=replace_with_a_long_random_secure_jwt_secret_at_least_32_characters
JWT_EXPIRES_IN=7d

# Allowed Frontend Origins (CORS)
CLIENT_URL=http://localhost:5173

# Frontend API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# External Weather Provider (OpenWeatherMap API Key)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

---

## 🗄️ Database Setup & Seeding

The application includes an automated database seeder that populates realistic demonstration data across all 12 modules (farms with coordinates, crops, soil tests, weather records, IPM pest alerts, marketplace items, and community posts) without destroying production records.

Run the seeder:
```bash
npm run seed
```

*(To reset and re-seed from scratch, pass the `--force` flag: `node server/src/scripts/seed.js --force`)*

---

## 🛡️ Creating the Administrator

Users cannot register themselves as administrators via public registration. To create the initial administrator, use the documented script:

```bash
npm run createAdmin
```

Default credentials created:
- **Email**: `admin@agritech.com`
- **Password**: `Admin@123456`
- **Role**: `admin`

Demo Farmer credentials created by seeder:
- **Email**: `farmer@agritech.com`
- **Password**: `Farmer@123456`
- **Role**: `farmer`

*(The Login page also provides 1-click **Quick Demo Login** buttons to fill these credentials automatically).*

---

## 🚀 Running the Application

### Option A: Unified Single-Link Mode (Recommended for Evaluation & Production)
Builds the client and serves both API endpoints and the full interactive React UI under **one single URL** (`http://localhost:5000`):

```bash
# 1. Build the frontend client
npm run build

# 2. Start the unified Express server
npm start
```
Access the complete application at: **`http://localhost:5000`**

### Option B: Concurrent Development Mode
Runs both the Express backend API on port `5000` and Vite dev server on port `5173` with Hot Module Replacement (HMR):

```bash
npm run dev
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 📡 API Endpoints Reference

### Health & Connectivity
- `GET /api/health` — Returns system status, uptime, and database connection state.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new farmer account.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Get authenticated user details (Protected).
- `PUT /api/auth/profile` — Update user profile & language preference (Protected).
- `PUT /api/auth/change-password` — Change password with current password verification (Protected).

### Farms (`/api/farms`)
- `GET /api/farms` — Get all farms owned by authenticated user.
- `GET /api/farms/:id` — Get detailed farm parcel with associated crops, soil tests, and logs.
- `POST /api/farms` — Register a new farm.
- `PUT /api/farms/:id` — Update farm details (Ownership enforced).
- `DELETE /api/farms/:id` — Delete farm and cascade remove linked records.

### Crops (`/api/crops`)
- `GET /api/crops` — List crops with filtering by farm, growth stage, or search.
- `GET /api/crops/:id` — Get crop details with phenological growth stage advisory.
- `POST /api/crops` — Register crop on a user-owned farm.
- `PUT /api/crops/:id` — Update crop progress and health status.
- `DELETE /api/crops/:id` — Delete crop entry.

### Soil Health (`/api/soil-reports`)
- `GET /api/soil-reports` — View soil test history.
- `GET /api/soil-reports/:id` — Get single report with agronomic recommendations.
- `POST /api/soil-reports` — Submit soil test (pH, N, P, K, moisture) and receive rule-based recommendations.
- `DELETE /api/soil-reports/:id` — Delete soil test report.

### Weather (`/api/weather`)
- `GET /api/weather` — Get current conditions and 5-day daily forecast for farm location.
- `GET /api/weather/history` — View saved meteorological snapshots.

### Pest Alerts (`/api/pest-alerts`)
- `GET /api/pest-alerts` — List pest sightings with severity and status filters.
- `POST /api/pest-alerts` — Log pest observation & generate safe IPM guidelines.
- `PUT /api/pest-alerts/:id` — Update alert status (*Active*, *Under Control*, *Resolved*).
- `DELETE /api/pest-alerts/:id` — Remove pest record.

### Marketplace & Orders (`/api/resources`, `/api/orders`)
- `GET /api/resources` — Browse approved agricultural inputs with category filter.
- `POST /api/resources` — Create catalog item (Admin only).
- `PUT /api/resources/:id` — Update pricing or stock (Admin only).
- `DELETE /api/resources/:id` — Delete product (Admin only).
- `POST /api/orders` — Place order with atomic stock decrement and Cash on Delivery.
- `GET /api/orders/my-orders` — View user's order history.
- `GET /api/orders/all` — View all orders across platform (Admin only).
- `PUT /api/orders/:id/status` — Update order fulfillment status (Admin only).

### Consultations & Community (`/api/consultations`, `/api/community`)
- `GET /api/consultations/my` — View user's agronomist inquiries.
- `POST /api/consultations` — Submit inquiry to agricultural researchers.
- `GET /api/consultations/all` — Agronomist ticket queue (Admin only).
- `PUT /api/consultations/:id/respond` — Post official agronomist response (Admin only).
- `GET /api/community` — Browse forum posts by category with search.
- `POST /api/community` — Publish discussion post.
- `POST /api/community/:id/comment` — Add reply to discussion thread.
- `DELETE /api/community/:id` — Delete own post (or Admin moderation).

### Farm Activities (`/api/activities`)
- `GET /api/activities` — Chronological farm operations log.
- `POST /api/activities` — Record irrigation, fertilizer, spraying, planting, or harvesting event.
- `DELETE /api/activities/:id` — Delete activity log.

### Notifications (`/api/notifications`)
- `GET /api/notifications` — Retrieve user notifications.
- `PUT /api/notifications/:id/read` — Mark single notification as read.
- `PUT /api/notifications/read-all` — Mark all notifications as read.

### Admin Center (`/api/admin`)
- `GET /api/admin/stats` — Platform aggregates (Users, Acreage, Revenue, Active Threats).
- `GET /api/admin/users` — Paginated user directory.
- `PUT /api/admin/users/:id/role` — Promote or demote user role.
- `DELETE /api/admin/users/:id` — Delete user and cascade wipe data.
- `PUT /api/admin/posts/:id/moderate` — Set forum post status (*Published*, *Flagged*, *Removed*).

---

## 🧪 Automated Testing

Both backend and frontend test suites are fully configured:

### Run Backend Tests (Jest + Supertest):
```bash
npm run test:server
```
Runs 25 automated integration tests verifying API health, authentication, password hashing, ownership checks, farm and crop CRUD, soil diagnostics, order stock decrements, and admin authorization.

### Run Frontend Tests (Vitest + React Testing Library):
```bash
npm run test:client
```
Verifies frontend UI components, StatCard rendering, landing page call-to-actions, and authentication forms.

### Run All Tests Simultaneously:
```bash
npm test
```

---

## 🌐 Deployment Guide

### Single-Link Deployment (Render / Railway / Heroku)
Because the Express server serves the compiled Vite bundle from `client/dist`, the entire application can be deployed as a single web service:

1. **Build Command**:
   ```bash
   npm run build
   ```
2. **Start Command**:
   ```bash
   npm start
   ```
3. **Environment Variables**:
   Configure `PORT`, `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, and `OPENWEATHER_API_KEY` in the hosting dashboard.

### Two-Tier Deployment (Vercel/Netlify Frontend + Render Backend)
1. **Frontend (Vercel / Netlify)**:
   - Root directory: `client`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment Variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
2. **Backend (Render / Railway)**:
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `node src/server.js`
   - Environment Variables: `CLIENT_URL=https://your-frontend.vercel.app`, `MONGODB_URI=...`

---

## 🔒 Security & Reliability

- **Password Security**: Passwords are salted and hashed using `bcryptjs` with 10 rounds.
- **Ownership Enforcement**: Strictly checks that users can only view, edit, or delete farms, crops, and reports they own.
- **Role-Based Access Control (RBAC)**: Protects administrative routes and prevents privilege escalation during registration or profile updates.
- **Atomic Operations**: Marketplace inventory decrements use atomic MongoDB `$inc` operations with conditional `$gte` queries to eliminate race conditions and overselling.
- **Rate Limiting**: Protects sensitive authentication routes against brute-force attacks via `express-rate-limit`.
- **Sanitized Headers**: Enforces HTTP security headers via `helmet` and strict CORS policies.
- **Zero Exposed Secrets**: `.env` and sensitive credentials are excluded from version control via `.gitignore`.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
