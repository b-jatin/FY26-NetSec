# MindfulSpace - AI Journaling Companion
## Complete Project Documentation for Cursor AI Development

---

## 📋 PROJECT OVERVIEW

**Project Name:** MindfulSpace  
**Type:** Progressive Web Application (PWA)  
**Timeline:** 48 hours (Feb 1st 5:00 PM PST deadline)  
**Target:** Palo Alto Networks NetSec Hackathon Case Study

### **Problem Statement**
People struggle to maintain consistent journaling habits due to:
1. Blank page anxiety (don't know what to write)
2. Entries become event logs without insights
3. Can't identify emotional patterns over time
4. No continuity between entries

### **Solution**
Privacy-first AI journaling companion that:
1. Provides context-aware prompts based on history
2. Analyzes sentiment and themes locally (AFINN)
3. Generates intelligent suggestions (Claude API)
4. Visualizes emotional trends over time
5. Maintains user privacy with PII masking

---

## 🏗️ SYSTEM ARCHITECTURE

### **High-Level Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React Components (Next.js 14)               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │   Writing    │  │  Dashboard   │  │   Settings   │  │   │
│  │  │   Editor     │  │   Analytics  │  │   Privacy    │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           LOCAL AI PROCESSING (Privacy Layer)            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │   AFINN      │  │  Compromise  │  │  PII Masking │  │   │
│  │  │  Sentiment   │  │    Theme     │  │   Functions  │  │   │
│  │  │   Analysis   │  │  Extraction  │  │              │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   State Management                        │   │
│  │        React Context + SWR for Data Fetching             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↕
                    (HTTP/HTTPS + WebSockets)
                                ↕
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Next.js API Routes)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API Layer (REST)                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │   /api/ai    │  │  /api/entries│  │ /api/analysis│  │   │
│  │  │   /prompt    │  │   CRUD ops   │  │   Weekly     │  │   │
│  │  │   /suggest   │  │              │  │   Summaries  │  │   │
│  │  │   /summary   │  │              │  │              │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Business Logic Layer                    │   │
│  │  - Authentication middleware                              │   │
│  │  - PII masking before external API calls                 │   │
│  │  - Rate limiting                                          │   │
│  │  - Error handling                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Data Access Layer (Prisma ORM)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↕
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐        ┌─────────────────────────┐   │
│  │   Supabase/PostgreSQL│        │   Anthropic Claude API  │   │
│  │   - User data        │        │   - Prompt generation   │   │
│  │   - Journal entries  │        │   - Suggestions         │   │
│  │   - Analysis cache   │        │   - Summaries           │   │
│  │   - Authentication   │        │   (PII-masked input)    │   │
│  └──────────────────────┘        └─────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 UML DIAGRAMS

### **1. CLASS DIAGRAM**

```mermaid
classDiagram
    class User {
        +String id
        +String email
        +DateTime createdAt
        +String preferences
        +Boolean privacyOptOut
        +getEntries()
        +getWeeklySummaries()
    }

    class Entry {
        +String id
        +String userId
        +String content
        +Float sentimentScore
        +String sentimentLabel
        +String[] themes
        +DateTime createdAt
        +DateTime updatedAt
        +Boolean analyzed
        +getAnalysis()
        +updateSentiment()
    }

    class Analysis {
        +String id
        +String entryId
        +Float sentimentScore
        +String sentimentLabel
        +JSON themes
        +String[] keyPhrases
        +JSON emotionalWords
        +DateTime analyzedAt
        +generateInsights()
    }

    class WeeklySummary {
        +String id
        +String userId
        +DateTime weekStart
        +DateTime weekEnd
        +String summary
        +String[] topThemes
        +Float avgSentiment
        +Int entryCount
        +JSON correlations
        +DateTime generatedAt
        +regenerate()
    }

    class AIPrompt {
        +String id
        +String userId
        +String promptText
        +String context
        +DateTime generatedAt
        +Boolean used
        +generate()
    }

    class AISuggestion {
        +String id
        +String entryId
        +String suggestionText
        +String triggerContext
        +Boolean accepted
        +DateTime createdAt
        +create()
    }

    User "1" --> "0..*" Entry : writes
    Entry "1" --> "0..1" Analysis : has
    Entry "1" --> "0..*" AISuggestion : receives
    User "1" --> "0..*" WeeklySummary : has
    User "1" --> "0..*" AIPrompt : receives
```

