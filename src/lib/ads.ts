/**
 * Google Ad Manager Integration - Production-ready ad serving
 * Handles ad slots, consent management, and revenue optimization
 */

declare global {
  interface Window {
    googletag: {
      cmd: Array<() => void>
      defineSlot: (adUnitPath: string, size: number[] | string, divId: string) => any
      enableServices: () => void
      display: (divId: string) => void
      pubads: () => {
        enableSingleRequest: () => void
        collapseEmptyDivs: () => void
        setTargeting: (key: string, value: string | string[]) => void
        addEventListener: (event: string, callback: (event: any) => void) => void
        refresh: (slots?: any[]) => void
        setPrivacySettings: (settings: Record<string, any>) => void
      }
    }
    adsbygoogle: any[]
    __tcfapi?: (command: string, version: number, callback: (data: any, success: boolean) => void, parameter?: any) => void
  }
}

export interface AdSlot {
  id: string
  unitPath: string
  sizes: number[][]
  targeting?: Record<string, string | string[]>
  refreshInterval?: number
}

export interface ConsentData {
  gdprApplies: boolean
  tcString?: string
  ccpaString?: string
  hasConsent: boolean
  vendors: Record<string, boolean>
}

class AdManager {
  private slots = new Map<string, any>()
  private refreshTimers = new Map<string, NodeJS.Timeout>()
  private initialized = false
  private consentData: ConsentData | null = null
  
  // Production GAM network ID - replace with actual
  private readonly NETWORK_ID = "22247871095" // Example GAM network ID
  
  public readonly AD_UNITS = {
    LEADERBOARD: `/${this.NETWORK_ID}/insider-pilot/leaderboard`,
    SIDEBAR_MEDIUM: `/${this.NETWORK_ID}/insider-pilot/sidebar-medium`,
    SIDEBAR_SMALL: `/${this.NETWORK_ID}/insider-pilot/sidebar-small`,
    MOBILE_BANNER: `/${this.NETWORK_ID}/insider-pilot/mobile-banner`,
    FEED_INLINE: `/${this.NETWORK_ID}/insider-pilot/feed-inline`,
    ARTICLE_TOP: `/${this.NETWORK_ID}/insider-pilot/article-top`,
    ARTICLE_BOTTOM: `/${this.NETWORK_ID}/insider-pilot/article-bottom`,
  } as const

  constructor() {
    this.loadGPTScript()
    this.initializeConsentManagement()
  }

  private loadGPTScript(): void {
    if (typeof window === "undefined") return
    
    // Load Google Publisher Tag
    const script = document.createElement("script")
    script.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js"
    script.async = true
    document.head.appendChild(script)

    // Initialize googletag command queue
    window.googletag = window.googletag || { cmd: [] }
  }

  private initializeConsentManagement(): void {
    if (typeof window === "undefined") return

    // Load Consent Management Platform (CMP)
    this.loadCMPScript()
    
    // Check for existing consent
    this.checkConsentStatus()
  }

  private loadCMPScript(): void {
    // Load a CMP like OneTrust or Cookiebot
    const script = document.createElement("script")
    script.src = "https://cdn.cookielaw.org/scripttemplates/otSDKStub.js"
    script.type = "text/javascript"
    script.charset = "UTF-8"
    script.setAttribute("data-domain-script", process.env.NEXT_PUBLIC_ONETRUST_DOMAIN_SCRIPT || "test-domain")
    document.head.appendChild(script)
  }

  private checkConsentStatus(): void {
    if (typeof window === "undefined") return

    // Check GDPR consent via TCF API
    if (window.__tcfapi) {
      window.__tcfapi("getTCData", 2, (tcData: any, success: boolean) => {
        if (success) {
          this.consentData = {
            gdprApplies: tcData.gdprApplies,
            tcString: tcData.tcString,
            hasConsent: tcData.purpose.consents["1"] && tcData.purpose.consents["3"], // Store info and ad personalization
            vendors: tcData.vendor.consents,
          }
          this.updateAdConsent()
        }
      })
    }

    // Check CCPA consent (for California users)
    const ccpaString = localStorage.getItem("ccpa_consent")
    if (ccpaString) {
      this.consentData = {
        ...this.consentData,
        ccpaString,
        hasConsent: !ccpaString.includes("Y"), // CCPA "Y" means opt-out
      } as ConsentData
    }
  }

