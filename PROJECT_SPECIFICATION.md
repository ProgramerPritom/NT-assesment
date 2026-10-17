# NexusWMS — AI-Governed Autonomous Warehouse & Client Activation Platform
## 📋 Comprehensive System Specification & Architecture Blueprint

---

### 1. Executive Summary & Assessment Alignment

**NexusWMS** is an enterprise-grade full-stack platform designed to solve real-world supply chain challenges: **Automating warehouse restocking and vendor management using AI Agents, while eliminating catastrophic autonomous errors through a deterministic Human-in-the-Loop (HITL) Governance Engine.**

#### 💯 100-Mark Rubric Mapping

| Assessment Category | Weight | How NexusWMS Fulfills & Exceeds Requirements |
| :--- | :---: | :--- |
| **Backend, APIs & Business Logic** | **20** | Full RESTful APIs with atomic transactions, full CRUD for Products, Users, and Clients, stock movement ledger (IN/OUT), client verification state machine, and a mathematical **Risk Scoring Engine**. |
| **Frontend & User Experience (UX)** | **15** | Sleek responsive dashboard (dark slate industrial theme), modal dialogs, loading skeletons, error boundaries, action drawers, and live visual AI reasoning feeds. |
| **Database & Data Handling** | **15** | Relational database (Prisma ORM + PostgreSQL/SQLite) with 7 interconnected models: Users, Clients, Products, StockMovements, PurchaseOrders, AIWorkflowTasks, and ApprovalDecisions. |
| **Security & Validation** | **10** | JWT-based authentication, Role-Based Access Control (`ADMIN`, `MANAGER`, `STAFF`), strict Zod validation on API inputs and forms, password hashing with `bcryptjs`. |
| **AI / ML Feature & Explanation** | **10** | Google Gemini 1.5 Flash structured output engine analyzing stockouts, vendor lead times, and unit economics; calculates AI confidence score with clear limitations and fallbacks. |
| **Problem Solving & Planning** | **10** | Directly tackles supply chain stockouts, vendor fraud/verification, and AI agent hallucination risks in enterprise operations. |
| **Code Quality, Testing & Git** | **10** | Clean modular architecture (Separation of Concerns: Controllers, Services, Repositories), automated Vitest/Jest unit tests for critical business logic, and atomic Git commit history. |
| **Live Demonstration & Technical Review** | **10** | Seamless end-to-end interactive demo: trigger stockout ➔ AI drafts PO ➔ Risk engine halts high-value action ➔ Manager approves ➔ Stock auto-updates. |
| **Total Marks** | **100** | **Ready for Full Score Submission** |

---

### 2. Tech Stack & 100% Free Deployment Architecture

To ensure your application runs smoothly without any hosting cost or server sleeping delays, we have carefully evaluated the options:

#### Next.js vs. React (Vite) + Express Comparison

| Feature | Option A: Next.js (App Router) Fullstack | Option B: React (Vite) + Separate Express Backend |
| :--- | :--- | :--- |
| **Free Hosting** | **Vercel (100% Free Hobby Tier)** | Frontend on Vercel/Netlify + Backend on Render/Railway |
| **Cold Start Delay** | **ZERO cold start.** Vercel Serverless runs instantly. | **Severe 50+ sec delay.** Render free instances sleep after 15 mins of inactivity. (Risky in live demo!) |
| **Deployment Effort** | **1-Click single git push.** Frontend and API routes deploy together. | Needs 2 separate deployments, 2 git repos/configs, and CORS configuration. |
| **Verdict** | ⭐ **RECOMMENDED WINNER** — Clean, professional, and reliable. | More complex setup with high risk of cold-start lag during review. |

#### 💸 The 100% Free Stack Breakdown

