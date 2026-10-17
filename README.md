# NT-assesment
## NexusWMS — AI-Governed Autonomous Warehouse & Inventory Management Platform

NexusWMS is a full-stack warehouse and inventory management platform designed to automate restocking operations and vendor verification, while enforcing human-in-the-loop governance for high-value business actions.

---

### 🚀 Key Features

* **Real-Time Inventory & Movement Ledger:** SKU catalog with safety stock thresholds, double-entry stock transactions (`STOCK_IN` / `STOCK_OUT`), and stock health indicators.
* **Client & Vendor Activation Lifecycle:** Vendor on-boarding state machine (`PENDING_VERIFICATION` ➔ `ACTIVE` ➔ `SUSPENDED`).
* **Autonomous AI Restock Agent:** Scans inventory for critical stockouts, evaluates active supplier rates and delivery times, and drafts optimized purchase orders.
* **Deterministic Risk Engine (HITL):** Evaluates financial and operational risk scores (0–100). High-impact actions are held in an interactive review queue for manager approval before execution.
* **Role-Based Access Control:** Separate permissions for `ADMIN`, `MANAGER`, and `STAFF`.

---

### 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router, TypeScript)
* **Styling:** Tailwind CSS (Dark Slate Industrial Design System)
* **Icons:** Lucide Icons
* **Database & ORM:** PostgreSQL / SQLite with Prisma ORM
* **AI Model:** Google Gemini 1.5 Flash (Structured Output Mode)
* **Validation & Security:** Zod, JWT, bcryptjs

---

### 💻 Getting Started Locally

#### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ProgramerPritom/NT-assesment.git
npm install
```

#### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="nexus_super_secret_jwt_key_2026"
GEMINI_API_KEY="your_gemini_api_key_here"
```

#### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 👥 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@nexus.com` | `password123` | Full system access & team management |
| **Manager** | `manager@nexus.com` | `password123` | Client activation & AI approval governance |
| **Staff** | `staff@nexus.com` | `password123` | Inventory viewing & stock movements |

---
*Created for: Full-Stack Project Assessment*
