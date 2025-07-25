# CheatSheet API Documentation

## Overview

The CheatSheet API is a robust, production-ready REST API built with Next.js 14, featuring comprehensive validation, authentication, rate limiting, and error handling.

## Base URL

```
Production: https://your-domain.com/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication

All API endpoints require authentication via NextAuth session cookies.

```typescript
// Headers required
Cookie: next-auth.session-token=...
```

## API Response Format

All API responses follow a consistent structure:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
    details?: any
  }
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    timestamp: string
    requestId: string
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input data |
| `RATE_LIMITED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| GET endpoints | 100 req/min | 60 seconds |
| POST endpoints | 20-30 req/min | 60 seconds |
| PUT/DELETE endpoints | 50 req/min | 60 seconds |

## Endpoints

### Cheatsheets

#### List Cheatsheets

```http
GET /api/v1/cheatsheets
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `q` (string, optional): Search query
- `topic` (string, optional): Filter by topic

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "title": "JavaScript Essentials",
      "description": "Core JavaScript concepts",
      "topic": "Programming",
      "color": "#f7df1e",
      "order": 1,
      "isPublic": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "_count": {
        "entries": 5
      },
      "author": {
        "id": "usr123...",
        "name": "John Doe",
        "email": "john@example.com",
        "isAdmin": false
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    },
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_1234567890_abc123"
  }
}
```

#### Create Cheatsheet

```http
POST /api/v1/cheatsheets
```

**Request Body:**
```json
{
  "title": "React Hooks Guide",
  "description": "Comprehensive guide to React hooks",
  "topic": "Frontend",
  "color": "#61dafb"
}
```

**Validation Rules:**
- `title`: Required, 1-100 characters, trimmed
- `description`: Optional, max 500 characters
- `topic`: Required, 1-50 characters, trimmed
- `color`: Optional, valid hex color (e.g., #FF0000)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clx456...",
    "title": "React Hooks Guide",
    "description": "Comprehensive guide to React hooks",
    "topic": "Frontend",
    "color": "#61dafb",
    "order": 6,
    "isPublic": true,
    "authorId": "usr123...",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "_count": {
      "entries": 0
    },
    "author": {
      "id": "usr123...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Entries

#### List Entries

```http
GET /api/v1/cheatsheets/{id}/entries
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `q`: Search in title, content, or tags
- `type`: Filter by entry type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ent123...",
      "title": "useState Hook",
      "content": "const [state, setState] = useState(initialValue)",
      "type": "CODE_SNIPPET",
      "language": "javascript",
      "tags": ["react", "hooks", "state"],
      "order": 1,
      "isCodeSnippet": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "pageId": "clx123..."
    }
  ],
  "meta": {
    "cheatsheet": {
      "id": "clx123...",
      "title": "React Hooks Guide",
      "topic": "Frontend"
    }
  }
}
```

#### Create Entry

```http
POST /api/v1/cheatsheets/{id}/entries
```

**Request Body:**
```json
{
  "title": "useEffect Hook",
  "content": "useEffect(() => {\n  // Side effect\n  return () => {\n    // Cleanup\n  }\n}, [dependencies])",
  "type": "CODE_SNIPPET",
  "language": "javascript",
  "tags": ["react", "hooks", "effects"]
}
```

**Validation Rules:**
- `title`: Required, 1-100 characters, trimmed
- `content`: Required, 1-5000 characters
- `type`: Required, enum: TERMINOLOGY | FORMULA | CODE_SNIPPET | NOTE | REFERENCE
- `language`: Optional, max 20 characters
- `tags`: Optional array, max 10 tags, each 1-30 characters

## Security Features

### Input Validation
- **Zod schemas** for type-safe validation
- **SQL injection protection** via Prisma ORM
- **XSS prevention** through input sanitization
- **Request size limits** to prevent DoS

### Authorization
- **Session-based authentication** via NextAuth
- **Resource ownership checks** for CRUD operations
- **Admin privilege escalation** for administrative tasks
- **Public/private access control** for cheatsheets

### Rate Limiting
- **IP-based rate limiting** with sliding window
- **Different limits per endpoint type**
- **Automatic cleanup** of expired rate limit entries

### Error Handling
- **Consistent error format** across all endpoints
- **Detailed error codes** for client handling
- **Request ID tracking** for debugging
- **Sensitive data masking** in error responses

## Performance Optimizations

### Database
- **Prisma Accelerate** for connection pooling and caching
- **Singleton client** to prevent connection leaks
- **Optimized queries** with proper indexing
- **Pagination** to limit result sets

### Caching
- **Response caching** via Prisma Accelerate
- **Connection pooling** for database efficiency
- **Query optimization** with selective field inclusion

## Usage Examples

### JavaScript/TypeScript

```typescript
// Fetch cheatsheets with pagination
const response = await fetch('/api/v1/cheatsheets?page=1&limit=10', {
  credentials: 'include'
})
const result = await response.json()

if (result.success) {
  console.log('Cheatsheets:', result.data)
  console.log('Total pages:', result.meta.pagination.totalPages)
} else {
  console.error('Error:', result.error.message)
}

// Create new cheatsheet
const newCheatsheet = await fetch('/api/v1/cheatsheets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    title: 'Vue.js Fundamentals',
    topic: 'Frontend',
    description: 'Essential Vue.js concepts and patterns'
  })
})
```

### cURL Examples

```bash
# List cheatsheets
curl -X GET "http://localhost:3000/api/v1/cheatsheets?page=1&limit=5" \
  -H "Cookie: next-auth.session-token=..."

# Create cheatsheet
curl -X POST "http://localhost:3000/api/v1/cheatsheets" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "title": "Python Basics",
    "topic": "Programming",
    "description": "Essential Python concepts"
  }'

# Search entries
curl -X GET "http://localhost:3000/api/v1/cheatsheets/clx123/entries?q=useState&type=CODE_SNIPPET" \
  -H "Cookie: next-auth.session-token=..."
```

## Error Examples

### Validation Error
```json
{
  "success": false,
  "error": {
    "message": "Validation error: title must be at least 1 character",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "title",
      "value": ""
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_1234567890_abc123"
  }
}
```

### Rate Limit Error
```json
{
  "success": false,
  "error": {
    "message": "Rate limit exceeded",
    "code": "RATE_LIMITED"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_1234567890_abc123"
  }
}
```

## Migration from v0 API

The legacy API (`/api/cheatsheets`) will be maintained for backward compatibility but is deprecated. New applications should use the v1 API for enhanced security and features.

### Key Differences
- **Structured responses** with consistent format
- **Enhanced validation** with detailed error messages
- **Rate limiting** for better resource protection
- **Improved authorization** with ownership checks
- **Pagination support** for large datasets
- **Search capabilities** across multiple fields