1. **Frontend & Backend API:** **Next.js (TypeScript, App Router)** deployed on **Vercel (Free)**.
2. **Database:** **Neon Serverless PostgreSQL (Free Tier)** or **Supabase PostgreSQL (Free Tier)**.
   - Provides a standard PostgreSQL connection string (`postgresql://...`).
   - Neon provides 0.5 GB free storage, auto-scaling, and zero setup cost.
   - For local development, you can even toggle to local **SQLite** (`file:./dev.db`) instantly via Prisma.
3. **ORM:** **Prisma ORM** (Type-safe DB queries, migrations, auto-generated TypeScript clients).
4. **AI Engine:** **Google Gemini 1.5 Flash API (Free Tier)**.
   - Google AI Studio provides a free API key with 15 Requests Per Minute (RPM) and 1M Tokens Per Minute (TPM) without requiring a credit card.
5. **Styling & UI:** **Tailwind CSS** + **Lucide Icons** (Slate/Zinc modern dark theme with smooth micro-animations).
6. **Authentication:** **JWT (JSON Web Token)** stored in HTTP-only cookies or bearer header + **bcryptjs** password encryption.
7. **Validation:** **Zod** schema validation for forms and API requests.

---

### 3. Core Modules & Complete CRUD Specifications

#### 📦 Module 1: Product Management (Full CRUD)
* **Create (Insert Product):**
  - UI: `[ + Add Product ]` modal/drawer.
  - Fields: `name`, `sku` (auto-generated or manual), `category`, `unitPrice`, `minSafetyStock`, `warehouseBin` (e.g. Zone-A1), `clientId` (Supplier).
  - Validation: SKU unique check, positive price and stock values.
* **Read (View Products):**
  - UI: Searchable, paginated, and filterable data table.
  - Features: Real-time stock status badge (`Healthy`, `Low Stock Alert`, `Critical Depletion`), search by SKU or Name, category filters.
  - Product Detail View (`/inventory/[id]`): Stock movement history ledger, supplier details, warehouse location bin map.
* **Update (Edit Product):**
  - UI: `[ ✏️ Edit ]` icon on each product row.
  - Fields: Update price, safety threshold, name, category, warehouse bin.
* **Delete (Remove Product):**
  - UI: `[ 🗑️ Delete ]` icon with safety confirmation modal.
  - Business Logic: Prevents deletion if the product has active purchase orders or pending AI tasks; otherwise soft-deletes or removes cleanly.

#### 👥 Module 2: User & Team Management (Full CRUD)
* **Create (Add Team Member):**
  - UI: `[ + Add User ]` modal in the `/users` management page.
  - Fields: `name`, `email`, `password` (auto-hashed with `bcryptjs`), `role` (`ADMIN`, `MANAGER`, `STAFF`).
* **Read (User Directory):**
  - UI: Table of all system users with their active roles, email, and creation timestamps.
* **Update (Edit User Profile/Role):**
  - UI: Edit modal to change user role (e.g., promote `STAFF` to `MANAGER`) or update name/email.
* **Delete (Deactivate/Remove User):**
  - UI: Deactivate button with confirmation. An admin cannot delete their own account.

#### 🏢 Module 3: Client & Supplier Management (Full CRUD + Activation Workflow)
* **Create (Register Client/Supplier):**
  - UI: `[ + Register Client ]` form.
  - Fields: `name`, `email`, `taxNumber` (BIN/EIN), `creditLimit`, `paymentTerms` (Net 30/60).
  - Default Status: `PENDING_VERIFICATION`.
* **Read (Client Directory):**
  - UI: Table with status tabs (`All`, `Pending Verification`, `Active`, `Suspended`).
* **Update (Edit Client & Status):**
  - Fields: Edit contact details or credit limit.
  - **State Machine Actions:**
    - `[ ✅ Verify & Activate ]`: Moves client from `PENDING_VERIFICATION` ➔ `ACTIVE`.
    - `[ ⛔ Suspend ]`: Moves client to `SUSPENDED` if terms are violated.
* **Delete (Remove Client):**
  - Remove inactive clients without purchase history.

