# 📐 NexusWMS — Frontend Design System & Pattern Guide

এই ফাইলটিতে ফ্রন্টএন্ড ডিজাইনের সুনির্দিষ্ট **Design System, UI Tokens, এবং Component Patterns** চূড়ান্তভাবে লিপিবদ্ধ করা হলো। অ্যাপ্লিকেশনের প্রতিটি পেজ, মডাল এবং বাটনে যাতে **১০০% একই ডিজাইন প্যাটার্ন ও ভিজ্যুয়াল কনসিস্টেন্সি** বজায় থাকে, তা এই ফাইলের নিয়ম অনুযায়ী নিশ্চিত করা হবে।

---

### ১. Visual Identity & Design Philosophy (ডিজাইন দর্শন)
* **স্টাইলিশ ইন্ডাস্ট্রিয়াল ডার্ক থিম:** আধুনিক এন্টারপ্রাইজ টুলস (যেমন: Linear, Raycast, Stripe) এর মতো ক্লিন, মার্জিত ও প্রফেশনাল লুক।
* **এআই লুক পুরোপুরি পরিহার:** কোনো সস্তা পার্পল-পিঙ্ক নিয়ন গ্লো বা অতিরিক্ত চকচকে গ্রেডিয়েন্ট থাকবে না।
* **মাইক্রো-ইন্টার‍্যাকশন ও সাবলীল বর্ডার:** ভারী ড্রপ-শ্যাডোর বদলে সূক্ষ্ম ১ পিক্সেলের বর্ডার (`border-slate-800`) এবং নরম হোভার ট্রানজিশন।

---

### ২. Color Palette & Semantic Tokens (সুনির্দিষ্ট রঙের চার্ট)

| টোকেনের নাম | কালার হেক্স কোড (Hex) | Tailwind Class | কোথায় ব্যবহার হবে? |
| :--- | :--- | :--- | :--- |
| **App Background** | `#090D16` | `bg-slate-950` | পুরো অ্যাপের মূল ব্যাকগ্রাউন্ড |
| **Surface / Card** | `#111827` | `bg-slate-900` | ড্যাশবোর্ড কার্ড, টেবিল, মডাল ব্যাকগ্রাউন্ড |
| **Surface Hover** | `#1E293B` | `hover:bg-slate-800` | টেবিল রো বা কার্ডের হোভার স্টেট |
| **Subtle Border** | `#1E293B` | `border-slate-800` | সমস্ত কার্ড, ইনপুট ও টেবিল ডিভাইডার |
| **Active Border** | `#334155` | `border-slate-700` | ফোকাসড বা হাইলাইটেড বর্ডার |
| **Primary Accent** | `#6366F1` (Indigo) | `bg-indigo-600` | প্রাইমারি বাটন, অ্যাক্টিভ ট্যাব, টগল |
| **Primary Hover** | `#4F46E5` | `hover:bg-indigo-700` | বাটনের হোভার স্টেট |
| **Text Primary** | `#F8FAFC` | `text-slate-50` | মূল শিরোনাম ও ডেটা টেক্সট |
| **Text Secondary** | `#94A3B8` | `text-slate-400` | সাব-টাইটেল, লেবেল ও টেবিল হেডার |
| **Text Muted** | `#64748B` | `text-slate-500` | প্লেসহোল্ডার, টাইমস্ট্যাম্প ও মেটাডাটা |

#### স্ট্যাটাস ব্যাজের সুনির্দিষ্ট রং (Status Indicators):
* **Healthy / Active / Approved (সবুজ):**
  - Background: `bg-emerald-950/60` | Border: `border-emerald-800/60` | Text: `text-emerald-400` | Dot: `bg-emerald-500`
* **Warning / Low Stock / Pending (কমলা/হলুদ):**
  - Background: `bg-amber-950/60` | Border: `border-amber-800/60` | Text: `text-amber-400` | Dot: `bg-amber-500`
* **Critical / Suspended / Rejected (লাল):**
  - Background: `bg-rose-950/60` | Border: `border-rose-800/60` | Text: `text-rose-400` | Dot: `bg-rose-500`
* **Neutral / Draft / Staff (নীল/ধূসর):**
  - Background: `bg-slate-800/60` | Border: `border-slate-700/60` | Text: `text-slate-300` | Dot: `bg-slate-400`

---

### ৩. Typography Scale (টাইপোগ্রাফি ও ফন্ট সাইজ)
* **ফন্ট ফ্যামিলি:** Inter / Geist / system-ui (ক্লিন ও সহজে পড়ার মতো)।
* **Page Title:** `text-2xl font-bold tracking-tight text-slate-50`
* **Section Heading:** `text-lg font-semibold text-slate-100`
* **Card Label / Metric Value:** `text-2xl font-bold text-slate-50`
* **Table Header:** `text-xs font-semibold uppercase tracking-wider text-slate-400`
* **Body Text:** `text-sm text-slate-300`
* **Caption / Meta:** `text-xs text-slate-500`

