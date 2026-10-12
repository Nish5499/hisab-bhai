# 🪙 HisabBhai — “Bhai, hisaab clear kar!”

> **The intuitive Indian expense-sharing application with an animated Neo-Brutalism interface, zero paise currency leakage, and instant debt simplification.**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-yellow.svg)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)

---

## 🌟 Key Features

1. **Integer Paise Precision (Zero Paise Leakage):**
   - Monetary amounts are calculated and stored in integer paise (1 Rupee = 100 Paise).
   - Zero floating-point drift: ₹100 split 3 ways is deterministically partitioned into 33.34, 33.33, and 33.33 without losing 1 paise.

2. **Explicit Member Exclusion (Critical Feature):**
   - Did Neha skip biryani dinner? Did Amit leave before drinks?
   - Tap "Exclude" on any participant for any expense. They receive strictly ₹0 liability while other members split the bill accurately.

3. **Animated Money-Flow Visualizer (Signature Feature):**
   - Interactive visual graph built with Framer Motion.
   - Watch payer nodes, participant allocations, and debt flow arrows step-by-step with replay capability.

4. **Greedy Debt Simplification Algorithm:**
   - Translates complicated group debts into the minimal set of direct transfers.
   - Settle up directly with UPI deep links (`upi://pay`).

5. **Neo-Brutalism Indian Design System:**
   - High-contrast yellow (`#FFE600`), electric pink (`#FF4D8D`), and cobalt blue (`#2B59FF`).
   - 2–3px crisp black borders with hard offset shadows (`4px 4px 0px #000`).
   - Friendly Hinglish microcopy tailored for Indian roommates, trips, and tapri chai.

6. **Instant Interactive Demo Mode:**
   - Test the complete app immediately out of the box with realistic Indian personas (Rahul, Priya, Amit, Neha) and flatmate expenses without configuring Supabase.
   - Switch seamlessly to live Supabase PostgreSQL and Google OAuth anytime.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v3.4 (Custom Neo-Brutalist design tokens) |
| **Animation** | Framer Motion (Motion for React) + Canvas-Confetti |
| **Routing** | React Router v7 |
| **Icons** | Lucide React |
| **Backend & DB** | Supabase PostgreSQL with Row Level Security (RLS) & RPC functions |
| **Auth** | Supabase Auth (Google OAuth & Email/Password) |
| **Testing** | Vitest + React Testing Library |
| **Deployment** | Cloudflare Pages (with SPA fallback & security headers) |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js `v20+` or `v22+`
- npm `v10+`

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/nischay5499/splitwise.git
cd splitwise
npm install
```

### 3. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```

By default, `.env` includes `VITE_DEMO_MODE=true` for instant local testing. To connect your live Supabase database, set:
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_APP_URL=http://localhost:5173
VITE_DEMO_MODE=false
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Automated Tests

```bash
# Run Vitest test suite (9 unit tests + 2 component tests)
npm test

# Run tests in watch mode
npx vitest
```

---

## 🏗️ Production Build

```bash
npm run build
```
This produces an optimized production bundle in `dist/` ready for Cloudflare Pages.

---

## 📁 Repository Structure

```text
├── docs/
│   ├── ARCHITECTURE.md           # Architecture, data model & financial engine specs
│   ├── CLOUDFLARE_DEPLOYMENT.md  # Cloudflare Pages production deployment guide
│   ├── GOOGLE_OAUTH_SETUP.md     # Google Cloud & Supabase OAuth configuration
│   ├── PRODUCTION_CHECKLIST.md   # Pre-flight security & release checklist
│   ├── SUPABASE_SETUP.md         # Database schema, RLS policies & migration guide
│   └── TESTING.md                # Automated tests and manual smoke test checklist
├── public/
│   ├── _headers                  # Cloudflare security & cache headers
│   └── _redirects                # Cloudflare Pages SPA client-side routing
├── src/
│   ├── components/
│   │   ├── layout/               # Navbar (with Indian actor switcher) & BottomNav
│   │   ├── money/                # Animated MoneyFlowVisualizer component
│   │   ├── settlement/           # SettlementModal with UPI & confetti
│   │   └── ui/                   # Reusable Neo-Brutalist Button, Card, Avatar, Badge, Modal
│   ├── features/
│   │   ├── auth/                 # AuthContext (Google OAuth + Demo switcher)
│   │   └── data/                 # DataContext (Expenses, Groups, Settlements, RLS)
│   ├── lib/
│   │   ├── demo/                 # Indian demo personas (Flat 402, Goa Trip)
│   │   ├── money/                # Authoritative integer paise split & debt engine
│   │   └── supabase/             # Supabase client initializer
│   ├── pages/                    # 14 complete screens (Dashboard, Expenses, Groups, etc.)
│   ├── test/                     # Vitest environment setup
│   ├── types/                    # Core TypeScript definitions
│   ├── App.tsx                   # Main router and layout
│   ├── index.css                 # Neo-Brutalist CSS tokens & utility classes
│   └── main.tsx                  # React DOM mount point
├── supabase/
│   ├── migrations/               # PostgreSQL schema & RLS policies
│   └── seed.sql                  # Realistic Indian test seed data
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 📚 Detailed Documentation

- [System Architecture & Financial Engine](docs/ARCHITECTURE.md)
- [Google OAuth Configuration](docs/GOOGLE_OAUTH_SETUP.md)
- [Supabase Setup & RLS Migrations](docs/SUPABASE_SETUP.md)
- [Cloudflare Pages Deployment](docs/CLOUDFLARE_DEPLOYMENT.md)
- [Testing & Smoke Test Checklist](docs/TESTING.md)
- [Production Readiness Checklist](docs/PRODUCTION_CHECKLIST.md)

---

## 📄 License

MIT License. Built with ❤️ for roommates, trips, and chai breaks.
