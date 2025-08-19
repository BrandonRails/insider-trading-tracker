/**
 * Homepage - Insider Pilot Trading Feed
 * Real-time insider and politician trading activity
 */

import { Suspense } from "react"
import { HeroSection } from "@/components/sections/hero-section"
import { TradingFeed } from "@/components/sections/trading-feed"
import { TrendingSidebar } from "@/components/sections/trending-sidebar"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <section className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Trading Feed - Left Column (8 cols) */}
          <div className="lg:col-span-8">
            <Suspense fallback={<TradingFeedSkeleton />}>
              <TradingFeed />
            </Suspense>
          </div>

          {/* Sidebar - Right Column (4 cols) */}
          <div className="lg:col-span-4">
            <Suspense fallback={<SidebarSkeleton />}>
              <TrendingSidebar />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  )
}

// Loading skeletons
function TradingFeedSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded-lg animate-pulse w-48" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse w-32" />
                  <div className="h-3 bg-muted rounded animate-pulse w-24" />
                </div>
              </div>
              <div className="h-4 bg-muted rounded animate-pulse w-64" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded animate-pulse w-32" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-4 bg-muted rounded animate-pulse w-20" />
                  <div className="h-4 bg-muted rounded animate-pulse w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