  private updateAdConsent(): void {
    if (!this.consentData || typeof window === "undefined") return

    window.googletag.cmd.push(() => {
      if (this.consentData?.gdprApplies) {
        window.googletag.pubads().setPrivacySettings({
          restrictDataProcessing: !this.consentData?.hasConsent,
          childDirectedTreatment: false,
          underAgeOfConsent: false,
        })
      }

      if (this.consentData?.ccpaString) {
        window.googletag.pubads().setPrivacySettings({
          restrictDataProcessing: this.consentData.ccpaString.includes("Y"),
        })
      }
    })
  }

  public initialize(): void {
    if (this.initialized || typeof window === "undefined") return

    window.googletag.cmd.push(() => {
      // Enable single request mode for better performance
      window.googletag.pubads().enableSingleRequest()
      
      // Collapse empty ad slots
      window.googletag.pubads().collapseEmptyDivs()
      
      // Set page-level targeting
      this.setPageTargeting()
      
      // Add event listeners for monitoring
      this.addEventListeners()
      
      // Enable services
      window.googletag.enableServices()
      
      this.initialized = true
    })
  }

  private setPageTargeting(): void {
    if (typeof window === "undefined") return

    window.googletag.cmd.push(() => {
      const pubads = window.googletag.pubads()
      
      // Page type targeting
      pubads.setTargeting("page_type", this.getPageType())
      
      // User tier targeting (for ad quality/frequency)
      const userTier = this.getUserTier()
      if (userTier) {
        pubads.setTargeting("user_tier", userTier)
      }
      
      // Content targeting
      const contentCategories = this.getContentCategories()
      if (contentCategories.length > 0) {
        pubads.setTargeting("content", contentCategories)
      }
      
      // Viewport size
      pubads.setTargeting("viewport", this.getViewportSize())
    })
  }

  private getPageType(): string {
    if (typeof window === "undefined") return "unknown"
    
    const path = window.location.pathname
    if (path === "/") return "homepage"
    if (path.startsWith("/company/")) return "company"
    if (path.startsWith("/person/")) return "person"
    if (path.startsWith("/search")) return "search"
    if (path.startsWith("/watchlist")) return "watchlist"
    return "other"
  }

  private getUserTier(): string | null {
    // In production, this would check user session/subscription
    if (typeof window === "undefined") return null
    
    // Mock logic - replace with actual user data
    const userPlan = localStorage.getItem("user_plan")
    return userPlan === "PAID" ? "premium" : "free"
  }

  private getContentCategories(): string[] {
    const categories: string[] = []
    
    if (typeof window === "undefined") return categories
    
    // Extract content categories from page content
    const path = window.location.pathname
    if (path.includes("company")) categories.push("stocks", "companies")
    if (path.includes("person") || path.includes("politician")) categories.push("politics", "congress")
    if (path.includes("insider")) categories.push("insider-trading")
    
    return categories
  }

  private getViewportSize(): string {
    if (typeof window === "undefined") return "unknown"
    
    const width = window.innerWidth
    if (width < 768) return "mobile"
    if (width < 1024) return "tablet"
    return "desktop"
  }

  private addEventListeners(): void {
    if (typeof window === "undefined") return

    window.googletag.cmd.push(() => {
      const pubads = window.googletag.pubads()
      
      // Track ad impressions for analytics
      pubads.addEventListener("impressionViewable", (event: any) => {
        this.trackAdEvent("impression_viewable", {
          slot_id: event.slot.getSlotElementId(),
          ad_unit: event.slot.getAdUnitPath(),
          size: event.size,
        })
      })
      
      // Track ad revenue events
      pubads.addEventListener("slotRenderEnded", (event: any) => {
        this.trackAdEvent("slot_render_ended", {
          slot_id: event.slot.getSlotElementId(),
          ad_unit: event.slot.getAdUnitPath(),
          size: event.size,
          isEmpty: event.isEmpty,
          revenue: event.revenue || 0,
        })
      })
    })
  }

