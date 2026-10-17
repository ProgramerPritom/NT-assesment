# 🤖 NexusWMS — AI Engine & HITL Governance Plan (Phase-by-Phase)

এই প্ল্যানে Google Gemini 1.5 Flash এপিআই ইন্টিগ্রেশন, সাপ্লাই চেইন রিস্টকিং অ্যানালাইসিস প্রম্পট, গাণিতিক রিস্ক ইঞ্জিন এবং হিউম্যান-ইন-দ্য-লুপ (HITL) এপ্রুভাল পাইপলাইনের ফেজ-ভিত্তিক রূপরেখা দেওয়া হলো।

---

### 🔑 এই সেকশনে প্রয়োজনীয় ক্রেডেনশিয়াল:
* `GEMINI_API_KEY`: 
  - **কোথায় পাবেন:** [Google AI Studio (aistudio.google.com)](https://aistudio.google.com/) থেকে ১০০% বিনামূল্যে নেওয়া যাবে (কোনো ক্রেডিট কার্ড লাগে না)।
  - **কখন নেওয়া হবে:** যখন আমরা AI Engine-এর এই ফেজের কোডিং শুরু করব, তখন আপনার থেকে এই কি-টি চেয়ে নেওয়া হবে।
  - **ফলব্যাক গার্ডরেল:** যদি কোনো কারণে API Key না দেওয়া থাকে বা ইন্টারনেট অফলাইন থাকে, সিস্টেমটি ক্র্যাশ করবে না; একটি স্বয়ংক্রিয় বুদ্ধিমান রুল-বেসড অফলাইন সিমুলেটরে সুইচ করবে।

---

### 📑 এআই ইঞ্জিনের ৫টি সুনির্দিষ্ট ফেজ:

---

#### 🔹 Phase 1: Gemini Client & Structured Output Engine
* **উদ্দেশ্য:** `@google/generative-ai` SDK কনফিগার করা এবং মডেলকে কঠোরভাবে Structured JSON রেসপন্স মোডে সেট করা।
* **যা তৈরি হবে:**
  - `services/ai/geminiClient.ts`: জেমিনি ক্লায়েন্ট ইনিশিয়ালাইজেশন।
  - `services/ai/aiTypes.ts`: এআই ইনপুট ও আউটপুট ইন্টারফেস।
* **✅ Definition of Done (DOD):**
  - [ ] মডেল রেসপন্স কোনো অতিরিক্ত মার্কডাউন ব্যাকটিক (````json ... ````) ছাড়াই সরাসরি ভ্যালিড JavaScript অবজেক্টে পার্স হতে পারে।

---

#### 🔹 Phase 2: Context Injection & Restock Analysis Prompt
* **উদ্দেশ্য:** ইনভেন্টরির জটিল বাস্তব ডাটা একত্রিত করে এআই-কে সঠিক সিদ্ধান্ত নেওয়ার কনটেক্সট দেওয়া।
* **ইনপুট প্যাকেট:**
  - প্রোডাক্টের ডাটা (SKU, বর্তমান স্টক, সেফটি স্টক লেভেল, ইউনিট দাম)।
  - শুধুমাত্র `ACTIVE` সাপ্লায়ারদের তালিকা (তাদের লিড-টাইম কত দিন, প্রতি পিসের রেট কত)।
* **প্রম্পট নিয়ম:**
  - এআই-কে নির্দেশ দেওয়া: ঘাটতির তীব্রতা বিচার করো এবং স্টকআউট এড়াতে সবচেয়ে দ্রুত অথচ সাশ্রয়ী সাপ্লায়ারকে বেছে নাও।
* **স্ট্রাকচার্ড আউটপুট স্কিমা:**
  ```json
  {
    "recommendedSupplierId": "string",
    "recommendedQuantity": "number",
    "estimatedCost": "number",
    "confidenceScore": "number (0-100)",
    "reasoning": "string"
  }
  ```
* **✅ Definition of Done (DOD):**
  - [ ] এআই সবসময় সক্রিয় (ACTIVE) সাপ্লায়ারদের মধ্য থেকে কাউকে রেকমেন্ড করে, কোনো সাসপেন্ডেড সাপ্লায়ারকে নয়।
  - [ ] কনফিডেন্স স্কোর এবং রিজনিং পরিষ্কার ইংরেজিতে রিটার্ন করে।

---

#### 🔹 Phase 3: Deterministic Blast Radius & Risk Scoring Engine
* **উদ্দেশ্য:** এআই-এর আউটপুটের ওপর মানুষের তৈরি গাণিতিক ফর্মুলা প্রয়োগ করে ঝুঁকির মাত্রা (Risk Score 0-100) নির্ধারণ করা।
* **যা তৈরি হবে:**
  - `services/governance/riskEngine.ts`: পিওর TypeScript ফাংশন।
  - **গাণিতিক ফর্মুলা:**
    $$\text{Financial Factor} = \min\left(50, \frac{\text{Estimated Cost}}{\$2000} \times 50\right)$$
    $$\text{Confidence Factor} = (100 - \text{AI Confidence Score}) \times 0.3$$
    $$\text{Supplier Factor} = \text{Client is New ? } 20 : 0$$
    $$\mathbf{\text{Risk Score}} = \text{Financial Factor} + \text{Confidence Factor} + \text{Supplier Factor}$$
* **থ্রেশহোল্ড রুল:**
  - `Risk Score < 60`: Low/Medium Risk ➔ অটোমেটিক এক্সিকিউটেড।
  - `Risk Score >= 60`: High Risk ➔ সিস্টেম এআই-এর অ্যাকশন স্থগিত (PAUSE) করে `AWAITING_APPROVAL` করবে।
* **✅ Definition of Done (DOD):**
  - [ ] বিভিন্ন খরচের পরিমাণের জন্য রিস্ক স্কোর সঠিক হিসাব করে।
  - [ ] $১,০০০ এর বেশি খরচের অর্ডারে রিস্ক স্কোর অবশ্যই ৬০ বা তার বেশি হয়ে এপ্রুভাল কিউতে চলে যায়।

---

#### 🔹 Phase 4: Human-in-the-Loop (HITL) Execution Pipeline
* **উদ্দেশ্য:** পেন্ডিং এআই টাস্ক ডাটাবেজে সংরক্ষণ করা এবং মানুষের সিদ্ধান্ত অনুযায়ী ইনভেন্টরি আপডেট করা।
* **যা তৈরি হবে:**
  - `services/governance/approvalService.ts`:
    - `createPendingTask()`: এআই-এর প্রপোজাল ডাটাবেজের `AIWorkflowTask` মডেলে সেভ করা।
    - `executeApprovedTask()`: ম্যানেজার অনুমোদন দিলে `PurchaseOrder` তৈরি এবং স্টকে মাল যুক্ত করা।
    - `rejectTask()`: ম্যানেজারের ফিডব্যাক সহ টাস্ক বাতিল করা।
* **✅ Definition of Done (DOD):**
  - [ ] এপ্রুভ হওয়ার সাথে সাথে ডাটাবেজের স্টক স্বয়ংক্রিয়ভাবে বৃদ্ধি পায় এবং পারচেজ অর্ডারের সাথে টাস্কের সম্পর্ক তৈরি হয়।

---

#### 🔹 Phase 5: Offline Fallback & Reliability Guardrails
* **উদ্দেশ্য:** ইন্টারভিউয়ারের কম্পিউটারে ইন্টারনেট না থাকলে বা এপিআই রেট লিমিট শেষ হলেও ডেমো যাতে কোনোভাবেই ক্র্যাশ না করে।
* **যা তৈরি হবে:**
  - এপিআই ফেইল করলে বা এরর দিলে ব্যাকএন্ড স্বয়ংক্রিয়ভাবে একটি স্মার্ট হিউরিস্টিক অফলাইন অ্যানালাইজার চালাবে যা একই স্ট্রাকচার্ড ফরম্যাটে রেসপন্স তৈরি করে ডেমো চালিয়ে রাখবে।
* **✅ Definition of Done (DOD):**
  - [ ] API Key মুছে দিলেও অ্যাপ্লিকেশন কোনো ক্র্যাশ ছাড়াই মসৃণভাবে অফলাইন ডেমো ফ্লো দেখাতে পারে।

---
*End of AI Engine Implementation Plan*
