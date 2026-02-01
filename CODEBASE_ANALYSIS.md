# MindfulSpace - Codebase Analysis & Structure

## 📋 Executive Summary

**MindfulSpace** is a privacy-first AI-powered journaling companion built with Next.js 14, TypeScript, Prisma, and Supabase. The application demonstrates a hybrid AI approach combining local NLP processing (AFINN sentiment analysis, Compromise theme extraction) with cloud-based AI (Anthropic Claude API) while maintaining strict privacy controls through PII masking.

---

## 🏗️ Architecture Overview

### **Technology Stack**

**Frontend:**
- Next.js 14 (App Router) - Server Components by default
- TypeScript 5.x - Full type safety
- React 18 - UI components
- Tailwind CSS 3.x - Utility-first styling
- shadcn/ui - Accessible component library (Radix UI)
- Recharts - Data visualization
- SWR - Client-side data fetching with caching

**Backend:**
- Next.js API Routes - Serverless functions
- Prisma 5.x - Type-safe ORM
- PostgreSQL (via Supabase) - Database
- Supabase Auth - Authentication & session management

**AI & NLP:**
- Anthropic Claude Sonnet 4 API - Generative AI (prompts, suggestions, summaries)
- `sentiment` package (AFINN-165) - Local sentiment analysis
- `compromise` package - Local theme extraction & NLP
- Custom PII masking - Privacy protection layer

**Deployment:**
- Vercel - Hosting platform
- Supabase - Database & auth hosting

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                  # Authentication route group
│   │   ├── login/page.tsx       # Login page
│   │   └── signup/page.tsx      # Signup page
│   │
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── layout.tsx           # Dashboard layout (sidebar + mobile nav)
│   │   ├── dashboard/page.tsx   # Analytics dashboard (Server Component)
│   │   ├── write/page.tsx       # Entry editor page
│   │   ├── entries/
│   │   │   ├── page.tsx         # Entry list view
│   │   │   └── [id]/page.tsx    # Entry detail view
│   │   └── settings/page.tsx    # User settings & privacy
│   │
│   ├── api/                     # API Routes (Server-side)
│   │   ├── entries/
│   │   │   ├── route.ts         # GET all, POST new entry
│   │   │   └── [id]/route.ts    # GET, PUT, DELETE single entry
│   │   ├── ai/
│   │   │   ├── prompt/route.ts  # Generate daily prompt
│   │   │   ├── suggest/route.ts # Real-time AI suggestions
│   │   │   └── summary/weekly/route.ts # Weekly summary generation
│   │   └── user/
│   │       ├── preferences/route.ts # Update user preferences
│   │       ├── export/route.ts      # Export user data
│   │       └── delete/route.ts      # Delete account
│   │
│   ├── layout.tsx               # Root layout (ThemeProvider, Toaster)
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
│
├── components/                  # React components
│   ├── ui/                      # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── journal/                 # Journal entry components
│   │   ├── EntryEditor.tsx     # Main writing interface (Client Component)
│   │   ├── AIPromptCard.tsx    # Daily prompt display
│   │   ├── AICompanion.tsx     # Real-time AI suggestions sidebar
│   │   ├── SentimentIndicator.tsx # Real-time sentiment emoji
│   │   ├── EntryCard.tsx       # Entry preview card
│   │   ├── EntryList.tsx       # List of entries
│   │   └── EntryDetailClient.tsx # Entry detail view
│   │
│   ├── dashboard/               # Dashboard analytics components
│   │   ├── StatsOverview.tsx   # Key metrics cards
│   │   ├── SentimentChart.tsx  # Sentiment trend line chart
│   │   ├── ThemeCloud.tsx      # Theme word cloud visualization
│   │   ├── WeeklySummaryCard.tsx # AI-generated weekly summary
│   │   └── RecentEntries.tsx   # Latest entries widget
│   │
│   ├── layout/                  # Layout components
│   │   ├── Sidebar.tsx         # Desktop sidebar navigation
│   │   └── MobileNav.tsx       # Mobile bottom navigation
│   │
│   ├── settings/                # Settings components
│   │   ├── PrivacyControls.tsx # AI/Analytics toggle switches
│   │   ├── DataExport.tsx      # Export data functionality
│   │   └── AccountSettings.tsx # Account management
│   │
│   └── onboarding/             # Onboarding flow
│       ├── OnboardingWrapper.tsx
│       └── Step3Complete.tsx
│
├── lib/                         # Utility libraries
│   ├── prisma.ts                # Prisma client singleton
│   ├── supabase-server.ts      # Server-side Supabase client
│   ├── supabase.ts              # Client-side Supabase client
│   ├── anthropic.ts            # Claude API wrapper (with PII masking)
│   ├── sentiment.ts             # AFINN sentiment analysis wrapper
│   ├── theme-extraction.ts      # Compromise-based theme extraction
│   ├── pii-masking.ts           # PII detection & masking functions
│   ├── prompt-generation.ts     # Context-aware prompt generation logic
│   ├── privacy-utils.ts         # Privacy settings helpers
│   └── utils.ts                 # General utilities
│
├── hooks/                       # Custom React hooks
│   ├── use-debounce.ts          # Debounce hook for AI suggestions
│   ├── use-toast.ts             # Toast notification hook
│   └── use-onboarding.ts        # Onboarding state management
│
├── types/                       # TypeScript type definitions
│   └── sentiment.d.ts          # Sentiment analysis types
│
└── middleware.ts                # Next.js middleware (auth protection)

