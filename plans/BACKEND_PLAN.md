# ⚙️ NexusWMS — Backend & API Implementation Plan (Phase-by-Phase)

এই প্ল্যানে ব্যাকএন্ড REST API এন্ডপয়েন্টস, ডাটা ভ্যালিডেশন, অথেনটিকেশন মিডলওয়্যার এবং বিজনেস সার্ভিসের ফেজ-ভিত্তিক রূপরেখা দেওয়া হলো।

---

### 🔑 এই সেকশনে প্রয়োজনীয় ক্রেডেনশিয়াল:
* `JWT_SECRET`: অথেনটিকেশন টোকেন সাইন ও ভেরিফাই করার জন্য একটি নিরাপদ সিক্রেট স্ট্রিং (ডিফল্ট স্ট্রিং `.env`-এ দেওয়া থাকবে)।

---

### 📑 ব্যাকএন্ডের ৬টি সুনির্দিষ্ট ফেজ:

---

#### 🔹 Phase 1: API Architecture & Security Middlewares
* **উদ্দেশ্য:** রিকোয়েস্ট হ্যান্ডলিং, সেন্ট্রালাইজড এরর হ্যান্ডলার, JWT ভেরিফিকেশন এবং রোল-বেসড এক্সেস কন্ট্রোল (RBAC) মিডলওয়্যার তৈরি করা।
* **যা তৈরি হবে:**
  - `lib/auth.ts`: JWT টোকেন জেনারেশন এবং ভেরিফিকেশন ইউটিলিটি।
  - `lib/api-response.ts`: ইউনিফাইড API রেসপন্স হেল্পার (`successResponse`, `errorResponse`)।
  - `middleware.ts`: সুরক্ষিত রুটের জন্য রিকোয়েস্ট ইন্টারসেপ্টর এবং রোল ভেরিফায়ার (`ADMIN`, `MANAGER`, `STAFF`)।
* **✅ Definition of Done (DOD):**
  - [ ] মিডলওয়্যার দিয়ে ইনভ্যালিড বা এক্সপায়ার্ড টোকেনকে সাথে সাথে `401 Unauthorized` রিটার্ন করা হয়।
  - [ ] সাধারণ স্টাফ ম্যানেজার-লেভেলের এন্ডপয়েন্টে হিট করলে `403 Forbidden` রিটার্ন পায়।

---

#### 🔹 Phase 2: Authentication & User Management APIs
* **উদ্দেশ্য:** লগইন, সেশন ভেরিফিকেশন এবং ইউজার CRUD এন্ডপয়েন্টস তৈরি।
* **যা তৈরি হবে:**
  - `POST /api/auth/login`:
    - ইনপুট: `{ email, password }`
    - লজিক: `bcryptjs.compare` দিয়ে পাসওয়ার্ড চেক, ভ্যালিড হলে JWT কুকি/টোকেন রিটার্ন।
  - `GET /api/auth/me`: বর্তমান লগইন থাকা ইউজারের ডাটা রিটার্ন।
  - `GET /api/users`: সব ইউজারের তালিকা [Admin Only]।
  - `POST /api/users`: নতুন ইউজার তৈরি (পাসওয়ার্ড অটোমেটিক হ্যাশ হবে) [Admin Only]।
  - `PUT /api/users/:id`: ইউজারের রোল বা ডাটা আপডেট [Admin Only]।
  - `DELETE /api/users/:id`: ইউজার রিমুভ বা ডিঅ্যাক্টিভেট করা [Admin Only]।
* **✅ Definition of Done (DOD):**
  - [ ] ভুল পাসওয়ার্ড দিলে নিরাপদ `401 Invalid Credentials` এরর মেসেজ আসে।
  - [ ] অ্যাডমিন ছাড়া অন্য কেউ ইউজার তৈরি বা রোল পরিবর্তন করতে পারে না।

---

#### 🔹 Phase 3: Client & Supplier Management APIs
* **উদ্দেশ্য:** ক্লায়েন্ট অনবোর্ডিং, লিস্ট ফিল্টারিং এবং ভেরিফিকেশন স্টেট মেশিন লজিক।
* **যা তৈরি হবে:**
  - `GET /api/clients`: সব ক্লায়েন্টদের তালিকা (Query param: `?status=PENDING_VERIFICATION`).
  - `POST /api/clients`: নতুন ক্লায়েন্ট রেজিস্টার (Zod দিয়ে Tax Number ও Email ভ্যালিডেশন)।
  - `PUT /api/clients/:id`: ক্লায়েন্টের কন্টাক্ট বা ক্রেডিট লিমিট আপডেট।
  - `PATCH /api/clients/:id/status`:
    - ইনপুট: `{ status: "ACTIVE" | "SUSPENDED", note?: string }`
    - লজিক: ম্যানেজার/এডমিন অনুমোদন করলে স্ট্যাটাস আপডেট হবে এবং অডিট লগে সেভ হবে।
* **✅ Definition of Done (DOD):**
  - [ ] ডুপ্লিকেট Tax Number বা Email দিয়ে ক্লায়েন্ট রেজিস্টার করতে গেলে `409 Conflict` রিটার্ন করে।
  - [ ] ক্লায়েন্ট অ্যাক্টিভেশন স্টেট ট্রানজিশন ডাটাবেজে পারসিস্ট হয়।

