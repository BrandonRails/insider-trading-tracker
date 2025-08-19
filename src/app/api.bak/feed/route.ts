/**
 * Feed API - Recent transactions with filtering
 * Public endpoint with rate limiting and caching
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { checkRateLimit } from "@/lib/auth-utils"
import { unstable_cache } from "next/cache"

const feedQuerySchema = z.object({
  ticker: z.string().optional(),
  person: z.string().optional(),
  chamber: z.enum(["house", "senate"]).optional(),
  minAmount: z.coerce.number().min(0).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// Cache feed queries for 60 seconds
const getCachedTransactions = unstable_cache(
  async (params: any) => {
    const where: any = {}
    
    // Filter by ticker
    if (params.ticker) {
      where.company = {
        ticker: {
          equals: params.ticker.toUpperCase(),
          mode: "insensitive"
        }
      }
    }
    
    // Filter by person
    if (params.person) {
      where.person = {
        name: {
          contains: params.person,
          mode: "insensitive"
        }
      }
    }
    
    // Filter by chamber (for politicians)
    if (params.chamber) {
      where.person = {
        ...where.person,
        type: "POLITICIAN",
        office: {
          contains: params.chamber === "house" ? "Representative" : "Senator",
          mode: "insensitive"
        }
      }
    }
    
    // Filter by minimum amount
    if (params.minAmount) {
      where.estimatedValue = {
        gte: params.minAmount
      }
    }
    
    // Date range filtering
    if (params.dateFrom || params.dateTo) {
      where.transactionDate = {}
      if (params.dateFrom) {
        where.transactionDate.gte = new Date(params.dateFrom)
      }
      if (params.dateTo) {
        where.transactionDate.lte = new Date(params.dateTo)
      }
    }
    
    // Cursor-based pagination
    if (params.cursor) {
      where.id = {
        lt: params.cursor
      }
    }
    
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        person: {
          select: {
            id: true,
            name: true,
            title: true,
            office: true,
            party: true,
            state: true,
            type: true,
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            ticker: true,
            sector: true,
          }
        },
        filing: {
          select: {
            id: true,
            url: true,
            filingDate: true,
            formType: true,
          }
        }
      },
      orderBy: [
        { transactionDate: "desc" },
        { id: "desc" }
      ],
      take: params.limit + 1, // +1 to check if there are more results
    })
    
    return transactions
  },
  ["feed-transactions"],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ["transactions"]
  }
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientIp = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown"
    
    // Rate limiting - 100 requests per 15 minutes per IP
    const rateLimitResult = await checkRateLimit(`feed:${clientIp}`, 15 * 60 * 1000, 100)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          }
        }
      )
    }
    
    // Validate query parameters
    const validation = feedQuerySchema.safeParse({
      ticker: searchParams.get("ticker"),
      person: searchParams.get("person"),
      chamber: searchParams.get("chamber"),
      minAmount: searchParams.get("minAmount"),
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
      cursor: searchParams.get("cursor"),
      limit: searchParams.get("limit"),
    })
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.issues },
        { status: 400 }
      )
    }
    
    const params = validation.data
    
    // Get cached transactions
    const transactions = await getCachedTransactions(params)
    
    // Handle pagination
    const hasMore = transactions.length > params.limit
    const items = hasMore ? transactions.slice(0, -1) : transactions
    const nextCursor = hasMore ? transactions[transactions.length - 2].id : null
    
    // Calculate summary statistics
    const totalValue = items.reduce((sum, t) => sum + (t.estimatedValue?.toNumber() || 0), 0)
    const buyCount = items.filter(t => t.tradeType === "BUY").length
    const sellCount = items.filter(t => t.tradeType === "SELL").length
    
    const response = {
      data: items.map(transaction => ({
        id: transaction.id,
        person: {
          id: transaction.person.id,
          name: transaction.person.name,
          title: transaction.person.title,
          office: transaction.person.office,
          party: transaction.person.party,
          state: transaction.person.state,
          type: transaction.person.type,
        },
        company: {
          id: transaction.company.id,
          name: transaction.company.name,
          ticker: transaction.company.ticker,
          sector: transaction.company.sector,
        },
        tradeType: transaction.tradeType,
        quantity: transaction.quantity?.toNumber(),
        price: transaction.price?.toNumber(),
        estimatedValue: transaction.estimatedValue?.toNumber(),
        amountRange: transaction.amountRange,
        transactionDate: transaction.transactionDate.toISOString(),
        reportedDate: transaction.reportedDate.toISOString(),
        filing: {
          id: transaction.filing.id,
          url: transaction.filing.url,
          filingDate: transaction.filing.filingDate.toISOString(),
          formType: transaction.filing.formType,
        },
        performanceSince: transaction.performanceSince?.toNumber(),
      })),
      pagination: {
        hasMore,
        nextCursor,
        limit: params.limit,
      },
      summary: {
        totalTransactions: items.length,
        totalValue,
        buyCount,
        sellCount,
        dateRange: {
          from: params.dateFrom || null,
          to: params.dateTo || null,
        },
      },
      meta: {
        generatedAt: new Date().toISOString(),
        cached: true,
      }
    }
    
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": rateLimitResult.reset.toString(),
      }
    })
    
  } catch (error) {
    console.error("Feed API error:", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}