---

### **2. SEQUENCE DIAGRAM: Write Entry with Real-Time Companion**

```mermaid
sequenceDiagram
    actor User
    participant UI as Entry Editor
    participant Local as AFINN (Local)
    participant Debounce as Debounce Handler
    participant API as Next.js API
    participant PII as PII Masker
    participant Claude as Claude API
    participant DB as Database

    User->>UI: Types journal entry
    UI->>Local: Analyze sentiment (immediate)
    Local-->>UI: Return sentiment score
    UI->>UI: Display sentiment emoji
    
    User->>UI: Continues typing (>100 chars)
    UI->>Debounce: Trigger after 2s pause
    Debounce->>API: POST /api/ai/suggest
    API->>PII: Mask PII in text
    PII-->>API: Return masked text
    API->>Claude: Request suggestion
    Claude-->>API: Return AI suggestion
    API-->>UI: Send suggestion to client
    UI->>UI: Display in sidebar
    
    User->>UI: Clicks "Save Entry"
    UI->>Local: Final sentiment analysis
    Local-->>UI: Complete analysis
    UI->>API: POST /api/entries
    API->>DB: Save entry + analysis
    DB-->>API: Confirm saved
    API-->>UI: Success response
    UI->>UI: Show success message
```

---

### **3. SEQUENCE DIAGRAM: Generate Weekly Summary**

```mermaid
sequenceDiagram
    actor User
    participant UI as Dashboard
    participant API as Next.js API
    participant DB as Database
    participant Claude as Claude API

    User->>UI: Navigate to Dashboard
    UI->>API: GET /api/summary/weekly
    API->>DB: Fetch entries (past 7 days)
    DB-->>API: Return entries with analysis
    
    API->>API: Aggregate sentiment scores
    API->>API: Calculate theme frequencies
    API->>API: Create data summary (NO full text)
    
    API->>Claude: POST with aggregated data only
    Note over API,Claude: Only sends: theme counts, sentiment numbers, patterns
    Claude-->>API: Return narrative summary
    
    API->>DB: Cache summary
    DB-->>API: Confirm cached
    API-->>UI: Send summary + data
    UI->>UI: Render summary card
    UI->>UI: Display sentiment chart
    UI->>UI: Display theme word cloud
```

---

### **4. COMPONENT ARCHITECTURE DIAGRAM**

```mermaid
graph TD
    A[App Root] --> B[Auth Provider]
    B --> C[Layout]
    C --> D[Sidebar/Navigation]
    C --> E[Main Content Area]
    
    E --> F[Dashboard Page]
    E --> G[Write Page]
    E --> H[Entries Page]
    E --> I[Settings Page]
    
    G --> J[Entry Editor Component]
    J --> K[AI Prompt Display]
    J --> L[Text Editor]
    J --> M[Real-Time Sentiment Indicator]
    J --> N[AI Companion Sidebar]
    
    F --> O[Stats Cards]
    F --> P[Sentiment Chart]
    F --> Q[Theme Word Cloud]
    F --> R[Weekly Summary Card]
    F --> S[Recent Entries List]
    
    H --> T[Entry Card]
    T --> U[Entry Detail Modal]
    U --> V[Analysis Sidebar]
    
    I --> W[Privacy Controls]
    I --> X[Data Export]
    I --> Y[Account Settings]
    
    style J fill:#e1f5ff
    style F fill:#fff4e1
    style I fill:#ffe1e1
```

---

### **5. DATA FLOW DIAGRAM**