#### 🔄 Module 4: Double-Entry Stock Movement Ledger
* **Stock In (`STOCK_IN`):** When goods arrive at the warehouse. Increases `currentStock`, logs transaction with quantity, supplier, and timestamp.
* **Stock Out (`STOCK_OUT`):** When goods are dispatched. Decreases `currentStock`.
  - **Validation:** If `requestedQuantity > currentStock`, throws error `400 Bad Request: Insufficient inventory`. Prevents negative stock.
* **Stock Adjustment (`ADJUSTMENT`):** For manual cycle counts and discrepancy corrections with audited reason notes.

#### 🤖 Module 5: Autonomous AI Restock Agent (Gemini 1.5 Flash)
* Scans products where `currentStock <= minSafetyStock`.
* Matches with active suppliers (`client.status === 'ACTIVE'`) based on lead time and unit pricing.
* Emits structured JSON:
  - `recommendedSupplierId`: Selected vendor.
  - `recommendedQuantity`: Optimal reorder batch.
  - `estimatedCost`: Calculated financial impact.
  - `aiConfidence`: Confidence score (0% – 100%).
  - `reasoningTrace`: Plain-English explanation of why this vendor and quantity were chosen.

#### ⚖️ Module 6: Human-in-the-Loop (HITL) Governance & Risk Engine
* **The Mathematical Blast Radius Risk Formula (0 - 100):**
  $$\text{Financial Factor} = \min\left(100, \frac{\text{Total Cost}}{\$2000} \times 50\right)$$
  $$\text{Confidence Factor} = (100 - \text{AI Confidence Score}) \times 0.3$$
  $$\text{Supplier Factor} = \text{Client is New ? } 20 : 0$$
  $$\mathbf{\text{Risk Score}} = \text{Financial Factor} + \text{Confidence Factor} + \text{Supplier Factor}$$

* **Automated Decision Routing:**
  - **Risk Score < 60 (Low/Medium Risk):** Auto-approved, recorded in audit logs.
  - **Risk Score >= 60 (High/Critical Risk):** Task paused in `AWAITING_APPROVAL` status.
* **Interactive Approval Drawer:**
  - Manager inspects AI reasoning, confidence, and financial cost.
  - Action buttons: `[ ✅ Approve & Execute ]`, `[ ❌ Reject with Reason ]`, `[ ✏️ Edit Quantity ]`.
  - On approval, database atomically updates stock and generates a confirmed Purchase Order.

---

### 4. Complete Routing Architecture

#### A. Frontend Routes (Pages & Views)

| Route Path | Page Title | Access Level | Description & Core UI Elements |
| :--- | :--- | :--- | :--- |
| `/login` | Authentication | Public | Login card with 1-Click Demo Credentials (`Admin`, `Manager`, `Staff`). Smooth error feedback. |
| `/` or `/dashboard` | Operations Hub | All Roles | KPI Cards (Total Inventory Value, Low Stock Alerts, Active Suppliers, Pending Approvals), AI Quick Scanner button. |
| `/inventory` | Inventory & Ledger | All Roles | Products table with stock status badges, `[+ Add Product]` drawer, `[Stock In/Out]` modal, Edit & Delete buttons. |
| `/inventory/[id]` | Product Details | All Roles | Transaction history ledger, warehouse bin location, supplier info, threshold adjuster. |
| `/clients` | Client Activation | `MANAGER`, `ADMIN` | Client CRUD table with status badges (`PENDING`, `ACTIVE`, `SUSPENDED`), 1-click Activate & Suspend buttons. |
| `/users` | User & Team Mgmt | `ADMIN` | User CRUD table, Add User modal, Role update dropdown (`ADMIN`, `MANAGER`, `STAFF`), Deactivate user. |
| `/governance` | AI Approval Queue | `MANAGER`, `ADMIN` | List of paused AI tasks, risk badges (`Low`, `Medium`, `High`), side drawer with reasoning timeline & Approve/Reject buttons. |
| `/audit-logs` | Compliance Audit | `ADMIN` | Immutable chronological log of all stock movements, client activations, and human approval decisions. |

