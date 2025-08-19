/**
 * Trending Sidebar - Hot tickers and top performers
 */

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PersonAvatar } from "@/components/ui/person-avatar"
import { PerformanceBadge } from "@/components/ui/performance-badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Crown, 
  BarChart3, 
  ExternalLink,
  Star,
  Volume2
} from "lucide-react"
import { formatCurrency, formatNumber, cn } from "@/lib/utils"

// Mock data - in production this would come from APIs
const trendingTickers = [
  { 
    ticker: "NVDA", 
    name: "NVIDIA Corp",
    price: 772.50, 
    change: 5.2, 
    volume: "45.2M",
    insiderActivity: 12 
  },
  { 
    ticker: "MSFT", 
    name: "Microsoft Corp",
    price: 415.26, 
    change: 2.1, 
    volume: "28.1M",
    insiderActivity: 8 
  },
  { 
    ticker: "AAPL", 
    name: "Apple Inc",
    price: 195.89, 
    change: -1.3, 
    volume: "52.8M",
    insiderActivity: 15 
  },
  { 
    ticker: "GOOGL", 
    name: "Alphabet Inc",
    price: 175.25, 
    change: 3.7, 
    volume: "22.4M",
    insiderActivity: 6 
  },
  { 
    ticker: "TSLA", 
    name: "Tesla Inc",
    price: 248.42, 
    change: 7.8, 
    volume: "89.3M",
    insiderActivity: 9 
  }
]

const topPoliticians = [
  { 
    id: "1",
    name: "Nancy Pelosi", 
    trades: 23, 
    volume: 15200000, 
    performance: 28.4,
    type: "POLITICIAN" as const
  },
  { 
    id: "2", 
    name: "Dan Crenshaw", 
    trades: 18, 
    volume: 8700000, 
    performance: 22.1,
    type: "POLITICIAN" as const
  },
  { 
    id: "3",
    name: "Josh Gottheimer", 
    trades: 15, 
    volume: 12300000, 
    performance: 19.8,
    type: "POLITICIAN" as const
  },
  { 
    id: "4",
    name: "Susie Lee", 
    trades: 12, 
    volume: 5900000, 
    performance: 17.2,
    type: "POLITICIAN" as const
  },
  { 
    id: "5",
    name: "Pat Fallon", 
    trades: 9, 
    volume: 3400000, 
    performance: 15.6,
    type: "POLITICIAN" as const
  }
]

const topInsiders = [
  {
    id: "1",
    name: "Jensen Huang",
    company: "NVIDIA",
    trades: 8,
    volume: 425000000,
    performance: 12.3,
    type: "CORPORATE_INSIDER" as const
  },
  {
    id: "2", 
    name: "Tim Cook",
    company: "Apple",
    trades: 6,
    volume: 187000000,
    performance: 8.9,
    type: "CORPORATE_INSIDER" as const
  },
  {
    id: "3",
    name: "Satya Nadella", 
    company: "Microsoft",
    trades: 4,
    volume: 98000000,
    performance: 15.7,
    type: "CORPORATE_INSIDER" as const
  }
]

export function TrendingSidebar() {
  return (
    <div className="space-y-6">
      {/* Trending Tickers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-bullish-500" />
            Trending Tickers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTickers.map((ticker, index) => (
            <Link
              key={ticker.ticker}
              href={`/ticker/${ticker.ticker}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{ticker.ticker}</span>
                  {ticker.insiderActivity > 10 && (
                    <Badge variant="bullish" className="text-xs px-1.5 py-0">
                      Hot
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Vol: {ticker.volume}
                </div>
                <div className="text-xs text-muted-foreground">
                  {ticker.insiderActivity} insider trades
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-sm">
                  {formatCurrency(ticker.price)}
                </div>
                <div className={cn(
                  "text-xs font-medium",
                  ticker.change > 0 ? "text-bullish-600" : "text-bearish-600"
                )}>
                  {ticker.change > 0 ? "+" : ""}{ticker.change.toFixed(1)}%
                </div>
              </div>
            </Link>
          ))}
          
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/trending">
              View All Trending
              <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Top Politicians */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-yellow-500" />
            Top Politicians This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topPoliticians.map((politician, index) => (
            <Link
              key={politician.id}
              href={`/person/${politician.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm font-bold text-muted-foreground w-6">
                  #{index + 1}
                </span>
                
                <PersonAvatar
                  name={politician.name}
                  personType={politician.type}
                  size="sm"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {politician.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {politician.trades} trades
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-sm">
                  {formatCurrency(politician.volume, { compact: true })}
                </div>
                <PerformanceBadge 
                  performance={politician.performance}
                  showIcon={false}
                  size="sm"
                />
              </div>
            </Link>
          ))}
          
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/politicians">
              View All Politicians
              <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Top Corporate Insiders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-bullish-500" />
            Top Corporate Insiders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topInsiders.map((insider, index) => (
            <Link
              key={insider.id}
              href={`/person/${insider.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm font-bold text-muted-foreground w-6">
                  #{index + 1}
                </span>
                
                <PersonAvatar
                  name={insider.name}
                  personType={insider.type}
                  size="sm"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {insider.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {insider.company} • {insider.trades} trades
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-sm">
                  {formatCurrency(insider.volume, { compact: true })}
                </div>
                <PerformanceBadge 
                  performance={insider.performance}
                  showIcon={false}
                  size="sm"
                />
              </div>
            </Link>
          ))}
          
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/insiders">
              View All Insiders
              <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Ad Slot */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">Advertisement</div>
            <div className="text-xs text-muted-foreground">
              300x250 Ad Unit
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      <Card className="bg-gradient-to-br from-bullish-50 to-bullish-100 dark:from-bullish-950 dark:to-bullish-900 border-bullish-200 dark:border-bullish-800">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <Crown className="h-8 w-8 text-bullish-600 mx-auto" />
            <h3 className="font-semibold text-bullish-900 dark:text-bullish-100">
              Upgrade to Pro
            </h3>
            <p className="text-sm text-bullish-700 dark:text-bullish-300">
              Get real-time alerts, advanced analytics, and ad-free experience for just $0.99/day.
            </p>
            <Button size="sm" className="w-full" asChild>
              <Link href="/pricing">
                Start Free Trial
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}