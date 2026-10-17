# 🗄️ NexusWMS — Database & ORM Implementation Plan (Phase-by-Phase)

এই প্ল্যানে Prisma ORM কনফিগারেশন, রিলেশনাল ডাটাবেজ মডেলিং, ডাটাবেজ মাইগ্রেশন এবং রিয়েলিস্টিক সিড ডাটা জেনারেশনের ফেজ-ভিত্তিক রূপরেখা দেওয়া হলো।

---

### 🔑 এই সেকশনে প্রয়োজনীয় ক্রেডেনশিয়াল:
* `DATABASE_URL`: 
  - **লোকাল ডেভেলপমেন্টের জন্য:** `file:./dev.db` (কোনো পাসওয়ার্ড বা ক্লাউড দরকার নেই, অটোমেটিক লোকাল ফাইলে কাজ করবে)।
  - **প্রোডাকশন ফ্রি ডেপ্লয়মেন্টের জন্য:** [Neon.tech](https://neon.tech) বা [Supabase.com](https://supabase.com) থেকে সংগৃহীত ফ্রি PostgreSQL কানেকশন স্ট্রিং।

---

### 📑 ডাটাবেজের ৪টি সুনির্দিষ্ট ফেজ:

---

#### 🔹 Phase 1: Prisma Client Configuration & Multi-Provider Strategy
* **উদ্দেশ্য:** ডাটাবেজ ক্লায়েন্ট ইনিশিয়ালাইজ করা এবং লোকাল/প্রোডাকশন সুইচের সহজ ব্যবস্থা রাখা।
* **যা তৈরি হবে:**
  - `prisma/schema.prisma`: প্রোভাইডার কনফিগারেশন।
  - `lib/prisma.ts`: গ্লোবাল সিঙ্গেলটন Prisma ক্লায়েন্ট ইনস্ট্যান্স (যাতে Next.js হট-রিলোডের সময় অতিরিক্ত ডাটাবেজ কানেকশন না তৈরি হয়)।
* **✅ Definition of Done (DOD):**
  - [ ] `lib/prisma.ts` ইমপোর্ট করে সাধারণ টেস্ট কুয়েরি চালালে কোনো কানেকশন লিক বা ডুপ্লিকেট ক্লায়েন্ট এরর দেয় না।

---

#### 🔹 Phase 2: Schema Modeling & Relational Integrity
* **উদ্দেশ্য:** ৭টি পারস্পরিক সম্পর্কযুক্ত (Interconnected) মডেল তৈরি এবং ফরেন কি ও ক্যাস্কেড ডিলিট রুলস ডিফাইন করা।
* **মডেলসমূহ:**
  1. `User`: id, name, email, password, role (`ADMIN`, `MANAGER`, `STAFF`), timestamps.
  2. `Client`: id, name, email, taxNumber, status (`PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`), creditLimit, timestamps.
  3. `Product`: id, sku (unique), name, category, unitPrice, currentStock, minSafetyStock, warehouseBin, clientId (Supplier FK), timestamps.
  4. `StockMovement`: id, productId (Product FK), type (`STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT`), quantity, reason, userId (User FK), createdAt.
  5. `AIWorkflowTask`: id, productId (Product FK), actionType, suggestedQty, estimatedCost, aiConfidence, aiReasoning, riskScore, riskLevel (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), status (`QUEUED`, `AWAITING_APPROVAL`, `EXECUTED`, `REJECTED`), proposedPayload (JSON string), timestamps.
  6. `ApprovalDecision`: id, taskId (AIWorkflowTask FK - 1:1), decision (`APPROVED`, `REJECTED`), comments, decidedById (User FK), createdAt.
  7. `PurchaseOrder`: id, orderNumber (unique), productId (Product FK), supplierId (Client FK), quantity, totalAmount, status, taskId (AIWorkflowTask FK), createdAt.
* **✅ Definition of Done (DOD):**
  - [ ] `npx prisma validate` কোনো সিনট্যাক্স বা রিলেশন এরর ছাড়াই পাস করে।
  - [ ] প্রডাক্ট ডিলিট করলে রিলেটেড ডাটা সঠিক ক্যাস্কেড নিয়মে হ্যান্ডেল হয়।

---

#### 🔹 Phase 3: Database Push & Migration
* **উদ্দেশ্য:** স্কিমাকে ফিজিক্যাল ডাটাবেজে কনভার্ট করা এবং টাইপ-সেফ Prisma ক্লায়েন্ট জেনারেট করা।
* **যা সম্পন্ন হবে:**
  - `npx prisma db push` কমান্ড দিয়ে লোকাল ডাটাবেজে সব টেবিল ও ইনডেক্স তৈরি করা।
  - `npx prisma generate` দিয়ে TypeScript টাইপস আপডেট করা।
* **✅ Definition of Done (DOD):**
  - [ ] ডাটাবেজে ৭টি টেবিল সফলভাবে তৈরি হয়েছে এবং Prisma Client থেকে সবকটি মডেলের টাইপ পাওয়া যায়।

---

#### 🔹 Phase 4: Realistic Seed Data Generation
* **উদ্দেশ্য:** ডেমো ও মূল্যায়নের জন্য বাস্তবসম্মত ডাটা দিয়ে ডাটাবেজ পূর্ণ করা।
* **যা সিড ফাইলে (`prisma/seed.ts`) থাকবে:**
  - **৩ জন ডেমো ইউজার:**
    - `admin@nexus.com` (Role: `ADMIN`, Password: `password123`)
    - `manager@nexus.com` (Role: `MANAGER`, Password: `password123`)
    - `staff@nexus.com` (Role: `STAFF`, Password: `password123`)
  - **৪ জন ক্লায়েন্ট/সাপ্লায়ার:**
    - Silicon Logistics (`ACTIVE`)
    - Global Cloud Hardware (`ACTIVE`)
    - FastTrack Cargo (`PENDING_VERIFICATION` - ভেরিফিকেশন টেস্ট করার জন্য)
    - Shady Tech Ltd (`SUSPENDED` - সাসপেনশন টেস্ট করার জন্য)
  - **১০টি ওয়্যারহাউজ প্রোডাক্ট:**
    - কিছু স্বাস্থ্যকর স্টকের প্রোডাক্ট (যেমন: 150 pcs, Safety limit: 30)
    - ২টি ক্রিটিক্যাল লো-স্টক প্রোডাক্ট (যেমন: Crucial 1TB SSD - মাত্র 4 pcs বাকি, Safety limit: 30) যাতে এআই রিস্টক ফিচারটি টেস্ট করা যায়।
  - **পূর্বের স্টক মুভমেন্ট হিস্ট্রি ও অডিট লগস।**
* **✅ Definition of Done (DOD):**
  - [ ] `npm run db:seed` চালালে কোনো এরর ছাড়াই ১০০% সিড ডাটা ইনসার্ট হয়।
  - [ ] অ্যাডমিন, ম্যানেজার ও স্টাফ ক্রেডেনশিয়াল দিয়ে সরাসরি লগইন করা যায়।

---
*End of Database Implementation Plan*
