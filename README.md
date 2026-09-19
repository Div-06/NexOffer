# NexOffer — AI-Powered Interview Preparation Platform

> **Tagline:** *Your Next Offer Starts Here.*

NexOffer is a full-stack, AI-powered interview preparation web platform designed specifically for college students and job seekers. It personalizes every stage of interview readiness by bridging the gap between a candidate's **Resume, Job Description (JD), Target Company, and Target Role**.

---

## 🌟 Key Features & The "Upload Once → Reuse Everywhere" Hub

NexOffer is built around a centralized Profile Context:
1. **Upload Once → Reuse Everywhere:** Upload your PDF resume and target Job Description once in your profile. Every module automatically inherits this context without manual re-entry.
2. **Centralized Multi-LLM Gateway:** Resilient AI architecture that prioritizes **Google Gemini API**, with automatic failover to **Grok (xAI) API** or intelligent zero-downtime offline heuristic engines when quotas/rate-limits occur.
3. **Enterprise Java Backend:** Robust **Spring Boot 3.3.4**, **Spring Data JPA**, **PostgreSQL** relational persistence, and **Spring Security** with stateless JWT authentication.
4. **Verified Authentication with OTP:** Complete JWT authentication flow featuring email OTP verification, password hashing with `BCrypt`, and password reset workflows.

---

## 🚀 10 Core Application Modules

| # | Module | Description |
|---|---|---|
| **1** | **Resume ATS Scanner** | Computes ATS Compatibility Score (0–100), Keyword Match %, Matched & Missing Skills list, Strengths, and Actionable ATS improvement tips. |
| **2** | **Interview Preparation** | Generates tailored questions categorized into **Technical**, **HR**, **Behavioural (STAR)**, **Role-Specific**, and **Company-Specific** with suggested model answers. |
| **3** | **Resume-Based Questions** | Deep dives into the candidate's exact projects, tech stack choices, architectural challenges, and certifications mentioned on their resume. |
| **4** | **Skill Gap Analyzer** | Compares Resume vs JD to highlight **High, Medium, and Low** priority missing skills with clear action recommendations. |
| **5** | **Company Research** | Provides structured company overviews, major products, typical interview rounds pipeline, core tech topics, and preparation tips. |
| **6** | **Roadmap Generator** | Builds customized day-by-day study schedules for **3, 7, 15, or 30 days**, prioritizing missing skills from the JD with interactive checklists. |
| **7** | **Fast Track (Urgent)** | Generates emergency high-ROI revision checklists for **1h, 3h, 6h, or 12h** timeframes with estimated times. |
| **8** | **Last Minute Guide** | Compact pre-interview survival cheat sheet: crucial CS concepts, must-know questions, elevator pitch, and a 15-minute sanity checklist. |
| **9** | **AI Career Assistant** | Context-aware AI chatbot loaded with your resume, JD, and target company for mock interviews, code explanations, and feedback. |
| **10** | **Bookmarks & History** | 1-click question bookmarking with personal study notes editor, category filters, and a complete preparation activity timeline. |

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js 18 (Vite 6)
- **Styling:** Tailwind CSS (Modern AI SaaS Aesthetic: Soft Slate & Navy Indigo Palette)
- **Icons:** Lucide React
- **Routing:** React Router DOM (v6)
- **HTTP Client:** Axios (with JWT interceptors)
- **Effects:** Canvas-Confetti

### Backend
- **Language & JDK:** Java 21 LTS
- **Framework:** Spring Boot 3.3.4
- **Security:** Spring Security 6 & JJWT (Java JSON Web Tokens 0.12.6)
- **ORM & Data:** Spring Data JPA / Hibernate 6
- **Database:** PostgreSQL 17 (with dynamic zero-setup in-memory H2 fallback)
- **PDF Extraction:** Apache PDFBox 3.0.3
- **AI Gateway:** Centralized LLM Gateway (Google Gemini API + Grok API Failover + Heuristic Engine)

---

## 📁 Project Structure

