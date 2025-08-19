/**
 * Person Profile API - Detailed person information and trading history
 * Includes performance metrics and trading patterns
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { unstable_cache } from "next/cache"

const personIdSchema = z.object({
  id: z.string().cuid(),
})

// Cache person data for 5 minutes
const getCachedPersonData = unstable_cache(
  async (personId: string) => {
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        transactions: {
          include: {
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
          orderBy: { transactionDate: "desc" },
        }
      }
    })
    
    return person
  },
  ["person-profile"],
  {
    revalidate: 300, // 5 minutes
    tags: ["person"]
  }
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate person ID parameter
    const validation = personIdSchema.safeParse({
      id: params.id
    })
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid person ID" },
        { status: 400 }
      )
    }
    
    const { id } = validation.data
    
    // Get cached person data
    const person = await getCachedPersonData(id)
    
    if (!person) {
      return NextResponse.json(
        { error: "Person not found" },
        { status: 404 }
      )
    }
    
    // Calculate performance metrics
    const calculatePerformanceMetrics = (transactions: typeof person.transactions) => {
      const completedTrades = transactions.filter(t => t.performanceSince !== null)
      const totalTrades = transactions.length
      const winningTrades = completedTrades.filter(t => {
        const performance = t.performanceSince?.toNumber() || 0
        return (t.tradeType === "BUY" && performance > 0) || 
               (t.tradeType === "SELL" && performance < 0)
      })
      
      const winRate = totalTrades > 0 ? (winningTrades.length / completedTrades.length) * 100 : 0
      const avgReturn = completedTrades.length > 0 
        ? completedTrades.reduce((sum, t) => sum + (t.performanceSince?.toNumber() || 0), 0) / completedTrades.length
        : 0
      
      const totalValue = transactions.reduce((sum, t) => sum + Math.abs(t.estimatedValue?.toNumber() || 0), 0)
      
      return {
        totalTrades,
        winningTrades: winningTrades.length,
        winRate: Number(winRate.toFixed(1)),
        averageReturn: Number(avgReturn.toFixed(2)),
        totalValue,
        bestTrade: Math.max(...completedTrades.map(t => t.performanceSince?.toNumber() || 0)),
        worstTrade: Math.min(...completedTrades.map(t => t.performanceSince?.toNumber() || 0)),
      }
    }
    
    // Trading patterns by time period
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    
    const recent30Days = person.transactions.filter(t => t.transactionDate >= thirtyDaysAgo)
    const quarterly = person.transactions.filter(t => t.transactionDate >= ninetyDaysAgo)
    const yearly = person.transactions.filter(t => t.transactionDate >= oneYearAgo)
    
    // Portfolio composition (current holdings by sector)
    const portfolioByCompany = person.transactions.reduce((acc, transaction) => {
      const ticker = transaction.company.ticker
      if (!acc[ticker]) {
        acc[ticker] = {
          company: transaction.company,
          transactions: [],
          netShares: 0,
          totalValue: 0,
        }
      }
      
      acc[ticker].transactions.push(transaction)
      const shares = transaction.quantity?.toNumber() || 0
      acc[ticker].netShares += transaction.tradeType === "BUY" ? shares : -shares
      acc[ticker].totalValue += transaction.estimatedValue?.toNumber() || 0
      
      return acc
    }, {} as any)
    
    const portfolioComposition = Object.values(portfolioByCompany)
      .filter((holding: any) => holding.netShares > 0) // Only current positions
      .sort((a: any, b: any) => Math.abs(b.totalValue) - Math.abs(a.totalValue))
    
    // Sector allocation
    const sectorAllocation = person.transactions.reduce((acc, transaction) => {
      const sector = transaction.company.sector || "Unknown"
      if (!acc[sector]) {
        acc[sector] = {
          sector,
          totalValue: 0,
          transactionCount: 0,
        }
      }
      
      acc[sector].totalValue += Math.abs(transaction.estimatedValue?.toNumber() || 0)
      acc[sector].transactionCount++
      
      return acc
    }, {} as any)
    
    const response = {
      person: {
        id: person.id,
        name: person.name,
        type: person.type,
        title: person.title,
        office: person.office,
        party: person.party,
        state: person.state,
      },
      performanceMetrics: {
        overall: calculatePerformanceMetrics(person.transactions),
        recent30Days: calculatePerformanceMetrics(recent30Days),
        quarterly: calculatePerformanceMetrics(quarterly),
        yearly: calculatePerformanceMetrics(yearly),
      },
      tradingPattern: {
        totalTransactions: person.transactions.length,
        buyTransactions: person.transactions.filter(t => t.tradeType === "BUY").length,
        sellTransactions: person.transactions.filter(t => t.tradeType === "SELL").length,
        averageTransactionSize: person.transactions.length > 0
          ? person.transactions.reduce((sum, t) => sum + (t.estimatedValue?.toNumber() || 0), 0) / person.transactions.length
          : 0,
        mostActiveMonths: [], // Could implement month-by-month analysis
      },
      portfolioComposition: portfolioComposition.slice(0, 20), // Top 20 positions
      sectorAllocation: Object.values(sectorAllocation)
        .sort((a: any, b: any) => b.totalValue - a.totalValue),
      recentActivity: person.transactions.slice(0, 50).map(transaction => ({
        id: transaction.id,
        company: transaction.company,
        tradeType: transaction.tradeType,
        quantity: transaction.quantity?.toNumber(),
        price: transaction.price?.toNumber(),
        estimatedValue: transaction.estimatedValue?.toNumber(),
        transactionDate: transaction.transactionDate.toISOString(),
        reportedDate: transaction.reportedDate.toISOString(),
        filing: transaction.filing,
        performanceSince: transaction.performanceSince?.toNumber(),
      })),
      meta: {
        generatedAt: new Date().toISOString(),
        dataAsOf: person.updatedAt.toISOString(),
        cached: true,
      }
    }
    
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      }
    })
    
  } catch (error) {
    console.error("Person API error:", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}