---

### ৪. Standard Component Patterns (সুনির্দিষ্ট কম্পোনেন্ট টেমপ্লেট)

প্রতিটি ফাইলে নিচের প্যাটার্নগুলো হুবহু মেনে চলা হবে:

#### ক. বাটন প্যাটার্ন (Button Patterns):
* **Primary Button:**
  ```tsx
  <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50">
    <Icon className="w-4 h-4" />
    <span>Save Changes</span>
  </button>
  ```
* **Secondary / Outline Button:**
  ```tsx
  <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:text-white active:scale-[0.98] transition-all">
    Cancel
  </button>
  ```
* **Destructive Button (Delete/Reject):**
  ```tsx
  <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-lg hover:bg-rose-900/60 hover:text-white transition-all">
    Delete
  </button>
  ```

---

#### খ. ইনপুট ও ফর্ম ফিল্ড প্যাটার্ন (Input & Form Fields):
```tsx
<div className="space-y-1.5">
  <label className="text-xs font-medium text-slate-300">Product Name</label>
  <input 
    type="text" 
    placeholder="e.g. Crucial 1TB SSD" 
    className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
  />
</div>
```

---

#### গ. মেট্রিক কেপিআই কার্ড প্যাটার্ন (Metric KPI Cards):
```tsx
<div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700/80 transition-all shadow-sm">
  <div className="flex items-center justify-between text-slate-400">
    <span className="text-xs font-medium uppercase tracking-wider">Total Value</span>
    <div className="p-2 bg-slate-800/80 rounded-lg text-indigo-400">
      <PackageIcon className="w-4 h-4" />
    </div>
  </div>
  <div className="mt-3 text-2xl font-bold text-slate-100">$128,450.00</div>
  <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
    <TrendingUpIcon className="w-3.5 h-3.5" />
    <span>+12% from last month</span>
  </div>
</div>
```

---

#### ঘ. ডেটা টেবিল প্যাটার্ন (Data Tables):
```tsx
<div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-900">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="border-b border-slate-800 bg-slate-950/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <th className="px-5 py-3.5">SKU & Product</th>
        <th className="px-5 py-3.5">Category</th>
        <th className="px-5 py-3.5">Stock Level</th>
        <th className="px-5 py-3.5">Status</th>
        <th className="px-5 py-3.5 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-800/80 text-sm">
      <tr className="hover:bg-slate-800/40 transition-colors">
        <td className="px-5 py-3.5 font-medium text-slate-100">Crucial 1TB SSD</td>
        ...
      </tr>
    </tbody>
  </table>
</div>
```

---

#### ঙ. স্ট্যাটাস ব্যাজ প্যাটার্ন (Status Badge with Dot):
```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
  Active
</span>
```

---

#### চ. স্লাইড-ইন সাইড ড্রয়ার ও মডাল (Side Drawer & Modal):
* **ব্যাকড্রপ:** `bg-black/60 backdrop-blur-sm fixed inset-0 z-50`
* **মডাল কন্টেইনার:** `bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4`
* **সাইড ড্রয়ার (যেমন AI Governance Drawer):**
  - ডানপাশ থেকে স্মুথলি স্লাইড করে আসবে: `fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 shadow-2xl z-50 overflow-y-auto`

---

#### ছ. শিমার স্কেলিটন প্যাটার্ন (Loading Skeletons):
```tsx
<div className="animate-pulse space-y-3">
  <div className="h-4 bg-slate-800 rounded w-1/4"></div>
  <div className="h-10 bg-slate-800/60 rounded-lg w-full"></div>
  <div className="h-10 bg-slate-800/40 rounded-lg w-full"></div>
</div>
```

---

### ৫. Strict Rules: যা কোনোভাবেই করা যাবে না (Anti-Patterns)
1. ❌ **উজ্জ্বল গোলাপি বা পার্পল ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট ব্যবহার করা যাবে না।**
2. ❌ **ভারী ও কৃত্রিম ড্রপ শ্যাডো (`shadow-2xl shadow-purple-500/50`) ব্যবহার করা যাবে না।**
3. ❌ **ব্রাউজারের ডিফল্ট ফর্ম ইনপুট (নীল বর্ডার ওয়ালা) রাখা যাবে না।**
4. ❌ **কোনো পেজে ফন্টের আকার বা বাটন সাইজ মনগড়াভাবে আলাদা করা যাবে না।**

---
*Created for: NexusWMS Design Consistency | File: plans/DESIGN_SYSTEM.md*