```mermaid
graph LR
    A[User Types in Editor] --> B{Text Length > 100?}
    B -->|No| C[Only Local AFINN]
    B -->|Yes| D[Local AFINN + Claude API]
    
    C --> E[Display Sentiment Emoji]
    
    D --> F[Mask PII]
    F --> G[Send to Claude API]
    G --> H[Generate Suggestion]
    H --> I[Display in Sidebar]
    
    E --> J[User Clicks Save]
    D --> J
    
    J --> K[Extract Themes Locally]
    K --> L[Save to Database]
    L --> M{Privacy Setting?}
    M -->|Allowed| N[Store with analysis]
    M -->|Blocked| O[Store without AI data]
    
    N --> P[Update Dashboard]
    O --> P
```

---

### **6. STATE MANAGEMENT DIAGRAM**

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> Authenticated: Login Success
    
    Authenticated --> WritingEntry
    Authenticated --> ViewingDashboard
    Authenticated --> ViewingSettings
    Authenticated --> ViewingEntries
    
    WritingEntry --> AnalyzingLocally: User Types
    AnalyzingLocally --> DisplayingSentiment: AFINN Complete
    DisplayingSentiment --> FetchingAISuggestion: Debounce Triggered
    FetchingAISuggestion --> DisplayingSuggestion: Claude Response
    DisplayingSuggestion --> SavingEntry: User Clicks Save
    SavingEntry --> ViewingDashboard: Save Complete
    
    ViewingDashboard --> LoadingAnalytics: Fetch Data
    LoadingAnalytics --> DisplayingCharts: Data Loaded
    DisplayingCharts --> GeneratingSummary: User Requests Summary
    GeneratingSummary --> DisplayingSummary: Claude Complete
    
    ViewingSettings --> UpdatingPrivacy: User Changes Settings
    UpdatingPrivacy --> ViewingSettings: Settings Saved
    
    ViewingEntries --> ViewingEntryDetail: User Clicks Entry
    ViewingEntryDetail --> EditingEntry: User Clicks Edit
    EditingEntry --> SavingEntry: User Saves Changes
    
    Authenticated --> Unauthenticated: Logout
    Unauthenticated --> [*]
```

---

## 🗄️ DATABASE SCHEMA (PRISMA)

### **Complete Prisma Schema**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MODEL
// ============================================
model User {
  id                String          @id @default(cuid())
  email             String          @unique
  emailVerified     DateTime?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  // User preferences
  preferences       Json?           @default("{}")
  privacySettings   Json?           @default("{\"allowAI\": true, \"allowAnalytics\": true}")
  
  // Relationships
  entries           Entry[]
  weeklySummaries   WeeklySummary[]
  aiPrompts         AIPrompt[]
  
  @@map("users")
}

// ============================================
// JOURNAL ENTRY MODEL
// ============================================
model Entry {
  id                String          @id @default(cuid())
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Content
  content           String          @db.Text
  wordCount         Int             @default(0)
  
  // Local Analysis (AFINN)
  sentimentScore    Float?          // -5 to +5 from AFINN
  sentimentLabel    String?         // "positive", "neutral", "negative"
  themes            String[]        @default([])
  
  // Metadata
  analyzed          Boolean         @default(false)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  // Relationships
  analysis          Analysis?
  suggestions       AISuggestion[]
  
  @@index([userId, createdAt])
  @@map("entries")
}

// ============================================
// DETAILED ANALYSIS MODEL (Optional Deep Analysis)
// ============================================
model Analysis {
  id                String          @id @default(cuid())
  entryId           String          @unique
  entry             Entry           @relation(fields: [entryId], references: [id], onDelete: Cascade)
  
  // Sentiment details
  sentimentScore    Float
  sentimentLabel    String
  emotionalWords    Json            // {positive: ["happy", "excited"], negative: ["sad"]}
  
  // Theme details
  themes            Json            // {theme: frequency} e.g., {"work": 5, "family": 3}
  keyPhrases        String[]
  
  // Context
  contextSummary    String?         @db.Text
  
  // Metadata
  analyzedAt        DateTime        @default(now())
  
  @@map("analyses")
}

// ============================================
// AI SUGGESTION MODEL (Real-Time Companion)
// ============================================
model AISuggestion {
  id                String          @id @default(cuid())
  entryId           String
  entry             Entry           @relation(fields: [entryId], references: [id], onDelete: Cascade)
  
  // Suggestion details
  suggestionText    String          @db.Text
  triggerContext    String?         @db.Text // What triggered this suggestion
  
  // User interaction
  accepted          Boolean         @default(false)
  dismissed         Boolean         @default(false)
  
  // Metadata
  createdAt         DateTime        @default(now())
  
  @@index([entryId])
  @@map("ai_suggestions")
}

// ============================================
// WEEKLY SUMMARY MODEL
// ============================================
model WeeklySummary {
  id                String          @id @default(cuid())
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Time period
  weekStart         DateTime
  weekEnd           DateTime
  
  // Summary content (generated by Claude)
  summary           String          @db.Text
  topThemes         String[]
  correlations      Json?           // Discovered patterns
  
  // Aggregated data
  avgSentiment      Float
  entryCount        Int
  sentimentTrend    Float[]         @default([])
  
  // Metadata
  generatedAt       DateTime        @default(now())
  regenerated       Boolean         @default(false)
  
  @@index([userId, weekStart])
  @@unique([userId, weekStart])
  @@map("weekly_summaries")
}

// ============================================
// AI PROMPT MODEL (Daily Prompts)
// ============================================
model AIPrompt {
  id                String          @id @default(cuid())
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Prompt details
  promptText        String          @db.Text
  context           Json?           // What context was used to generate this
  
  // User interaction
  used              Boolean         @default(false)
  usedAt            DateTime?
  
  // Metadata
  generatedAt       DateTime        @default(now())
  expiresAt         DateTime        // Prompts expire after 24 hours
  
  @@index([userId, generatedAt])
  @@map("ai_prompts")
}
```

