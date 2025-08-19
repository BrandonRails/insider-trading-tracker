/**
 * Company Profile API - Detailed company information and insider activity
 * Cached for performance with ISR
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { unstable_cache } from "next/cache"

const tickerSchema = z.object({
  ticker: z.string().min(1).max(10).toUpperCase(),
})

// Cache company data for 5 minutes
const getCachedCompanyData = unstable_cache(
  async (ticker: string) => {
    const company = await prisma.company.findUnique({
      where: { ticker },
      include: {
        transactions: {
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
          take: 100, // Latest 100 transactions
        }
      }
    })
    
    return company
  },
  ["company-profile"],
  {
    revalidate: 300, // 5 minutes
    tags: ["company"]
  }
)

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    // Validate ticker parameter
    const validation = tickerSchema.safeParse({
      ticker: params.ticker
    })
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid ticker symbol" },
        { status: 400 }
      )
    }
    
    const { ticker } = validation.data
    
    // Get cached company data
    const company = await getCachedCompanyData(ticker)
    
    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }
    
    // Calculate aggregated statistics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    
    const recentTransactions = company.transactions.filter(
      t => t.transactionDate >= thirtyDaysAgo
    )
    
    const quarterlyTransactions = company.transactions.filter(
      t => t.transactionDate >= ninetyDaysAgo
    )
    
    const yearlyTransactions = company.transactions.filter(
      t => t.transactionDate >= oneYearAgo
    )
    
    // Calculate insider sentiment
    const calculateSentiment = (transactions: typeof company.transactions) => {
      const buys = transactions.filter(t => t.tradeType === "BUY")
      const sells = transactions.filter(t => t.tradeType === "SELL")
      
      const buyValue = buys.reduce((sum, t) => sum + (t.estimatedValue?.toNumber() || 0), 0)
      const sellValue = sells.reduce((sum, t) => sum + (t.estimatedValue?.toNumber() || 0), 0)
      
      const netFlow = buyValue - sellValue
      const totalFlow = buyValue + sellValue
      
      if (totalFlow === 0) return { sentiment: "neutral", confidence: 0 }
      
      const ratio = netFlow / totalFlow
      let sentiment: "bullish" | "bearish" | "neutral"
      
      if (ratio > 0.2) sentiment = "bullish"
      else if (ratio < -0.2) sentiment = "bearish"
      else sentiment = "neutral"
      
      return {
        sentiment,
        confidence: Math.abs(ratio),
        netFlow,
        buyValue,
        sellValue,
      }
    }
    
    // Top insiders by activity
    const insiderActivity = company.transactions.reduce((acc, transaction) => {
      const personId = transaction.person.id
      if (!acc[personId]) {
        acc[personId] = {
          person: transaction.person,
          transactions: [],
          totalValue: 0,
          buyCount: 0,
          sellCount: 0,
        }
      }
      
      acc[personId].transactions.push(transaction)
      acc[personId].totalValue += transaction.estimatedValue?.toNumber() || 0
      
      if (transaction.tradeType === "BUY") {
        acc[personId].buyCount++
      } else if (transaction.tradeType === "SELL") {
        acc[personId].sellCount++
      }
      
      return acc
    }, {} as any)
    
    const topInsiders = Object.values(insiderActivity)
      .sort((a: any, b: any) => Math.abs(b.totalValue) - Math.abs(a.totalValue))
      .slice(0, 10)
    
    const response = {
      company: {
        id: company.id,
        name: company.name,
        ticker: company.ticker,
        cik: company.cik,
        exchange: company.exchange,
        sector: company.sector,
        industry: company.industry,
      },
      statistics: {
        totalTransactions: company.transactions.length,
        recent30Days: {
          transactions: recentTransactions.length,
          ...calculateSentiment(recentTransactions),
        },
        quarterly: {
          transactions: quarterlyTransactions.length,
          ...calculateSentiment(quarterlyTransactions),
        },
        yearly: {
          transactions: yearlyTransactions.length,
          ...calculateSentiment(yearlyTransactions),
        },
      },
      topInsiders: topInsiders.map((insider: any) => ({
        person: insider.person,
        totalValue: insider.totalValue,
        transactionCount: insider.transactions.length,
        buyCount: insider.buyCount,
        sellCount: insider.sellCount,
        lastTransaction: insider.transactions[0]?.transactionDate,
      })),
      recentActivity: company.transactions.slice(0, 20).map(transaction => ({
        id: transaction.id,
        person: transaction.person,
        tradeType: transaction.tradeType,
        quantity: transaction.quantity?.toNumber(),
        price: transaction.price?.toNumber(),
        estimatedValue: transaction.estimatedValue?.toNumber(),
        transactionDate: transaction.transactionDate.toISOString(),
        filing: transaction.filing,
        performanceSince: transaction.performanceSince?.toNumber(),
      })),
      meta: {
        generatedAt: new Date().toISOString(),
        dataAsOf: company.updatedAt.toISOString(),
        cached: true,
      }
    }
    
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      }
    })
    
  } catch (error) {
    console.error("Company API error:", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}