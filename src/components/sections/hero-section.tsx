/**
 * Hero Section - Homepage banner with value proposition
 */

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, TrendingUp } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      
      {/* Animated Ticker Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="animate-marquee flex space-x-8 whitespace-nowrap">
          <span className="text-4xl font-mono text-bullish-500">NVDA $772.50 ↗ +5.2%</span>
          <span className="text-4xl font-mono text-bearish-500">TSLA $248.42 ↘ -2.1%</span>
          <span className="text-4xl font-mono text-bullish-500">MSFT $415.26 ↗ +3.7%</span>
          <span className="text-4xl font-mono text-bullish-500">AAPL $195.89 ↗ +1.3%</span>
        </div>
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Beta Badge */}
          <div className="mb-6">
            <Badge variant="outline" className="px-3 py-1">
              <span className="mr-2">🚀</span>
              Now in Beta - Real-time insider tracking
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Track Insider & Politician Trades in{" "}
            <span className="bg-gradient-to-r from-bullish-500 to-bullish-600 bg-clip-text text-transparent">
              Real Time
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay ahead of the market with actionable insights from SEC filings and Congressional disclosures. 
            Get instant alerts when insiders and politicians make moves.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/feed">
                Explore Trades
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/pricing">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-bullish-500" />
              <span>50,000+ trades tracked</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                SOC 2 Type II
              </Badge>
              <span>Enterprise security</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                OWASP ASVS 5.0
              </Badge>
              <span>Security verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}