---

## 📁 PROJECT STRUCTURE

```
mindful-space/
├── prisma/
│   ├── schema.prisma                 # Database schema (above)
│   └── migrations/                   # Auto-generated migrations
│
├── public/
│   ├── icons/                        # App icons for PWA
│   └── manifest.json                 # PWA manifest
│
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── (auth)/                   # Auth routes group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/              # Protected routes group
│   │   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Analytics dashboard
│   │   │   ├── write/
│   │   │   │   └── page.tsx          # Entry editor
│   │   │   ├── entries/
│   │   │   │   ├── page.tsx          # List all entries
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Entry detail view
│   │   │   └── settings/
│   │   │       └── page.tsx          # Settings & privacy
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts      # NextAuth config
│   │   │   │
│   │   │   ├── entries/
│   │   │   │   ├── route.ts          # GET all, POST new
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET, PUT, DELETE specific
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   ├── prompt/
│   │   │   │   │   └── route.ts      # Generate daily prompt
│   │   │   │   ├── suggest/
│   │   │   │   │   └── route.ts      # Real-time suggestions
│   │   │   │   └── summary/
│   │   │   │       ├── weekly/
│   │   │   │       │   └── route.ts  # Weekly summary
│   │   │   │       └── regenerate/
│   │   │   │           └── route.ts  # Regenerate summary
│   │   │   │
│   │   │   └── analysis/
│   │   │       ├── sentiment/
│   │   │       │   └── route.ts      # Store local analysis
│   │   │       └── trends/
│   │   │           └── route.ts      # Get sentiment trends
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── journal/
│   │   │   ├── EntryEditor.tsx       # Main writing interface
│   │   │   ├── AIPromptCard.tsx      # Display daily prompt
│   │   │   ├── SentimentIndicator.tsx # Real-time emoji
│   │   │   ├── AICompanion.tsx       # Suggestion sidebar
│   │   │   ├── EntryCard.tsx         # Entry preview card
│   │   │   └── EntryList.tsx         # List of entries
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatsOverview.tsx     # Key metrics
│   │   │   ├── SentimentChart.tsx    # Line chart (Recharts)
│   │   │   ├── ThemeCloud.tsx        # Word cloud visualization
│   │   │   ├── WeeklySummaryCard.tsx # Summary display
│   │   │   └── RecentEntries.tsx     # Latest entries
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Desktop sidebar
│   │   │   ├── MobileNav.tsx         # Mobile bottom nav
│   │   │   ├── Header.tsx            # Page header
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── settings/
│   │   │   ├── PrivacyControls.tsx   # Toggle AI features
│   │   │   ├── DataExport.tsx        # Export functionality
│   │   │   └── AccountSettings.tsx
│   │   │
│   │   └── onboarding/
│   │       ├── OnboardingFlow.tsx    # 3-step intro
│   │       └── OnboardingStep.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── supabase.ts               # Supabase client (if using)
│   │   ├── anthropic.ts              # Claude API wrapper
│   │   ├── sentiment.ts              # AFINN wrapper functions
│   │   ├── theme-extraction.ts       # Custom theme logic
│   │   ├── pii-masking.ts            # PII detection & masking
│   │   ├── utils.ts                  # Helper functions
│   │   └── constants.ts              # App constants
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                # Authentication hook
│   │   ├── useEntries.ts             # Fetch entries with SWR
│   │   ├── useAnalysis.ts            # Trigger analysis
│   │   ├── useSentiment.ts           # Real-time sentiment
│   │   ├── useDebounce.ts            # Debounce utility
│   │   └── useLocalStorage.ts        # Persist state locally
│   │
│   ├── types/
│   │   ├── database.ts               # Prisma types
│   │   ├── ai.ts                     # AI response types
│   │   ├── api.ts                    # API request/response types
│   │   └── index.ts                  # Shared types
│   │
│   └── middleware.ts                 # Auth middleware for protected routes
│
├── .env.local                        # Environment variables (DO NOT COMMIT)
├── .env.example                      # Template for env vars
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── README.md
└── DOCUMENTATION.md                  # This file
```