prisma/
└── schema.prisma                # Database schema (Prisma)
```

---

## 🗄️ Database Schema

### **Models Overview**

#### **User**
- Core user information
- Privacy settings (JSON)
- Relationships: entries, weeklySummaries, aiPrompts

#### **Entry** (Core Model)
- Journal entry content
- **Local Analysis Fields:**
  - `sentimentScore` (Float, -5 to +5)
  - `sentimentLabel` (String: "very happy", "happy", "neutral", "sad", "depressed")
  - `themes` (String array)
- **Privacy Fields:**
  - `allowAI` (Boolean) - Stored at creation time
  - `allowAnalytics` (Boolean) - Stored at creation time
- Relationships: analysis, suggestions

#### **Analysis** (Optional Deep Analysis)
- Detailed sentiment breakdown
- Theme frequency mapping
- Key phrases extraction
- One-to-one with Entry

#### **AISuggestion**
- Real-time companion suggestions
- Tracks user interaction (accepted/dismissed)
- Many-to-one with Entry

#### **WeeklySummary**
- AI-generated weekly insights
- Aggregated sentiment trends
- Theme correlations
- One-to-many with User

#### **AIPrompt**
- Daily context-aware prompts
- Tracks usage and expiration
- Progressive prompts (entryCount tracking)
- One-to-many with User

---

## 🔄 Key Data Flows

### **1. Entry Creation Flow**

```
User Types → EntryEditor (Client Component)
    ↓
Real-time Sentiment Analysis (AFINN - Local)
    ↓
Display Sentiment Indicator
    ↓
[After 2s pause + >100 chars]
    ↓
Debounce → POST /api/ai/suggest
    ↓
PII Masking → Claude API
    ↓
Display AI Suggestion in Sidebar
    ↓
User Clicks Save
    ↓
POST /api/entries
    ↓
Server-side:
  - Fetch user privacy settings
  - Analyze sentiment (if allowAnalytics)
  - Extract themes (if allowAnalytics)
  - Store entry with privacy flags
  - Generate new prompt (if allowAI, async)
    ↓
Redirect to Entry Detail Page
```

### **2. Dashboard Analytics Flow**

```
Dashboard Page (Server Component)
    ↓
Fetch Entries from Database
    ↓
Filter by allowAnalytics === true
    ↓
Pass to Components:
  - SentimentChart → Line chart of sentiment over time
  - ThemeCloud → Word frequency visualization
  - StatsOverview → Aggregated metrics
  - WeeklySummaryCard → Fetch/generate weekly summary
    ↓