```text
NexOffer/
│
├── client/                      # React Frontend (Vite + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── components/          # Common components, ProfileStatusBanner
│   │   ├── context/             # AuthContext, ProfileContext (Upload Once Hub)
│   │   ├── layouts/             # DashboardLayout, AuthLayout
│   │   ├── pages/               # All 10 feature modules + Auth pages
│   │   ├── services/            # Axios API client
│   │   ├── App.jsx              # Routing and route guards
│   │   ├── index.css            # Tailwind directives
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # Node.js Express REST Backend
│   ├── config/                  # DB connection & LLM provider configurations
│   ├── controllers/            # Controllers for all 10 modules & Auth
│   ├── middleware/             # JWT auth, Multer PDF upload, Error handlers
│   ├── models/                 # Mongoose schemas (User, Profile, Bookmark, History, dbStore)
│   ├── routes/                 # Express route handlers
│   ├── services/               # Centralized LLM Gateway, Resume Parser, Email OTP
│   ├── scripts/                # Automated API verification test suite
│   ├── uploads/                # Local PDF resume storage
│   ├── .env.example            # Environment variable template
│   ├── package.json
│   └── server.js               # Main Express entry point
│
└── README.md
```

---

## ⚙️ Environment Variables

Create `server/.env` with the following configuration (or use the provided defaults):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/nexoffer
JWT_SECRET=nexoffer_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=7d

# LLM Gateway Configuration
# Primary: Google Gemini API (Get free key at https://aistudio.google.com/)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

# Fallback: Grok (xAI) API
GROK_API_KEY=
GROK_MODEL=grok-beta

# Email OTP Service (Leave blank to use development console logging)
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=NexOffer <noreply@nexoffer.com>
```

> **Note on Zero-Config Demo:** If `GEMINI_API_KEY` or `MONGODB_URI` are not provided, NexOffer automatically activates its **Zero-Downtime Intelligent Engine and Hybrid Storage**, ensuring all 10 modules function 100% out of the box!

---

## 🚀 Quick Start & Installation

### 1. Clone & Install Dependencies

```bash
# In the root NexOffer directory
npm run install-all
```

Or install manually in each folder:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

### 2. Running the Application

#### Option A: Run Backend & Frontend Concurrently (Root)

```bash
# Run backend server (Port 5000)
npm run server

# In a new terminal, run frontend client (Port 5173)
npm run client
```

#### Option B: Run individually

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Open your browser at **`http://localhost:5173`** to access the web application.

---

## 🧪 Automated Testing & Verification

NexOffer includes an end-to-end test suite that verifies all 15 REST endpoints in sequence:

```bash
cd server
node scripts/testEndpoints.js
```

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create account & trigger 6-digit OTP
- `POST /api/auth/verify-otp` — Verify OTP & activate account
- `POST /api/auth/resend-otp` — Resend verification OTP
- `POST /api/auth/login` — Authenticate user & return JWT
- `POST /api/auth/forgot-password` — Request password reset OTP
- `POST /api/auth/reset-password` — Reset password using OTP
- `GET  /api/auth/me` — Get current authenticated user details

### Profile & Resume Hub (`/api/profile`)
- `GET    /api/profile` — Fetch stored profile, JD, and resume data
- `PUT    /api/profile` — Update target company, role, JD, and resume text
- `POST   /api/profile/resume/upload` — Upload PDF resume and extract text
- `DELETE /api/profile/resume` — Clear resume data

### Core Preparation Modules
- `POST /api/resume/ats` — Run ATS compatibility and keyword scan
- `POST /api/interview/generate` — Generate 5-category interview Q&A
- `POST /api/resume-questions/generate` — Generate deep resume project questions
- `POST /api/skill-gap/analyze` — Compare Resume vs JD skill matrix
- `POST /api/company/research` — Retrieve company interview rounds & topics
- `POST /api/roadmap/generate` — Generate 3/7/15/30-day preparation schedule
- `POST /api/fast-track/generate` — Generate 1h/3h/6h/12h emergency sprint
- `POST /api/last-minute/generate` — Generate pre-call survival cheat sheet
- `POST /api/chat` — Context-aware AI career assistant chat

### Bookmarks & History
- `GET    /api/bookmarks` — List bookmarked questions with category filtering
- `POST   /api/bookmarks` — Save question to bookmarks
- `PUT    /api/bookmarks/:id` — Update personal notes on a bookmark
- `DELETE /api/bookmarks/:id` — Remove question from bookmarks
- `GET    /api/history` — Get preparation activity log
- `DELETE /api/history/:id` — Delete single history entry
- `DELETE /api/history` — Clear all preparation history

---

## 🎓 Academic Course Project Details

- **Project:** NexOffer — AI-Powered Interview Preparation Platform
- **Architecture:** MERN (MongoDB, Express, React, Node.js)
- **Tagline:** *Your Next Offer Starts Here.*