---

## 🔧 TECHNOLOGY STACK DETAILS

### **Frontend**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.x
- **UI Components:** shadcn/ui (Radix UI)
- **Charts:** Recharts 2.x
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation

### **Backend**
- **API:** Next.js API Routes
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma 5.x
- **Authentication:** Supabase Auth or NextAuth.js
- **AI:** Anthropic Claude API (Sonnet 4)

### **Local AI Processing**
- **Sentiment:** `sentiment` npm package (AFINN-165)
- **Theme Extraction:** `compromise` npm package
- **PII Detection:** Custom regex + `email-regex`, `phone-regex`

### **DevOps**
- **Hosting:** Vercel
- **Database:** Supabase (free tier)
- **Version Control:** Git + GitHub
- **Environment:** Node.js 18+

---

## 📦 DEPENDENCIES

### **package.json**

```json
{
  "name": "mindful-space",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.40.0",
    "@prisma/client": "^5.20.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-slot": "^1.0.2",
    "@supabase/supabase-js": "^2.45.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "compromise": "^14.10.0",
    "email-regex": "^5.0.0",
    "lucide-react": "^0.400.0",
    "next": "14.2.0",
    "phone-regex": "^2.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-hook-form": "^7.52.0",
    "recharts": "^2.12.0",
    "sentiment": "^5.0.2",
    "swr": "^2.2.5",
    "tailwind-merge": "^2.3.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.19",
    "eslint": "^8",
    "eslint-config-next": "14.2.0",
    "postcss": "^8.4.38",
    "prisma": "^5.20.0",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

---

## 🔐 ENVIRONMENT VARIABLES

### **.env.example**

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Anthropic Claude API
ANTHROPIC_API_KEY="sk-ant-api03-..."

# NextAuth (if using)
NEXTAUTH_SECRET="generate-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 🚀 SETUP INSTRUCTIONS FOR CURSOR

### **Step 1: Initialize Project**

```bash
# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest mindful-space --typescript --tailwind --app --use-npm

# Navigate to project
cd mindful-space

# Install additional dependencies
npm install @anthropic-ai/sdk @prisma/client @supabase/supabase-js sentiment compromise recharts swr lucide-react @radix-ui/react-dialog @radix-ui/react-dropdown-menu class-variance-authority clsx tailwind-merge email-regex phone-regex zod react-hook-form

# Install dev dependencies
npm install -D prisma @types/node

