# System Architecture

## Overview

This is a production-grade, full-stack web application implementing a two-dashboard AI feedback system. The system collects user feedback, processes it with LLMs, and provides both user-facing responses and admin analytics.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├──────────────────────────────┬──────────────────────────────────┤
│     User Dashboard (/)        │    Admin Dashboard (/admin)      │
│  - Rating selector (1-5)      │  - Live feed (auto-refresh)      │
│  - Review input form          │  - Analytics cards               │
│  - AI response display        │  - Filterable table              │
│  - Success/error states       │  - Manual refresh button         │
└──────────────┬───────────────┴───────────────┬──────────────────┘
               │                               │
               │  HTTPS                        │  HTTPS (+ Auth)
               │                               │
┌──────────────▼───────────────────────────────▼──────────────────┐
│                      API Layer (Next.js)                         │
├──────────────────────────────────────────────────────────────────┤
│                    /api/reviews route                            │
│                                                                  │
│  POST /api/reviews              GET /api/reviews                │
│  - Validate input               - Auth check (optional)         │
│  - Rate limiting                - Rate limiting                 │
│  - Call LLM service             - Query database                │
│  - Save to database             - Return all reviews            │
│  - Return response              - Sort by timestamp             │
└────────┬────────────────────────────────┬─────────────┬─────────┘
         │                                │             │
         │                                │             │
    ┌────▼─────┐                    ┌─────▼─────┐  ┌──▼──────┐
    │   LLM    │                    │  Prisma   │  │  Rate   │
    │ Service  │                    │   ORM     │  │ Limiter │
    │          │                    │           │  │         │
    │ OpenRouter│                   └─────┬─────┘  │In-Memory│
    │  API     │                          │        │  Store  │
    └──────────┘                          │        └─────────┘
                                    ┌─────▼─────┐
                                    │PostgreSQL │
                                    │ Database  │
                                    │           │
                                    │ Reviews   │
                                    │  Table    │
                                    └───────────┘
```

## Component Architecture

### 1. Frontend (React/Next.js)

**User Dashboard (`app/page.tsx`)**
- React component with form state management
- Client-side validation
- Async API calls with error handling
- Loading states and success/error feedback
- Responsive design

**Admin Dashboard (`app/admin/page.tsx`)**
- Auto-polling every 6 seconds
- Manual refresh capability
- Rating filter dropdown
- Real-time analytics (avg, counts)
- Sortable/filterable table view

**Shared Layout (`app/layout.tsx`)**
- Common header with navigation
- Responsive container
- Global styles
- Font optimization

### 2. API Layer (Next.js API Routes)

**Route Handler (`app/api/reviews/route.ts`)**

```typescript
POST /api/reviews
├─ Rate limiting check
├─ Input validation
│  ├─ Rating: 1-5 integer
│  └─ Review: non-empty string
├─ LLM processing
│  ├─ Generate userReply
│  ├─ Generate summary
│  └─ Generate recommendedNext
├─ Database save
└─ Return enriched response

GET /api/reviews
├─ Rate limiting check
├─ Authentication check (optional)
├─ Database query (all reviews)
└─ Return sorted results
```

### 3. Service Layer

**LLM Service (`lib/llm.ts`)**
- OpenAI SDK client (OpenRouter compatible)
- Structured prompt engineering
- JSON response format enforcement
- Error handling with fallbacks
- Configurable temperature & model

**Database Service (`lib/prisma.ts`)**
- Prisma client singleton
- Connection pooling
- Development logging
- Production optimization

**Rate Limiter (`lib/rateLimit.ts`)**
- In-memory token bucket
- Per-IP + per-route tracking
- Sliding window (60s)
- Retry-After header support

### 4. Data Layer

**Prisma Schema (`prisma/schema.prisma`)**
```prisma
model Review {
  id              String   @id @default(cuid())
  rating          Int
  reviewText      String
  userReply       String
  summary         String
  recommendedNext String
  status          String   @default("completed")
  createdAt       DateTime @default(now())
}
```

**Database Provider**: PostgreSQL (production), flexible for SQLite (dev)

## Data Flow

### User Submission Flow

```
1. User fills form → selects rating + writes review
                   ↓
2. Client validates → checks non-empty text
                   ↓
3. POST request → /api/reviews with JSON body
                   ↓
4. API validates → rating range, text presence
                   ↓
5. Rate limiter → checks IP-based limits
                   ↓
6. LLM service → generates 3 AI fields
                   ↓
7. Database save → Prisma creates record
                   ↓
8. Response → returns full review object
                   ↓
9. UI updates → shows AI reply + success message
```

### Admin Polling Flow

```
1. Component mounts → initial fetch
                    ↓
2. Set interval → every 6 seconds
                    ↓
3. GET request → /api/reviews with auth token
                    ↓
4. Rate limiter → checks IP-based limits
                    ↓
5. Auth check → validates bearer token (if configured)
                    ↓
6. Database query → fetch all, sort by createdAt desc
                    ↓
7. Response → returns array of reviews
                    ↓
8. State update → triggers re-render
                    ↓
9. UI refresh → table updates, analytics recalculate
```

## Technology Stack

| Layer           | Technology                  | Purpose                           |
|-----------------|-----------------------------|-----------------------------------|
| **Frontend**    | React 18, Next.js 14        | UI rendering, routing             |
| **Styling**     | CSS (Custom)                | Responsive design                 |
| **API**         | Next.js API Routes          | RESTful endpoints                 |
| **LLM**         | OpenRouter API              | AI text generation                |
| **ORM**         | Prisma                      | Type-safe database access         |
| **Database**    | PostgreSQL                  | Persistent data storage           |
| **Validation**  | Runtime type checks         | Input validation                  |
| **Deployment**  | Vercel                      | Serverless hosting                |

## Security Considerations

1. **Rate Limiting**: 20 requests/minute per IP
2. **Input Validation**: Server-side checks for all inputs
3. **Admin Auth**: Optional bearer token for GET endpoint
4. **Environment Variables**: Secrets not in codebase
5. **Error Handling**: No sensitive data in error messages
6. **Server-Side LLM**: API keys never exposed to client

## Scalability Considerations

1. **Database Indexes**: `createdAt` for sorting
2. **Connection Pooling**: Prisma handles connections
3. **Serverless**: Auto-scaling on Vercel
4. **Stateless API**: No session management
5. **Async Operations**: Non-blocking LLM calls
6. **Rate Limiting**: Prevents abuse

## Error Handling Strategy

```
Client Error (400s)
├─ 400: Invalid input → user-friendly message
├─ 401: Unauthorized → "Unauthorized" message
└─ 429: Rate limited → retry-after guidance

Server Error (500s)
├─ LLM failure → fallback responses used
├─ Database failure → generic error message
└─ Network failure → retry mechanism suggested
```

## Monitoring & Observability

- Console logging for errors (server-side)
- Client-side error display
- Response time tracking (browser DevTools)
- Database query logging (development)

## Future Enhancements

1. **Caching**: Redis for admin dashboard data
2. **Webhooks**: Real-time updates via WebSockets
3. **Pagination**: For large datasets
4. **Search**: Full-text search on reviews
5. **Export**: CSV/JSON download capability
6. **Analytics**: Advanced metrics and charts
