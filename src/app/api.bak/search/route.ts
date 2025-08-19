/**
 * Unified Search API - Search across tickers, people, and companies
 * Full-text search with ranking and suggestions
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { checkRateLimit } from "@/lib/auth-utils"
import { unstable_cache } from "next/cache"

const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(["all", "person", "company", "ticker"]).default("all"),
  limit: z.coerce.number().min(1).max(50).default(10),
})

// Cache search results for 2 minutes
const getCachedSearchResults = unstable_cache(
  async (query: string, type: string, limit: number) => {
    const results = {
      companies: [] as any[],
      people: [] as any[],
      suggestions: [] as any[],
    }
    
    // Search companies/tickers
    if (type === "all" || type === "company" || type === "ticker") {
      results.companies = await prisma.company.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive"
              }
            },
            {
              ticker: {
                contains: query.toUpperCase(),
                mode: "insensitive"
              }
            }
          ]
        },
        select: {
          id: true,
          name: true,
          ticker: true,
          sector: true,
          exchange: true,
          _count: {
            select: {
              transactions: true
            }
          }
        },
        take: limit,
        orderBy: [
          // Prioritize exact ticker matches
          {
            ticker: query.toUpperCase() === query ? "asc" : undefined
          },
          // Then by number of transactions (activity)
          {
            transactions: {
              _count: "desc"
            }
          }
        ]
      })
    }
    
    // Search people (insiders and politicians)
    if (type === "all" || type === "person") {
      results.people = await prisma.person.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive"
              }
            },
            {
              title: {
                contains: query,
                mode: "insensitive"
              }
            },
            {
              office: {
                contains: query,
                mode: "insensitive"
              }
            }
          ]
        },
        select: {
          id: true,
          name: true,
          type: true,
          title: true,
          office: true,
          party: true,
          state: true,
          _count: {
            select: {
              transactions: true
            }
          }
        },
        take: limit,
        orderBy: [
          // Prioritize exact name matches
          {
            name: query.toLowerCase() === query ? "asc" : undefined
          },
          // Then by transaction count
          {
            transactions: {
              _count: "desc"
            }
          }
        ]
      })
    }
    
    // Generate search suggestions
    if (query.length >= 2) {
      // Get popular tickers that start with query
      const tickerSuggestions = await prisma.company.findMany({
        where: {
          ticker: {
            startsWith: query.toUpperCase()
          }
        },
        select: {
          ticker: true,
          name: true,
        },
        take: 5,
        orderBy: {
          transactions: {
            _count: "desc"
          }
        }
      })
      
      // Get popular people whose names start with query
      const peopleSuggestions = await prisma.person.findMany({
        where: {
          name: {
            startsWith: query,
            mode: "insensitive"
          }
        },
        select: {
          name: true,
          title: true,
          type: true,
        },
        take: 5,
        orderBy: {
          transactions: {
            _count: "desc"
          }
        }
      })
      
      results.suggestions = [
        ...tickerSuggestions.map(t => ({
          type: "ticker",
          value: t.ticker,
          label: `${t.ticker} - ${t.name}`,
        })),
        ...peopleSuggestions.map(p => ({
          type: "person",
          value: p.name,
          label: `${p.name} (${p.title || p.type})`,
        }))
      ]
    }
    
    return results
  },
  ["search-results"],
  {
    revalidate: 120, // 2 minutes
    tags: ["search"]
  }
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientIp = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown"
    
    // Rate limiting - 200 searches per 15 minutes per IP
    const rateLimitResult = await checkRateLimit(`search:${clientIp}`, 15 * 60 * 1000, 200)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          }
        }
      )
    }
    
    // Validate query parameters
    const validation = searchQuerySchema.safeParse({
      q: searchParams.get("q"),
      type: searchParams.get("type"),
      limit: searchParams.get("limit"),
    })
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: validation.error.issues },
        { status: 400 }
      )
    }
    
    const { q: query, type, limit } = validation.data
    
    // Get cached search results
    const results = await getCachedSearchResults(query, type, limit)
    
    // Calculate relevance scores and merge results
    const allResults = []
    
    // Add company results with relevance scoring
    results.companies.forEach(company => {
      const exactTickerMatch = company.ticker.toLowerCase() === query.toLowerCase()
      const tickerStartsWith = company.ticker.toLowerCase().startsWith(query.toLowerCase())
      const nameContains = company.name.toLowerCase().includes(query.toLowerCase())
      
      let relevanceScore = 0
      if (exactTickerMatch) relevanceScore += 100
      else if (tickerStartsWith) relevanceScore += 50
      if (nameContains) relevanceScore += 20
      relevanceScore += Math.min(company._count.transactions / 10, 30) // Activity bonus
      
      allResults.push({
        type: "company",
        relevanceScore,
        data: {
          id: company.id,
          name: company.name,
          ticker: company.ticker,
          sector: company.sector,
          exchange: company.exchange,
          transactionCount: company._count.transactions,
        }
      })
    })
    
    // Add person results with relevance scoring  
    results.people.forEach(person => {
      const exactNameMatch = person.name.toLowerCase() === query.toLowerCase()
      const nameStartsWith = person.name.toLowerCase().startsWith(query.toLowerCase())
      const titleContains = person.title?.toLowerCase().includes(query.toLowerCase())
      
      let relevanceScore = 0
      if (exactNameMatch) relevanceScore += 100
      else if (nameStartsWith) relevanceScore += 50
      if (titleContains) relevanceScore += 20
      relevanceScore += Math.min(person._count.transactions / 5, 30) // Activity bonus
      
      allResults.push({
        type: "person", 
        relevanceScore,
        data: {
          id: person.id,
          name: person.name,
          type: person.type,
          title: person.title,
          office: person.office,
          party: person.party,
          state: person.state,
          transactionCount: person._count.transactions,
        }
      })
    })
    
    // Sort by relevance and return
    const sortedResults = allResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
    
    const response = {
      query,
      results: sortedResults.map(r => ({
        type: r.type,
        ...r.data
      })),
      suggestions: results.suggestions,
      summary: {
        totalResults: sortedResults.length,
        companies: results.companies.length,
        people: results.people.length,
        queryTime: Date.now(),
      },
      meta: {
        generatedAt: new Date().toISOString(),
        cached: true,
      }
    }
    
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=240",
        "X-RateLimit-Limit": "200",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    })
    
  } catch (error) {
    console.error("Search API error:", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}