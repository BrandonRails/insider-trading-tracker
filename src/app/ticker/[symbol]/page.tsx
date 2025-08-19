/**
 * Ticker Detail Page - Company overview with insider trading activity
 */

import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TransactionCard, type TransactionData } from "@/components/ui/transaction-card"
import { PerformanceBadge } from "@/components/ui/performance-badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Users, 
  Calendar,
  ExternalLink,
  Bell,
  Bookmark,
  Share
} from "lucide-react"
import { formatCurrency, formatNumber, cn } from "@/lib/utils"

// Mock data - in production this would come from the API
const mockCompanyData = {
  NVDA: {
    id: "1",
    name: "NVIDIA Corporation",
    ticker: "NVDA",
    sector: "Technology",
    industry: "Semiconductors",
    marketCap: 1890000000000,
    employees: 29600,
    founded: 1993,
    headquarters: "Santa Clara, CA",
    description: "NVIDIA Corporation is a technology company that designs graphics processing units for the gaming and professional markets, as well as system on a chip units for the mobile computing and automotive market.",
    website: "https://nvidia.com",
    currentPrice: 772.50,
    priceChange: 5.2,
    priceChangePercent: 0.68,
    volume: 45200000,
    avgVolume: 52300000,
    fiftyTwoWeekHigh: 974.00,
    fiftyTwoWeekLow: 180.50,
    peRatio: 58.2,
    dividend: 0.0,
    beta: 1.68,
    insiderTrades: 15,
    politicianTrades: 8
  }
}

const mockTransactions: TransactionData[] = [
  {
    id: "1",
    person: {
      id: "1",
      name: "Nancy Pelosi",
      title: "Former Speaker of the House",
      office: "Representative",
      party: "Democrat",
      state: "CA",
      type: "POLITICIAN"
    },
    company: {
      id: "1",
      name: "NVIDIA Corporation",
      ticker: "NVDA",
      sector: "Technology"
    },
    tradeType: "BUY",
    quantity: 2500,
    price: 600.00,
    estimatedValue: 1500000,
    transactionDate: "2024-01-15",
    reportedDate: "2024-01-18",
    filing: {
      id: "1",
      url: "https://disclosures-clerk.house.gov/filing/123",
      filingDate: "2024-01-18",
      formType: "PTR"
    },
    performanceSince: 23.4
  },
  {
    id: "2",
    person: {
      id: "2",
      name: "Jensen Huang",
      title: "CEO",
      type: "CORPORATE_INSIDER"
    },
    company: {
      id: "1",
      name: "NVIDIA Corporation", 
      ticker: "NVDA",
      sector: "Technology"
    },
    tradeType: "SELL",
    quantity: 240000,
    price: 772.50,
    estimatedValue: 185400000,
    transactionDate: "2024-01-12",
    reportedDate: "2024-01-14",
    filing: {
      id: "2",
      url: "https://sec.gov/Archives/edgar/data/123",
      filingDate: "2024-01-14",
      formType: "Form 4"
    },
    performanceSince: 18.7
  }
]

interface TickerPageProps {
  params: {
    symbol: string
  }
}

export default function TickerPage({ params }: TickerPageProps) {
  const symbol = params.symbol.toUpperCase()
  const company = mockCompanyData[symbol as keyof typeof mockCompanyData]
  
  if (!company) {
    notFound()
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold">{company.ticker}</h1>
              <Badge variant="outline">{company.sector}</Badge>
            </div>
          </div>
          <h2 className="text-xl text-muted-foreground">{company.name}</h2>
          
          {/* Price Info */}
          <div className="flex items-center gap-6">
            <div className="text-3xl font-bold">
              {formatCurrency(company.currentPrice)}
            </div>
            <div className={cn(
              "flex items-center gap-1 text-lg font-medium",
              company.priceChangePercent > 0 ? "text-bullish-600" : "text-bearish-600"
            )}>
              {company.priceChangePercent > 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              <span>
                {company.priceChangePercent > 0 ? "+" : ""}{company.priceChange.toFixed(2)} ({company.priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Watch
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Alert
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Market Cap</div>
            <div className="text-lg font-semibold">
              {formatCurrency(company.marketCap, { compact: true })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Volume</div>
            <div className="text-lg font-semibold">
              {formatNumber(company.volume, { compact: true })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">P/E Ratio</div>
            <div className="text-lg font-semibold">
              {company.peRatio}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">52W High</div>
            <div className="text-lg font-semibold">
              {formatCurrency(company.fiftyTwoWeekHigh)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">52W Low</div>
            <div className="text-lg font-semibold">
              {formatCurrency(company.fiftyTwoWeekLow)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Beta</div>
            <div className="text-lg font-semibold">
              {company.beta}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Insider Trading Activity - Left Column */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Insider Activity</span>
                <div className="flex gap-2">
                  <Badge variant="bullish">
                    {company.insiderTrades} Insiders
                  </Badge>
                  <Badge variant="secondary">
                    {company.politicianTrades} Politicians
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Suspense fallback={<div>Loading transactions...</div>}>
                {mockTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    showPerformance={true}
                  />
                ))}
              </Suspense>
              
              <div className="text-center pt-4">
                <Button variant="outline">
                  Load More Transactions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Info Sidebar - Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Company Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Industry</span>
                  <span className="text-sm font-medium">{company.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Employees</span>
                  <span className="text-sm font-medium">
                    {formatNumber(company.employees)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Founded</span>
                  <span className="text-sm font-medium">{company.founded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">HQ</span>
                  <span className="text-sm font-medium">{company.headquarters}</span>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  {company.description}
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trading Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Trading Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold">
                  {company.insiderTrades + company.politicianTrades}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total trades this month
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Corporate Insiders</span>
                  <Badge variant="outline">{company.insiderTrades}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Politicians</span>
                  <Badge variant="outline">{company.politicianTrades}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ad Slot */}
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">Advertisement</div>
                <div className="text-xs text-muted-foreground">
                  300x600 Ad Unit
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TickerPageProps) {
  const symbol = params.symbol.toUpperCase()
  const company = mockCompanyData[symbol as keyof typeof mockCompanyData]
  
  if (!company) {
    return {
      title: "Company Not Found",
      description: "The requested ticker symbol was not found."
    }
  }

  return {
    title: `${company.ticker} - ${company.name} | Insider Pilot`,
    description: `Track insider and politician trading activity for ${company.name} (${company.ticker}). Real-time SEC filings and trading analytics.`,
    keywords: `${company.ticker}, ${company.name}, insider trading, stock analysis, SEC filings`,
  }
}