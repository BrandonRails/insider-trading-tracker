/**
 * AdSlot Component - Responsive ad container with GAM integration
 */

"use client"

import * as React from "react"
import { adManager, generateAdSlotId, shouldShowAds, getAdSizes, type AdSlot } from "@/lib/ads"
import { cn } from "@/lib/utils"

interface AdSlotProps {
  unitPath: string
  sizes?: number[][]
  className?: string
  targeting?: Record<string, string | string[]>
  refreshInterval?: number
  fallbackContent?: React.ReactNode
  label?: string
}

export function AdSlotComponent({
  unitPath,
  sizes,
  className,
  targeting,
  refreshInterval,
  fallbackContent,
  label = "Advertisement",
}: AdSlotProps) {
  const [slotId] = React.useState(() => generateAdSlotId("ad-slot"))
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [showAds] = React.useState(() => shouldShowAds())
  const adRef = React.useRef<HTMLDivElement>(null)

  // Auto-detect sizes based on container if not provided
  const adSizes = React.useMemo(() => {
    if (sizes) return sizes
    
    // Default responsive sizes
    if (typeof window !== "undefined") {
      const width = window.innerWidth
      if (width < 768) return getAdSizes("mobile")
      if (width < 1024) return getAdSizes("tablet")
      return getAdSizes("desktop")
    }
    
    return [[300, 250]] // Default fallback
  }, [sizes])

  React.useEffect(() => {
    if (!showAds || typeof window === "undefined") return

    // Initialize ad manager
    adManager.initialize()

    // Define the ad slot
    const adSlotConfig: AdSlot = {
      id: slotId,
      unitPath,
      sizes: adSizes,
      targeting,
      refreshInterval,
    }

    adManager.defineSlot(adSlotConfig)

    // Display the ad
    const timer = setTimeout(() => {
      adManager.displaySlot(slotId)
      setIsLoaded(true)
    }, 100)

    return () => {
      clearTimeout(timer)
      adManager.destroySlot(slotId)
    }
  }, [slotId, unitPath, adSizes, targeting, refreshInterval, showAds])

  // Handle visibility changes for viewability tracking
  React.useEffect(() => {
    if (!showAds || !isLoaded) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Track viewability
            console.log(`Ad slot ${slotId} is viewable`)
          }
        })
      },
      { threshold: 0.5 }
    )

    if (adRef.current) {
      observer.observe(adRef.current)
    }

    return () => observer.disconnect()
  }, [slotId, isLoaded, showAds])

  if (!showAds) {
    return fallbackContent || null
  }

  return (
    <div
      ref={adRef}
      className={cn(
        "ad-container relative overflow-hidden",
        "border border-border rounded-lg",
        "bg-muted/20",
        className
      )}
    >
      {/* Ad label for transparency */}
      <div className="absolute top-1 right-1 z-10">
        <span className="text-xs text-muted-foreground bg-background/80 px-1 rounded">
          {label}
        </span>
      </div>

      {/* Ad slot div */}
      <div
        id={slotId}
        className={cn(
          "ad-slot min-h-[100px] flex items-center justify-center",
          !isLoaded && "animate-pulse bg-muted/40"
        )}
      >
        {!isLoaded && (
          <div className="text-sm text-muted-foreground">
            Loading...
          </div>
        )}
      </div>

      {/* Fallback content if ad fails to load */}
      {isLoaded && fallbackContent && (
        <div className="ad-fallback">
          {fallbackContent}
        </div>
      )}
    </div>
  )
}

/**
 * Pre-configured ad slot components for common placements
 */

export function LeaderboardAd({ className, ...props }: Omit<AdSlotProps, "unitPath">) {
  return (
    <AdSlotComponent
      unitPath={adManager.AD_UNITS.LEADERBOARD}
      sizes={[[728, 90], [970, 250]]}
      className={cn("w-full max-w-4xl mx-auto", className)}
      {...props}
    />
  )
}

export function SidebarMediumAd({ className, ...props }: Omit<AdSlotProps, "unitPath">) {
  return (
    <AdSlotComponent
      unitPath={adManager.AD_UNITS.SIDEBAR_MEDIUM}
      sizes={[[300, 250], [300, 600]]}
      className={cn("w-full max-w-[300px]", className)}
      {...props}
    />
  )
}

export function SidebarSmallAd({ className, ...props }: Omit<AdSlotProps, "unitPath">) {
  return (
    <AdSlotComponent
      unitPath={adManager.AD_UNITS.SIDEBAR_SMALL}
      sizes={[[300, 250]]}
      className={cn("w-full max-w-[300px]", className)}
      {...props}
    />
  )
}

export function MobileBannerAd({ className, ...props }: Omit<AdSlotProps, "unitPath">) {
  return (
    <AdSlotComponent
      unitPath={adManager.AD_UNITS.MOBILE_BANNER}
      sizes={[[320, 50], [320, 100]]}
      className={cn("w-full md:hidden", className)}
      {...props}
    />
  )
}

export function FeedInlineAd({ className, index, ...props }: Omit<AdSlotProps, "unitPath"> & { index?: number }) {
  return (
    <AdSlotComponent
      unitPath={adManager.AD_UNITS.FEED_INLINE}
      sizes={[[300, 250], [728, 90]]}
      targeting={{ position: `feed-${index || 0}` }}
      className={cn("w-full my-4", className)}
      {...props}
    />
  )
}

export function ArticleTopAd({ className, ...props }: Omit<AdSlotProps, "unitPath">) {
  return (
    <AdSlotComponent
      unitPath={adManager.AD_UNITS.ARTICLE_TOP}
      sizes={[[728, 90], [300, 250]]}
      className={cn("w-full mb-6", className)}
      {...props}
    />
  )
}

export function ArticleBottomAd({ className, ...props }: Omit<AdSlotProps, "unitPath">) {
  return (
    <AdSlotComponent
      unitPath={adManager.AD_UNITS.ARTICLE_BOTTOM}
      sizes={[[728, 90], [300, 250]]}
      className={cn("w-full mt-6", className)}
      {...props}
    />
  )
}