# Initialize Prisma
npx prisma init
```

### **Step 2: Configure Database**

1. Copy the Prisma schema from this document to `prisma/schema.prisma`
2. Update `.env` with your database URL
3. Push schema to database:
```bash
npx prisma db push
npx prisma generate
```

### **Step 3: Set Up shadcn/ui**

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add switch
```

### **Step 4: Create Directory Structure**

```bash
# Create all necessary directories
mkdir -p src/components/{ui,journal,dashboard,layout,settings,onboarding}
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/app/{(auth)/login,(auth)/signup,(dashboard)/dashboard,(dashboard)/write,(dashboard)/entries/(dashboard)/settings}
mkdir -p src/app/api/{auth,entries,ai/prompt,ai/suggest,ai/summary,analysis}
```

### **Step 5: Configure Environment Variables**

1. Copy `.env.example` to `.env.local`
2. Fill in all required values
3. Never commit `.env.local` to version control

---

## 🎨 DESIGN SYSTEM

### **Color Palette (Tailwind Config)**

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary brand color (teal)
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Main brand color
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Sentiment colors
        sentiment: {
          positive: '#10b981',    // Green
          neutral: '#8b5cf6',     // Purple
          negative: '#f59e0b',    // Amber
        }
      }
    }
  }
}
```

### **Typography Scale**

```css
/* Base: 16px */
.text-xs    { font-size: 12px; } /* Timestamps */
.text-sm    { font-size: 14px; } /* Secondary text */
.text-base  { font-size: 16px; } /* Body text */
.text-lg    { font-size: 18px; } /* Entry text */
.text-xl    { font-size: 20px; } /* Section headers */
.text-2xl   { font-size: 24px; } /* Page titles */
```

### **Spacing System**

```css
/* Use Tailwind's default spacing scale */
p-2  /* 8px */
p-4  /* 16px */
p-6  /* 24px */
p-8  /* 32px */
```

---

## 🔄 KEY WORKFLOWS

### **Workflow 1: User Writes Entry**

1. User navigates to `/write`
2. Component loads daily AI prompt (from cache or API)
3. User starts typing
4. Every keystroke triggers local AFINN analysis (instant sentiment display)
5. After 2-second typing pause AND >100 characters:
   - Text is PII-masked
   - Sent to `/api/ai/suggest`
   - Claude generates follow-up question
   - Displayed in sidebar
6. User clicks "Save"
7. Final AFINN analysis + theme extraction runs
8. Entry saved to database with analysis
9. Dashboard cache invalidated (SWR revalidation)

### **Workflow 2: Generate Weekly Summary**

1. User navigates to dashboard
2. Component checks if weekly summary exists for current week
3. If not exists:
   - Call `/api/ai/summary/weekly`
   - API aggregates entries from past 7 days
   - Extract: theme counts, sentiment scores, entry count
   - Send ONLY aggregated data to Claude (not full entries)
   - Claude generates narrative summary
   - Cache summary in database
4. Display summary card with:
   - Text summary
   - Top 3 themes
   - Sentiment trend chart
   - Patterns discovered

### **Workflow 3: Privacy Controls**

1. User navigates to `/settings`
2. Toggle "Allow AI Analysis"
   - If OFF: Future entries don't call Claude API
   - AFINN still runs locally
3. Click "Export My Data"
   - Generate JSON of all entries
   - Download file
4. Click "Delete Account"
   - Confirmation dialog
   - Delete all user data
   - Sign out

---

## 🧪 TESTING STRATEGY

### **Manual Testing Checklist**

**Authentication:**
- [ ] Sign up with new account
- [ ] Log in with existing account
- [ ] Log out
- [ ] Protected routes redirect to login

**Entry Creation:**
- [ ] Create new entry
- [ ] See real-time sentiment indicator
- [ ] Receive AI suggestion after typing
- [ ] Save entry successfully
- [ ] Edit existing entry
- [ ] Delete entry

**Dashboard:**
- [ ] View sentiment chart
- [ ] See theme word cloud
- [ ] Generate weekly summary
- [ ] Click chart to see entry detail
- [ ] View recent entries list

**Privacy:**
- [ ] Toggle AI features off
- [ ] Export data as JSON
- [ ] Verify PII masking (check network tab)
- [ ] Delete account

**Responsive Design:**
- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1280px width)

---

## 📊 SUCCESS METRICS (FOR DEMO)

### **User Engagement**
- Average words per entry (show increasing trend)
- Journaling streak (consecutive days)
- AI suggestion acceptance rate (how often users engage with suggestions)

### **Insightfulness**
- Number of themes identified
- Sentiment patterns discovered
- Correlations found (e.g., "mood improves on exercise days")

### **Privacy & Trust**
- Percentage of analysis done locally vs. cloud
- PII masking effectiveness (show before/after)
- User control features (toggles, export, delete)

### **AI Application**
- Number of AI features integrated (7 features)
- Diversity of AI use cases (prompts, suggestions, summaries, analysis)
- Quality of prompt engineering (show examples)

### **Code Quality**
- TypeScript coverage (100%)
- Component modularity (single responsibility)
- Error handling (try-catch, fallbacks)
- Performance (Lighthouse score >90)

---

## 🎯 CURSOR AI PROMPT TEMPLATES

### **When Starting a New Component:**

```
Create a React component for [COMPONENT NAME] with the following requirements:
- TypeScript with proper type definitions
- Uses shadcn/ui components where appropriate
- Tailwind CSS for styling
- Follows the mobile-first responsive design pattern
- Includes proper error handling
- Exports as default

