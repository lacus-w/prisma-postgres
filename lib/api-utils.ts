import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Singleton Prisma client with Accelerate
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient().$extends(withAccelerate())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// API Response Types
export interface ApiResponse<T = any> {
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

// Error Codes
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  INVALID_REQUEST: 'INVALID_REQUEST',
} as const

// Validation Schemas
export const CreateCheatsheetSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
  topic: z.string().min(1).max(50).trim(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

export const CreateEntrySchema = z.object({
  title: z.string().min(1).max(100).trim(),
  content: z.string().min(1).max(5000),
  type: z.enum(['TERMINOLOGY', 'FORMULA', 'CODE_SNIPPET', 'NOTE', 'REFERENCE']),
  language: z.string().max(20).optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
})

export const UpdateEntrySchema = CreateEntrySchema.partial()

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

// Utility Functions
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function createApiResponse<T>(
  data?: T,
  error?: { message: string; code: string; details?: any },
  meta?: any
): ApiResponse<T> {
  return {
    success: !error,
    data,
    error,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
    },
  }
}

export function createErrorResponse(
  message: string,
  code: string,
  status: number,
  details?: any
): NextResponse {
  return NextResponse.json(
    createApiResponse(undefined, { message, code, details }),
    { status }
  )
}

// Authentication & Authorization
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireAdmin(request: NextRequest) {
  const session = await requireAuth(request)
  if (!session.user.isAdmin) {
    throw new Error('Admin access required')
  }
  return session
}

export async function requireOwnership(userId: string, resourceId: string, resourceType: 'page' | 'entry') {
  if (resourceType === 'page') {
    const page = await prisma.cheatsheetPage.findFirst({
      where: { id: resourceId, authorId: userId },
    })
    if (!page) {
      throw new Error('Resource not found or access denied')
    }
    return page
  } else {
    const entry = await prisma.cheatsheetEntry.findFirst({
      where: { 
        id: resourceId,
        page: { authorId: userId }
      },
      include: { page: true }
    })
    if (!entry) {
      throw new Error('Resource not found or access denied')
    }
    return entry
  }
}

// Validation Middleware
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<T> => {
    try {
      const body = await request.json()
      return schema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
      }
      throw new Error('Invalid JSON payload')
    }
  }
}

// Rate Limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Clean old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }
  
  const current = rateLimitMap.get(identifier)
  if (!current) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

// API Handler Wrapper
export function withApiHandler<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    requireAdmin?: boolean
    rateLimit?: { maxRequests: number; windowMs: number }
    validateBody?: z.ZodSchema<any>
  } = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // Rate limiting
      if (options.rateLimit) {
        const identifier = request.headers.get('x-forwarded-for') || 'unknown'
        if (!rateLimit(identifier, options.rateLimit.maxRequests, options.rateLimit.windowMs)) {
          return createErrorResponse(
            'Rate limit exceeded',
            ErrorCodes.RATE_LIMITED,
            429
          )
        }
      }

      // Authentication
      if (options.requireAuth) {
        await requireAuth(request)
      }

      if (options.requireAdmin) {
        await requireAdmin(request)
      }

      // Body validation
      if (options.validateBody && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        await validateRequest(options.validateBody)(request)
      }

      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', error)
      
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          return createErrorResponse(
            'Authentication required',
            ErrorCodes.UNAUTHORIZED,
            401
          )
        }
        
        if (error.message === 'Admin access required') {
          return createErrorResponse(
            'Admin access required',
            ErrorCodes.FORBIDDEN,
            403
          )
        }
        
        if (error.message.includes('Validation error')) {
          return createErrorResponse(
            error.message,
            ErrorCodes.VALIDATION_ERROR,
            400
          )
        }
        
        if (error.message.includes('not found') || error.message.includes('access denied')) {
          return createErrorResponse(
            'Resource not found or access denied',
            ErrorCodes.NOT_FOUND,
            404
          )
        }
      }

      return createErrorResponse(
        'Internal server error',
        ErrorCodes.INTERNAL_ERROR,
        500
      )
    }
  }
}

// Pagination Helper
export function parsePagination(request: NextRequest) {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    skip: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit)),
  }
}

// Search Helper
export function parseSearch(request: NextRequest) {
  const url = new URL(request.url)
  return {
    query: url.searchParams.get('q') || '',
    topic: url.searchParams.get('topic') || '',
    type: url.searchParams.get('type') || '',
  }
}