#### B. Complete Backend REST API Endpoints

```
AUTHENTICATION & USERS
POST   /api/auth/login                  -> Authenticate user, return JWT + role info
GET    /api/auth/me                     -> Get current authenticated session
GET    /api/users                       -> List all users (User Read All) [Admin]
POST   /api/users                       -> Create new user (User Create) [Admin]
GET    /api/users/:id                   -> Get single user details (User Read Single)
PUT    /api/users/:id                   -> Update user role or profile (User Update) [Admin]
DELETE /api/users/:id                   -> Delete/Deactivate user (User Delete) [Admin]

PRODUCTS CRUD & INVENTORY
GET    /api/products                    -> List all products with current stock & filter/search (Product Read All)
POST   /api/products                    -> Create a new product SKU (Product Create) [Admin/Manager]
GET    /api/products/:id                -> Single product detail & movement history (Product Read Single)
PUT    /api/products/:id                -> Update product details & safety thresholds (Product Update) [Admin/Manager]
DELETE /api/products/:id                -> Delete/Archive product (Product Delete) [Admin/Manager]
POST   /api/products/:id/movement       -> Atomic Stock In / Stock Out operation (Double-entry ledger)

CLIENT & VENDOR CRUD & ACTIVATION
GET    /api/clients                     -> List all clients/suppliers with status filter (Client Read All)
POST   /api/clients                     -> Register new client (Client Create)
GET    /api/clients/:id                 -> Single client profile & orders (Client Read Single)
PUT    /api/clients/:id                 -> Update client details & credit limit (Client Update)
DELETE /api/clients/:id                 -> Remove client (Client Delete) [Admin]
PATCH  /api/clients/:id/status          -> Change status: PENDING_VERIFICATION -> ACTIVE / SUSPENDED [Manager/Admin]

AI WORKFLOW & GOVERNANCE (HITL)
POST   /api/ai/analyze-stockouts        -> Trigger AI agent to scan inventory & draft restock proposals
GET    /api/governance/tasks            -> List all AI tasks (filter by AWAITING_APPROVAL, EXECUTED)
GET    /api/governance/tasks/:id        -> Get task reasoning trace, confidence, and payload
POST   /api/governance/tasks/:id/approve -> Execute approved task, update stock, create Purchase Order [Manager/Admin]
POST   /api/governance/tasks/:id/reject  -> Reject task with mandatory reason comments [Manager/Admin]
```

---

### 5. Relational Database Schema (Prisma ORM)

