# Fynd AI Intern – Take Home Assessment


https://github.com/user-attachments/assets/15841403-3b4d-49dc-b006-521b1f565d67



## 🚀 Live Deployments

- **User Dashboard**: https://fynd-lth-feedback-ai.vercel.app/
- **Admin Dashboard**: https://fynd-lth-feedback-ai.vercel.app/admin
- **GitHub Repository**: https://github.com/shivamlth27/Fynd-Feedback-AI

## 📋 Project Overview

This repository contains the complete submission for the Fynd AI Intern Take Home Assessment, including:

1. **Task 1**: Rating prediction system using prompt engineering (Jupyter Notebook)
2. **Task 2**: Production-grade two-dashboard AI feedback system (Web Application)

## 🏗️ Architecture

A full-stack Next.js 14 application with:
- **Frontend**: React 18 with TypeScript
- **Backend**: Next.js API Routes (RESTful)
- **Database**: PostgreSQL via Prisma ORM
- **LLM**: OpenRouter API (server-side)
- **Deployment**: Vercel (serverless)

### Key Features
✅ Server-side LLM processing (no client-side API keys)  
✅ Persistent PostgreSQL database  
✅ Rate limiting (20 req/min per IP)  
✅ Graceful error handling (empty reviews, LLM failures)  
✅ Real-time admin dashboard with auto-refresh  
✅ JSON schema validation  
✅ Fully deployed and publicly accessible

## 📁 Repository Structure

```
fynd/
├── app/                          # Next.js app directory
│   ├── page.tsx                  # User Dashboard (/)
│   ├── admin/page.tsx            # Admin Dashboard (/admin)
│   ├── api/reviews/route.ts      # API endpoints (GET, POST)
│   ├── layout.tsx                # Root layout with navigation + GitHub link
│   └── globals.css               # Global styles
├── lib/                          # Service layer
│   ├── llm.ts                    # LLM service (OpenRouter)
│   ├── prisma.ts                 # Prisma client setup
│   └── rateLimit.ts              # Rate limiting logic
├── prisma/                       # Database schema
│   └── schema.prisma             # PostgreSQL models
├── docs/                         # Documentation
│   ├── API_DOCUMENTATION.md      # API reference
│   ├── ARCHITECTURE.md           # System architecture
│   └── SETUP.md                  # Detailed local setup guide
├── task1_rating_prediction.ipynb # Task 1: Prompt engineering notebook
├── Report_Shivam.pdf                # Take-home submission report
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## 🎯 Task 1 - Rating Prediction via Prompting

**Location**: [`task1_rating_prediction.ipynb`](task1_rating_prediction.ipynb)

### Approach

Designed and evaluated **3 different prompting approaches** for Yelp review rating prediction:

1. **Approach 1 - Basic Zero-Shot**: Simple, direct instruction
2. **Approach 2 - Enhanced with Sentiment Guidelines**: Explicit rating criteria
3. **Approach 3 - Few-Shot with Examples**: Concrete examples for each rating level

### Evaluation Methodology

- **Dataset**: Yelp Reviews from Kaggle (sampled ~200 rows)
- **Metrics**: Accuracy, JSON validity rate, reliability
- **Output**: Structured JSON with `predicted_stars` and `explanation`

### Results Summary

| Approach | Accuracy | JSON Validity | Best For |
|----------|----------|---------------|----------|
| Approach 1 | 68.50% | 100% | Highest raw accuracy, simple and clear reviews |
| Approach 2 | 66.50% | 100% | Balanced accuracy vs. cost for mixed sentiment reviews |
| Approach 3 | 66.50% | 100% | Most detailed and consistent explanations |

<img width="1755" height="490" alt="image" src="https://github.com/user-attachments/assets/9a9f2363-4f98-4cf4-ac93-0f8126cce08a" />

## 🎯 Task 2 - Two-Dashboard AI Feedback System

### A. User Dashboard ([Live Demo](https://fynd-lth-feedback-ai.vercel.app/))

**Features**:
- ⭐ Star rating selector (1-5)
- ✍️ Review text input with character count
- 🤖 AI-generated personalized response
- ✅ Clear success/error states
- 🚦 Real-time validation

**User Flow**:
1. Select rating (1-5 stars)
2. Write review
3. Submit → AI processes feedback
4. Receive personalized AI response
5. Feedback stored in database

### B. Admin Dashboard ([Live Demo](https://fynd-lth-feedback-ai.vercel.app/admin))

**Features**:
- 📊 Live feed with auto-refresh (every 6s)
- 📈 Analytics cards (total, average, distribution)
- 🔍 Filter by rating
- 📋 Full table view with:
  - User rating and review
  - AI-generated summary
  - Recommended next actions
  - Timestamps
- 🔄 Manual refresh button

### Technical Highlights

#### Server-Side LLM Processing
```typescript
// All LLM calls happen server-side
export async function generateReviewInsights(payload: LlmPayload): Promise<LlmResponse> {
  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
  });
  
  // Returns: userReply, summary, recommendedNext
}
```

#### API Endpoints with JSON Schemas

**POST /api/reviews**
```typescript
Request:  { rating: number, reviewText: string }
Response: { data: { ...review, userReply, summary, recommendedNext } }
```

**GET /api/reviews**
```typescript
Response: { data: Review[] }  // Sorted by createdAt desc
```

#### Error Handling
- ❌ Empty reviews → 400 with clear message
- ❌ Invalid ratings → 400 with validation error
- ❌ LLM failures → Fallback responses
- ❌ Rate limiting → 429 with retry-after header
- ❌ Database errors → 500 with generic message

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or use a managed service like Supabase/Neon)
- OpenRouter API key (get free tier at https://openrouter.ai/)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd fynd
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# LLM Configuration
OPENROUTER_API_KEY="your-api-key-here"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"  # Optional
OPENROUTER_MODEL="openai/gpt-4o-mini"               # Optional, default: gpt-4o-mini

# Admin Authentication (optional)
ADMINS_BASIC_AUTH_TOKEN="your-secret-token"                    # Server-side
NEXT_PUBLIC_ADMINS_BASIC_AUTH_TOKEN="your-secret-token"        # Client-side
```

4. **Setup database**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (first time)
npx prisma migrate dev --name init

# Or push schema (for quick dev)
npm run prisma:push
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.



## 📚 Documentation

- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Architecture](docs/ARCHITECTURE.md)** - System design and data flow
- **[Setup Guide](docs/SETUP.md)** - Step-by-step local setup instructions
- **[Submission Report](Report_Shivam.pdf)** - Full write-up for Tasks 1 & 2

## 🧪 Testing the Application

### User Dashboard Test Flow
1. Go to https://fynd-lth-feedback-ai.vercel.app/
2. Select a rating (e.g., 5 stars)
3. Enter review: "Amazing service and great food!"
4. Click "Submit feedback"
5. See AI-generated response

### Admin Dashboard Test Flow
1. Go to https://fynd-lth-feedback-ai.vercel.app/admin
2. View live feed of all submissions
3. Use filter dropdown to filter by rating
4. Click "Refresh now" for manual update
5. Observe auto-refresh every 6 seconds

--- 






