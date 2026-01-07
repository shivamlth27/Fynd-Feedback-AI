# API Documentation

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://fynd-lth-feedback-ai.vercel.app/api`

## Endpoints

### POST /api/reviews

Submit a new review with user feedback.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "rating": 4,
  "reviewText": "Great service and amazing food! Highly recommend."
}
```

**Request Schema:**
- `rating` (required): Integer between 1-5
- `reviewText` (required): Non-empty string (max recommended: 2000 characters)

**Success Response (201 Created):**
```json
{
  "data": {
    "id": "clxxx123456",
    "rating": 4,
    "reviewText": "Great service and amazing food! Highly recommend.",
    "userReply": "Thank you so much for your wonderful feedback! We're thrilled to hear you enjoyed our service and food. We can't wait to welcome you back!",
    "summary": "Customer highly satisfied with service and food quality.",
    "recommendedNext": "Share this positive feedback with the team and monitor for consistency.",
    "status": "completed",
    "createdAt": "2026-01-07T10:30:00.000Z"
  }
}
```

**Error Responses:**

*400 Bad Request - Invalid Rating:*
```json
{
  "error": "rating must be an integer between 1 and 5"
}
```

*400 Bad Request - Empty Review:*
```json
{
  "error": "reviewText cannot be empty"
}
```

*429 Too Many Requests - Rate Limited:*
```json
{
  "error": "Rate limit exceeded. Please retry shortly.",
  "retryAfterSec": 45
}
```
**Headers:** `Retry-After: 45`

*500 Internal Server Error:*
```json
{
  "error": "Failed to process review"
}
```

---

### GET /api/reviews

Retrieve all submitted reviews (Admin only).

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>  // Required if ADMINS_BASIC_AUTH_TOKEN is set
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "clxxx123456",
      "rating": 5,
      "reviewText": "Excellent experience!",
      "userReply": "Thank you for the amazing feedback!",
      "summary": "Customer very satisfied with overall experience.",
      "recommendedNext": "Continue maintaining high standards.",
      "status": "completed",
      "createdAt": "2026-01-07T10:30:00.000Z"
    },
    {
      "id": "clxxx123457",
      "rating": 2,
      "reviewText": "Service was slow and food was cold.",
      "userReply": "We apologize for the disappointing experience. We'll address these issues immediately.",
      "summary": "Customer dissatisfied with service speed and food temperature.",
      "recommendedNext": "Investigate kitchen operations and staff training needs.",
      "status": "completed",
      "createdAt": "2026-01-07T09:15:00.000Z"
    }
  ]
}
```

**Error Responses:**

*401 Unauthorized:*
```json
{
  "error": "Unauthorized"
}
```

*429 Too Many Requests - Rate Limited:*
```json
{
  "error": "Rate limit exceeded. Please retry shortly.",
  "retryAfterSec": 30
}
```
**Headers:** `Retry-After: 30`

*500 Internal Server Error:*
```json
{
  "error": "Failed to load reviews"
}
```

---

## Rate Limiting

Both endpoints implement rate limiting based on IP address:

- **Limit**: 20 requests per minute per IP
- **Window**: 60 seconds (rolling)
- **Headers**: `Retry-After` header provided when rate limited

---

## Data Models

### Review Schema

```typescript
{
  id: string;              // Unique identifier (cuid)
  rating: number;          // 1-5 star rating
  reviewText: string;      // User's review text
  userReply: string;       // AI-generated reply to user
  summary: string;         // AI-generated admin summary
  recommendedNext: string; // AI-suggested next action
  status: string;          // Status (default: "completed")
  createdAt: string;       // ISO 8601 timestamp
}
```

---

## Error Handling

The API implements graceful error handling for:

1. **Empty Reviews**: Returns 400 with clear error message
2. **Invalid Ratings**: Validates range (1-5) and type (integer)
3. **LLM Failures**: Returns 500 with fallback behavior
4. **Database Errors**: Returns 500 with generic error message
5. **Rate Limiting**: Returns 429 with retry information

---

## LLM Processing

All LLM calls are server-side and generate:

1. **User Reply**: 2-3 sentences, empathetic response
2. **Summary**: One-sentence admin summary
3. **Recommended Next**: Actionable step for operations/support

**LLM Configuration:**
- Provider: OpenRouter (configurable)
- Model: `gpt-4o-mini` (default, configurable)
- Temperature: 0.4 (for consistency)
- Format: JSON response enforced

---

## Authentication

Admin endpoints require Bearer token authentication:

```
Authorization: Bearer <ADMINS_BASIC_AUTH_TOKEN>
```

Token is configured via environment variable `ADMINS_BASIC_AUTH_TOKEN`.

If not set, GET endpoint is open (not recommended for production).