```prisma
datasource db {
  provider = "postgresql" // Works with Neon / Supabase. Can switch to "sqlite" for offline dev.
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  MANAGER
  STAFF
}

enum ClientStatus {
  PENDING_VERIFICATION
  ACTIVE
  SUSPENDED
}

enum MovementType {
  STOCK_IN
  STOCK_OUT
  ADJUSTMENT
}

enum TaskStatus {
  QUEUED
  ANALYZING
  AWAITING_APPROVAL
  EXECUTED
  REJECTED
  FAILED
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(STAFF)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  movements StockMovement[]
  decisions ApprovalDecision[]
}

model Client {
  id          String       @id @default(cuid())
  name        String
  email       String       @unique
  taxNumber   String       @unique
  status      ClientStatus @default(PENDING_VERIFICATION)
  creditLimit Float        @default(10000.0)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // Relations
  products       Product[]
  purchaseOrders PurchaseOrder[]
}

model Product {
  id              String   @id @default(cuid())
  sku             String   @unique
  name            String
  category        String
  unitPrice       Float
  currentStock    Int      @default(0)
  minSafetyStock  Int      @default(10)
  warehouseBin    String   @default("Zone-A1")
  clientId        String?
  client          Client?  @relation(fields: [clientId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  movements      StockMovement[]
  workflowTasks  AIWorkflowTask[]
  purchaseOrders PurchaseOrder[]
}

model StockMovement {
  id          String       @id @default(cuid())
  productId   String
  product     Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  type        MovementType
  quantity    Int
  reason      String
  userId      String
  user        User         @relation(fields: [userId], references: [id])
  createdAt   DateTime     @default(now())
}

model AIWorkflowTask {
  id               String      @id @default(cuid())
  productId        String
  product          Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  actionType       String      // e.g. "RESTOCK_PURCHASE_ORDER"
  suggestedQty     Int
  estimatedCost    Float
  aiConfidence     Int         // 0 - 100
  aiReasoning      String
  riskScore        Int         // 0 - 100
  riskLevel        RiskLevel
  status           TaskStatus  @default(AWAITING_APPROVAL)
  proposedPayload  String      // JSON string of order parameters
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  // Relations
  decision         ApprovalDecision?
  purchaseOrder    PurchaseOrder?
}

model ApprovalDecision {
  id          String         @id @default(cuid())
  taskId      String         @unique
  task        AIWorkflowTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  decision    String         // "APPROVED" or "REJECTED"
  comments    String?
  decidedById String
  decidedBy   User           @relation(fields: [decidedById], references: [id])
  createdAt   DateTime       @default(now())
}

model PurchaseOrder {
  id          String          @id @default(cuid())
  orderNumber String          @unique
  productId   String
  product     Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  supplierId  String
  supplier    Client          @relation(fields: [supplierId], references: [id])
  quantity    Int
  totalAmount Float
  status      String          @default("CONFIRMED")
  taskId      String?         @unique
  task        AIWorkflowTask? @relation(fields: [taskId], references: [id])
  createdAt   DateTime        @default(now())
}
```

---

### 6. UI/UX Design System & Aesthetics

* **Color Palette:**
  - Background: Slate 950 / Zinc 900 (`#090D16` / `#111827`)
  - Surface Cards: Slate 900 with subtle borders (`#1E293B`, border: `#334155`)
  - Primary Accent: Indigo / Electric Blue (`#6366F1`)
  - Status Colors: Emerald 500 (Success/Active), Amber 500 (Warning/Awaiting Approval), Rose 500 (Critical/Suspended)
* **Interactive UI States:**
  - **Loading:** Shimmer skeletons matching table columns and card layouts.
  - **Success:** Floating toast messages with progress indicator.
  - **Error:** Dismissible inline banners with helpful error explanations.
  - **Empty States:** Clean illustration icons with a "Create your first product" call to action.

---

### 7. Step-by-Step 100% Free Deployment Guide

```
Step 1: Database (Neon PostgreSQL)
  1. Visit neon.tech (Sign up with GitHub for free).
  2. Create a free project named "nexus-wms".
  3. Copy the provided connection string: postgresql://[user]:[password]@[host]/nexus-wms?sslmode=require
  4. Paste into your .env as DATABASE_URL.

Step 2: AI Engine (Google Gemini)
  1. Visit aistudio.google.com.
  2. Click "Get API Key" (100% Free, no credit card required).
  3. Paste into your .env as GEMINI_API_KEY.

Step 3: Web App & Hosting (Vercel)
  1. Push your code to GitHub.
  2. Visit vercel.com -> "Add New Project" -> Select your repository.
  3. Add Environment Variables:
     - DATABASE_URL: (from Neon)
     - GEMINI_API_KEY: (from Google)
     - JWT_SECRET: (a secure random string)
  4. Click "Deploy".
  5. Your app is live with a secure HTTPS URL (e.g., https://nexus-wms.vercel.app) in under 2 minutes with ZERO cold-start delay!
```

---
*Created for: Full-Stack Project Assessment | Project: NexusWMS*