Render Analytics Dashboard
```

### **3. Weekly Summary Generation**

```
User Requests Summary → GET /api/ai/summary/weekly
    ↓
Check if summary exists for current week
    ↓
If not exists:
  - Fetch entries (past 7 days, allowAnalytics === true)
  - Aggregate: theme frequencies, sentiment scores, patterns
  - Send ONLY aggregated data to Claude (no full entry text)
  - Generate narrative summary
  - Cache in database
    ↓
Return Summary + Visualizations
```

---

## 🔐 Privacy Architecture

### **Privacy Controls**

The application implements **granular privacy controls** at multiple levels:

1. **User-Level Settings** (`User.privacySettings` JSON):
   - `allowAI` - Controls AI features (prompts, suggestions, sentiment display)
   - `allowAnalytics` - Controls analytics (themes, charts, summaries)

2. **Entry-Level Privacy** (`Entry.allowAI`, `Entry.allowAnalytics`):
   - Privacy settings are **stored with each entry** at creation time
   - Ensures historical accuracy (settings changes don't affect old entries)
   - Allows per-entry privacy control

3. **PII Masking** (Before External API Calls):
   - All user content is masked before sending to Claude API
   - Masks: emails, phones, SSNs, credit cards, addresses, IPs, URLs
   - Implemented in `lib/pii-masking.ts`

### **Privacy Scenarios**

**Scenario 1: AI Disabled + Analytics Enabled**
- ✅ No AI features shown (prompt, companion, sentiment indicator)
- ✅ Entry included in charts, themes, summaries
- ✅ Sentiment/themes analyzed and stored

**Scenario 2: Both Disabled**
- ✅ No AI features shown
- ✅ No sentiment/themes stored (`null`/`[]`)
- ✅ Entry NOT included in analytics
- ✅ Plain journal entry only

**Scenario 3: AI Enabled + Analytics Disabled**
- ✅ AI features shown
- ✅ Sentiment analyzed and shown in UI
- ✅ Entry NOT included in charts, themes, summaries
- ✅ Themes not extracted/stored

---

## 🤖 AI Integration

### **Hybrid AI Approach**

**Local Processing (60% of analysis):**
- **Sentiment Analysis:** `sentiment` package (AFINN-165)
  - Runs instantly as user types
  - No network latency
  - Privacy-preserving (never leaves device)
  - Score range: -5 to +5

- **Theme Extraction:** `compromise` package
  - POS tagging, noun extraction
  - Stop word filtering
  - Frequency counting
  - Runs on server during entry save

**Cloud AI (40% of features):**
- **Claude API** (Anthropic Sonnet 4):
  - Daily prompt generation (context-aware)
  - Real-time writing suggestions (debounced)
  - Weekly summary generation (aggregated data only)
  - All requests include PII masking

### **AI Features**

1. **Daily Prompts** (`/api/ai/prompt`)
   - Context-aware based on:
     - Entry count today
     - Recent entry themes
     - Historical patterns
     - Gap detection (days since last entry)
   - Progressive prompts (1st, 2nd, 3rd entry of day)

2. **Real-Time Companion** (`/api/ai/suggest`)
   - Triggered after 2-second typing pause
   - Requires >100 characters
   - Generates follow-up questions
   - Displayed in sidebar

3. **Weekly Summaries** (`/api/ai/summary/weekly`)
   - Aggregates past 7 days of entries
   - Sends ONLY aggregated data (not full entries)
   - Generates narrative insights
   - Cached in database

---

## 🎨 Component Architecture

### **Server vs Client Components**

**Server Components (Default):**
- Dashboard page
- Entry list page
- Entry detail page (initial load)
- Layout components
- All API routes

**Client Components (`'use client'`):**
- EntryEditor (needs useState, useEffect)
- AICompanion (needs debounce, API calls)
- SentimentIndicator (real-time updates)
- Charts (Recharts requires client-side)
- Interactive UI elements

### **Component Patterns**

**EntryEditor Pattern:**
```typescript
'use client';
- useState for content
- useEffect for real-time sentiment
- useDebounce for AI suggestions
- Conditional rendering based on privacy settings
```

**Dashboard Pattern:**
```typescript
// Server Component
- Fetch data in component
- Pass to client components for interactivity
- Filter by privacy settings before rendering
```

---

## 🔌 API Routes

### **Entry Management**

**GET /api/entries**
- Returns all entries for authenticated user
- Filters by userId
- Includes privacy fields in response

**POST /api/entries**
- Creates new entry
- Validates content (Zod)
- Analyzes sentiment/themes (if allowAnalytics)
- Stores privacy settings with entry
- Generates prompt asynchronously (if allowAI)

**GET /api/entries/[id]**
- Returns single entry with full details

**PUT /api/entries/[id]**
- Updates entry content
- Re-analyzes if original allowAnalytics was true

**DELETE /api/entries/[id]**
- Deletes entry and related data (cascade)

### **AI Routes**

**GET /api/ai/prompt**
- Generates context-aware daily prompt
- Checks user's allowAI setting
- Uses only entries where allowAI === true for context
- Returns prompt text

**POST /api/ai/suggest**
- Generates real-time writing suggestion
- Requires >100 characters
- Masks PII before Claude API call
- Returns suggestion text

**GET /api/ai/summary/weekly**
- Generates or retrieves weekly summary
- Filters entries by allowAnalytics === true
- Aggregates data before sending to Claude
- Caches in database

**POST /api/ai/summary/weekly**
- Regenerates weekly summary
- Deletes existing summary first
- Marks as regenerated

### **User Routes**

**PUT /api/user/preferences**
- Updates user privacy settings
- Persists to database

**GET /api/user/export**
- Exports all user data as JSON
- Includes entries, summaries, prompts

**DELETE /api/user/delete**
- Deletes user account and all data
- Cascade deletes all related records

---

## 🔒 Authentication & Authorization

### **Middleware** (`src/middleware.ts`)

- Protects dashboard routes (`/dashboard`, `/write`, `/entries`, `/settings`)
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from auth pages
- Uses Supabase SSR client for session management

### **Server-Side Auth**

All API routes use:
```typescript
const supabase = await createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
```

### **Client-Side Auth**

Components use Supabase client for:
- Login/signup forms
- Session state management
- Protected route access

---

## 📊 Data Visualization

### **SentimentChart** (`components/dashboard/SentimentChart.tsx`)

- **Library:** Recharts
- **Data:** Last 30 entries (filtered by allowAnalytics)
- **Features:**
  - Line chart showing sentiment over time
  - X-axis: Time-based (shows date only when it changes)
  - Y-axis: Sentiment score (-5 to +5)
  - Tooltip: Full date/time + sentiment value
  - Dark mode support

### **ThemeCloud** (`components/dashboard/ThemeCloud.tsx`)

- **Visualization:** Word cloud (size = frequency)
- **Data:** All themes from entries (filtered by allowAnalytics)
- **Features:**
  - Top themes displayed
  - Size indicates frequency
  - Clickable (navigates to filtered entries)

### **StatsOverview** (`components/dashboard/StatsOverview.tsx`)

- **Metrics:**
  - Total entries
  - Total words
  - Current streak (consecutive days)
  - Average sentiment (filtered by allowAnalytics)

---

## 🛠️ Key Utilities

### **PII Masking** (`lib/pii-masking.ts`)

```typescript
maskPII(text: string): string
- Masks emails, phones, SSNs, credit cards, addresses, IPs, URLs
- Used before all Claude API calls
- Critical for privacy compliance
```

### **Sentiment Analysis** (`lib/sentiment.ts`)

```typescript
analyzeSentiment(text: string): SentimentResult
- Uses AFINN-165 dictionary
- Returns score (-5 to +5), label, positive/negative words
- Clamps scores to valid range
```

### **Theme Extraction** (`lib/theme-extraction.ts`)

```typescript
extractThemes(text: string): ThemeResult
- Uses Compromise NLP
- Extracts nouns (themes)
- Filters stop words
- Returns top themes by frequency
```

### **Prompt Generation** (`lib/prompt-generation.ts`)

```typescript
generateContextAwarePrompt(context: PromptContext): Promise<GeneratedPrompt>
- Analyzes user patterns
- Detects gaps, trends, themes
- Generates personalized prompts via Claude
- Respects privacy settings
```

---

## 🎯 Key Features Implementation

### **1. Real-Time Sentiment Indicator**

- Runs locally as user types
- Updates instantly (no API call)
- Shows emoji based on sentiment label
- Only visible if allowAI === true

### **2. AI Writing Companion**

- Debounced (2-second delay)
- Triggers after >100 characters
- Shows follow-up questions in sidebar
- Respects allowAI setting

### **3. Context-Aware Prompts**

- First entry: Welcoming, motivational
- Second entry: Builds on first entry's themes
- Multiple entries: Encourages reflection, pattern recognition
- Gap detection: Gentle re-engagement prompts

### **4. Weekly Summaries**

- Aggregates past 7 days
- Sends only aggregated data (not full entries)
- Generates narrative insights
- Cached in database (regeneratable)

### **5. Privacy Controls**

- Granular control (AI vs Analytics)
- Per-entry privacy state
- UI respects settings immediately
- Data processing respects settings

---

## 🐛 Known Issues & Considerations

### **Current State**

1. **Database Migration Required:**
   - Privacy fields (`allowAI`, `allowAnalytics`) added to Entry model
   - Run `npx prisma db push` to apply

2. **Environment Variables:**
   - `ANTHROPIC_API_KEY` - Required for AI features
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

3. **Error Handling:**
   - API routes have try-catch blocks
   - Client components show toast notifications
   - Some debug logs may need cleanup

### **Performance Considerations**

- **Debouncing:** AI suggestions debounced to reduce API calls
- **Caching:** Weekly summaries cached in database
- **Filtering:** Database-level filtering for analytics
- **Server Components:** Data fetching on server reduces client load

---

## 📝 Code Quality Highlights

### **TypeScript**
- Full type safety throughout
- Proper interfaces for all data structures
- Type guards and narrowing

### **Error Handling**
- Try-catch in all async operations
- User-friendly error messages
- Proper HTTP status codes

### **Privacy-First Design**
- PII masking before external APIs
- Granular privacy controls
- Per-entry privacy state

### **Code Organization**
- Clear separation of concerns
- Reusable utility functions
- Consistent naming conventions
- Server/Client component separation

---

## 🚀 Deployment Checklist

1. **Environment Variables:**
   - Set all required vars in Vercel dashboard
   - Ensure DATABASE_URL is correct
   - Verify ANTHROPIC_API_KEY is set

2. **Database:**
   - Run Prisma migrations
   - Verify schema matches production

3. **Build:**
   - `npm run build` succeeds
   - No TypeScript errors
   - No linting errors

4. **Testing:**
   - Authentication flow
   - Entry creation/editing
   - Privacy controls
   - AI features
   - Dashboard analytics

---

## 📚 Key Files Reference

### **Critical Files to Understand**

1. **`prisma/schema.prisma`** - Database structure
2. **`src/lib/anthropic.ts`** - Claude API integration
3. **`src/lib/pii-masking.ts`** - Privacy protection
4. **`src/app/api/entries/route.ts`** - Entry creation logic
5. **`src/components/journal/EntryEditor.tsx`** - Main writing interface
6. **`src/middleware.ts`** - Route protection
7. **`src/lib/prompt-generation.ts`** - Context-aware prompt logic

---

## 🎓 Learning Resources

- **Next.js 14:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs
- **Anthropic Claude:** https://docs.anthropic.com
- **Supabase:** https://supabase.com/docs
- **Recharts:** https://recharts.org

---

**Last Updated:** Based on current codebase analysis
**Project Status:** Active development for Palo Alto Networks Hackathon