Component should:
[LIST SPECIFIC REQUIREMENTS]

Example usage:
[SHOW HOW COMPONENT WILL BE USED]
```

### **When Creating API Route:**

```
Create a Next.js 14 API route at /api/[ROUTE] with:
- TypeScript
- Proper error handling (try-catch)
- Input validation using Zod
- Authentication check (if needed)
- Database operations using Prisma
- Return JSON responses with proper status codes

Endpoint should:
[LIST REQUIREMENTS]

Request body schema:
[DEFINE SCHEMA]

Response schema:
[DEFINE SCHEMA]
```

### **When Implementing AI Feature:**

```
Implement AI-powered [FEATURE] with:
- Anthropic Claude API integration
- PII masking before sending to API
- Error handling and retry logic
- Response caching (if applicable)
- TypeScript type safety

Requirements:
[LIST REQUIREMENTS]

Prompt template:
[SHOW PROMPT STRUCTURE]
```

---

## 📝 IMPLEMENTATION PRIORITY

### **Phase 1: Foundation (Hours 0-5)**
1. ✅ Project setup and dependencies
2. ✅ Database schema and migrations
3. ✅ Authentication system
4. ✅ Basic routing structure
5. ✅ Prisma client configuration

### **Phase 2: Core Features (Hours 5-15)**
6. ✅ Entry CRUD operations
7. ✅ AFINN sentiment analysis integration
8. ✅ Real-time sentiment indicator
9. ✅ Basic theme extraction
10. ✅ Entry list and detail views

### **Phase 3: AI Features (Hours 15-22)**
11. ✅ Claude API integration
12. ✅ PII masking functions
13. ✅ Daily prompt generation
14. ✅ Real-time AI companion (with debounce)
15. ✅ Weekly summary generation

### **Phase 4: Dashboard (Hours 22-26)**
16. ✅ Sentiment trend chart (Recharts)
17. ✅ Theme word cloud
18. ✅ Stats overview
19. ✅ Recent entries widget
20. ✅ Weekly summary display

### **Phase 5: Polish (Hours 26-30)**
21. ✅ Privacy controls
22. ✅ Data export functionality
23. ✅ Onboarding flow
24. ✅ Mobile responsiveness
25. ✅ Error states and loading indicators

### **Phase 6: Testing (Hours 30-32)**
26. ✅ Manual testing all features
27. ✅ Bug fixes
28. ✅ Performance optimization

### **Phase 7: Deployment (Hours 32-34)**
29. ✅ Deploy to Vercel
30. ✅ Configure environment variables
31. ✅ Test production build

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue: Prisma Client Not Found**
```bash
# Solution:
npx prisma generate
```

### **Issue: Database Connection Failed**
```bash
# Solution: Check DATABASE_URL in .env.local
# Ensure PostgreSQL is running
# Verify connection string format
```

### **Issue: API Rate Limit (Claude)**
```javascript
// Solution: Implement caching
const cached = await getCachedResponse(key);
if (cached) return cached;