  public defineSlot(config: AdSlot): void {
    if (typeof window === "undefined") return

    window.googletag.cmd.push(() => {
      const slot = window.googletag
        .defineSlot(config.unitPath, config.sizes, config.id)
        ?.addService(window.googletag.pubads())

      if (slot && config.targeting) {
        Object.entries(config.targeting).forEach(([key, value]) => {
          slot.setTargeting(key, value)
        })
      }

      this.slots.set(config.id, slot)
      
      // Set up auto-refresh if specified
      if (config.refreshInterval && config.refreshInterval > 30000) {
        this.setupAutoRefresh(config.id, config.refreshInterval)
      }
    })
  }

  public displaySlot(slotId: string): void {
    if (typeof window === "undefined") return

    window.googletag.cmd.push(() => {
      window.googletag.display(slotId)
    })
  }

  public refreshSlot(slotId: string): void {
    if (typeof window === "undefined") return

    const slot = this.slots.get(slotId)
    if (slot) {
      window.googletag.cmd.push(() => {
        window.googletag.pubads().refresh([slot])
      })
    }
  }

  private setupAutoRefresh(slotId: string, interval: number): void {
    // Clear existing timer
    const existingTimer = this.refreshTimers.get(slotId)
    if (existingTimer) {
      clearInterval(existingTimer)
    }

    // Set up new timer
    const timer = setInterval(() => {
      this.refreshSlot(slotId)
    }, interval)

    this.refreshTimers.set(slotId, timer)
  }

  public destroySlot(slotId: string): void {
    if (typeof window === "undefined") return

    // Clear refresh timer
    const timer = this.refreshTimers.get(slotId)
    if (timer) {
      clearInterval(timer)
      this.refreshTimers.delete(slotId)
    }

    // Remove slot
    const slot = this.slots.get(slotId)
    if (slot) {
      window.googletag.cmd.push(() => {
        window.googletag.destroySlots([slot])
      })
      this.slots.delete(slotId)
    }
  }

  private trackAdEvent(event: string, properties: Record<string, any>): void {
    // Integration with analytics service
    if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
      // Import analytics dynamically to avoid import issues
      import("@/lib/analytics").then(({ analytics, trackAdInteraction }) => {
        analytics.trackEvent({
          event: "ad_event",
          category: "advertising",
          action: event,
          custom_parameters: properties,
        })

        // Track specific ad interactions
        if (event === "impression_viewable" && properties.slot_id) {
          trackAdInteraction(properties.slot_id, "viewable", properties.revenue)
        }
      })
    }
  }

  // Public methods for consent management
  public updateConsent(consentData: Partial<ConsentData>): void {
    this.consentData = { ...this.consentData, ...consentData } as ConsentData
    this.updateAdConsent()
    
    // Refresh all ads to apply new consent settings
    window.googletag.cmd.push(() => {
      window.googletag.pubads().refresh()
    })
  }

  public hasValidConsent(): boolean {
    return this.consentData?.hasConsent ?? false
  }

  public getConsentData(): ConsentData | null {
    return this.consentData
  }
}

// Singleton instance
export const adManager = new AdManager()

// Utility functions for components
export function generateAdSlotId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function shouldShowAds(): boolean {
  if (typeof window === "undefined") return false
  
  // Don't show ads to premium users
  const userPlan = localStorage.getItem("user_plan")
  if (userPlan === "PAID") return false
  
  // Don't show ads without consent (GDPR/CCPA compliance)
  if (!adManager.hasValidConsent()) return false
  
  return true
}

export function getAdSizes(breakpoint: "mobile" | "tablet" | "desktop"): number[][] {
  switch (breakpoint) {
    case "mobile":
      return [[320, 50], [320, 100], [300, 250]]
    case "tablet":
      return [[728, 90], [300, 250], [320, 50]]
    case "desktop":
      return [[728, 90], [970, 250], [300, 250], [160, 600]]
    default:
      return [[300, 250]]
  }
}