---

#### 🔹 Phase 4: Product Catalog & Stock Movement Ledger APIs
* **উদ্দেশ্য:** প্রোডাক্ট CRUD এবং ডাটাবেজ ট্রানজেকশন ভিত্তিক নিরাপদ স্টক ইন/আউট লেজার।
* **যা তৈরি হবে:**
  - `GET /api/products`: সব প্রোডাক্টের তালিকা (সার্চ ও লো-স্টক ফিল্টারিং সহ)।
  - `POST /api/products`: নতুন SKU ও প্রোডাক্ট যুক্ত করা (Zod Schema Validation)।
  - `GET /api/products/:id`: প্রোডাক্টের বিস্তারিত এবং এর সাথে যুক্ত সব স্টক মুভমেন্ট হিস্ট্রি।
  - `PUT /api/products/:id`: প্রোডাক্টের দাম বা সেফটি লিমিট আপডেট।
  - `DELETE /api/products/:id`: প্রোডাক্ট রিমুভ করা।
  - `POST /api/products/:id/movement`:
    - ইনপুট: `{ type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT", quantity: number, reason: string }`
    - **ট্রানজেকশনাল লজিক:**
      - যদি `type === "STOCK_OUT"` এবং `currentStock < quantity` হয়, তবে সরাসরি `400 Bad Request: Insufficient inventory` থ্রো করবে।
      - `prisma.$transaction` দিয়ে একই সাথে মুভমেন্ট লগ তৈরি এবং প্রোডাক্টের `currentStock` আপডেট করা হবে।
* **✅ Definition of Done (DOD):**
  - [ ] কোনো পরিস্থিতিতেই স্টক নেগেটিভ সংখ্যা হতে পারে না।
  - [ ] স্টক ইন বা আউট করার পর লেজার এবং কারেন্ট স্টক ১০০% সমান থাকে।

---

#### 🔹 Phase 5: AI Trigger & Human-in-the-Loop Governance APIs
* **উদ্দেশ্য:** এআই অটোনোমাস স্ক্যানার চালু করা এবং পেন্ডিং এপ্রুভাল টাস্ক কার্যকর বা বাতিল করা।
* **যা তৈরি হবে:**
  - `POST /api/ai/analyze-stockouts`: ব্যাকএন্ড স্বয়ংক্রিয়ভাবে লো-স্টক প্রোডাক্ট খুঁজে এআই ইঞ্জিন দিয়ে পারচেজ অর্ডার প্ল্যান ড্রাফট করবে।
  - `GET /api/governance/tasks`: সব এআই টাস্কের তালিকা (ফিল্টার: `AWAITING_APPROVAL`, `EXECUTED`).
  - `POST /api/governance/tasks/:id/approve`:
    - লজিক: ম্যানেজার এপ্রুভ করলে ডাটাবেজে স্ট্যাটাস `EXECUTED` হবে, অফিশিয়াল `PurchaseOrder` তৈরি হবে এবং প্রোডাক্ট স্টক বাড়িয়ে দেওয়া হবে।
  - `POST /api/governance/tasks/:id/reject`:
    - ইনপুট: `{ comments: string }` (কমেন্ট দেওয়া বাধ্যতামূলক)।
    - লজিক: টাস্ক স্ট্যাটাস `REJECTED` হবে এবং রিজেকশন কারণ সহ সেভ হবে।
* **✅ Definition of Done (DOD):**
  - [ ] এপ্রুভ বাটনে হিট করার সাথে সাথে ব্যাকএন্ডের স্টক কাউন্ট বৃদ্ধি পায় এবং পারচেজ অর্ডার টেবিল আপডেট হয়।
  - [ ] রিজেক্ট করার সময় কমেন্ট ছাড়া রিকোয়েস্ট পাঠালে Zod ভ্যালিডেশন এরর রিটার্ন করে।

---

#### 🔹 Phase 6: System Audit Trail & Analytics APIs
* **উদ্দেশ্য:** ড্যাশবোর্ডের কেপিআই সামারি এবং কমপ্লায়েন্স অডিট লগের ডাটা পরিবেশন।
* **যা তৈরি হবে:**
  - `GET /api/dashboard/stats`:
    - টোটাল ইনভেন্টরি ভ্যালু ($)
    - লো-স্টক আইটেমের সংখ্যা
    - একটিভ সাপ্লায়ার কাউন্ট
    - পেন্ডিং এপ্রুভাল কাউন্ট
  - `GET /api/audit-logs`: সিস্টেমে ঘটা সমস্ত ক্রিটিক্যাল ইভেন্টের হিস্ট্রি।
* **✅ Definition of Done (DOD):**
  - [ ] স্ট্যাটস এপিআই ১টি মাত্র অপ্টিমাইজড ডাটাবেজ অ্যাগ্রিগেশন কুয়েরিতে সমস্ত কেপিআই ফেরত দেয়।
  - [ ] অডিট লগ নতুন থেকে পুরানো ক্রমানুসারে সঠিকভাবে পেইজিনেট হয়।

---
*End of Backend Implementation Plan*