const response = await callClaudeAPI();
await cacheResponse(key, response, 3600); // Cache for 1 hour
```

### **Issue: Build Fails on Vercel**
```bash
# Solution: Check these common causes:
# 1. Missing environment variables in Vercel dashboard
# 2. Prisma not generating during build
# Add to package.json:
"scripts": {
  "postinstall": "prisma generate"
}
```

---

## 🎯 DEMO PREPARATION

### **Demo Data Setup**

Create 10-15 sample entries with:
- Varying sentiment (positive, neutral, negative)
- Different themes (work, family, health, relationships)
- Different lengths (short, medium, long)
- Spread across 30 days

### **Demo Flow (5-7 minutes)**

**1. Opening (30 sec)**
- Problem statement
- Show blank journaling app (anxiety-inducing)

**2. Onboarding (30 sec)**
- Show your 3-step onboarding
- Set goal: "Reduce work stress"

**3. Writing Feature (2 min)**
- Show AI-generated prompt based on goal
- Start typing entry
- Demonstrate real-time sentiment indicator
- Show AI companion suggestion appear
- Accept suggestion and continue writing
- Save entry

**4. Dashboard Analytics (2 min)**
- Navigate to dashboard
- Show sentiment trend over 30 days
- Point out interesting patterns
- Display theme word cloud
- Open weekly summary
- Highlight correlation discovered

**5. Privacy Features (1 min)**
- Navigate to settings
- Show privacy controls
- Demonstrate data export
- Explain PII masking

**6. Technical Highlights (1 min)**
- Show code quality (TypeScript, modular components)
- Explain hybrid AI approach
- Mention performance optimizations

**7. Closing (30 sec)**
- Recap key innovations
- Future roadmap
- Thank judges

---

## 📚 ADDITIONAL RESOURCES

### **Documentation Links**
- Next.js 14: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Anthropic Claude: https://docs.anthropic.com
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com/docs
- Recharts: https://recharts.org/en-US

### **Design Inspiration**
- Notion (clean, focused writing)
- Day One (beautiful journaling UI)
- Linear (smooth animations)
- Reflect (minimalist design)

---

## ✅ FINAL CHECKLIST BEFORE SUBMISSION

**Code Quality:**
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings fixed
- [ ] No console.logs in production code
- [ ] Comments on complex logic
- [ ] Consistent naming conventions

**Functionality:**
- [ ] All 7 MVP features working
- [ ] No critical bugs
- [ ] Error states handled gracefully
- [ ] Loading states implemented

**Privacy & Security:**
- [ ] Environment variables not committed
- [ ] PII masking tested and working
- [ ] Authentication protecting routes
- [ ] HTTPS enabled (Vercel default)

**Documentation:**
- [ ] README.md completed
- [ ] Design document finished
- [ ] Code comments added
- [ ] API endpoints documented

**Deployment:**
- [ ] App deployed to Vercel
- [ ] All environment variables configured
- [ ] Database accessible
- [ ] Live URL working

**Presentation:**
- [ ] Video recorded (5-7 minutes)
- [ ] Demo data prepared
- [ ] Key talking points written
- [ ] Practice run completed

---

## 🎉 YOU'RE READY TO BUILD!

This document contains everything you need to build MindfulSpace with Cursor AI. Start by:

1. Setting up the project structure
2. Implementing the database schema
3. Building core features one by one
4. Testing as you go
5. Deploying early and often

Remember: **Progress over perfection**. Get something working, then iterate.

Good luck! You've got this! 🚀

---

**Document Version:** 1.0  
**Last Updated:** January 30, 2026  
**Project Deadline:** February 1, 2026 at 5:00 PM PST
