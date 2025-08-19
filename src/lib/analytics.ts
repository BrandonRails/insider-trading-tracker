/**
 * Analytics Integration - Revenue tracking and user behavior analysis
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer?: any[]
  }
}

export interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  custom_parameters?: Record<string, any>
}

export interface RevenueEvent {
  transaction_id: string
  currency: string
  value: number
  items: Array<{
    item_id: string
    item_name: string
    category: string
    quantity: number
    price: number
  }>
}

class Analytics {
  private initialized = false
  private queue: AnalyticsEvent[] = []

  constructor() {
    this.initializeGA4()
  }

  private initializeGA4(): void {
    if (typeof window === "undefined" || process.env.NODE_ENV !== "production") {
      return
    }

    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    if (!GA_MEASUREMENT_ID) {
      console.warn("GA_MEASUREMENT_ID not found in environment variables")
      return
    }

    // Load Google Analytics 4
    const script = document.createElement("script")
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.async = true
    document.head.appendChild(script)

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer!.push(args)
    }

    window.gtag("js", new Date())
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
      anonymize_ip: true, // GDPR compliance
    })

    this.initialized = true
    
    // Process queued events
    this.queue.forEach(event => this.trackEvent(event))
    this.queue = []
  }

  public trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized) {
      this.queue.push(event)
      return
    }

    if (typeof window === "undefined" || !window.gtag) return

    window.gtag("event", event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters,
    })
  }

  public trackPageView(path: string, title?: string): void {
    if (typeof window === "undefined" || !window.gtag) return

    window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: path,
      page_title: title || document.title,
    })
  }

  public trackUserEngagement(action: string, details?: Record<string, any>): void {
    this.trackEvent({
      event: "user_engagement",
      category: "engagement",
      action,
      custom_parameters: details,
    })
  }

  public trackAdRevenue(event: RevenueEvent): void {
    if (typeof window === "undefined" || !window.gtag) return

    window.gtag("event", "purchase", {
      transaction_id: event.transaction_id,
      currency: event.currency,
      value: event.value,
      items: event.items,
    })
  }

  public trackAdImpressionValue(adSlotId: string, revenue: number, currency = "USD"): void {
    this.trackEvent({
      event: "ad_impression_value",
      category: "advertising",
      action: "impression_value",
      label: adSlotId,
      value: revenue,
      custom_parameters: {
        currency,
        ad_slot_id: adSlotId,
      },
    })
  }

  public trackSubscriptionEvent(action: "subscribe" | "unsubscribe" | "upgrade" | "downgrade", plan: string): void {
    this.trackEvent({
      event: "subscription",
      category: "subscription",
      action,
      label: plan,
      custom_parameters: {
        subscription_plan: plan,
      },
    })
  }

  public trackUserAction(action: string, category = "user_action", details?: Record<string, any>): void {
    this.trackEvent({
      event: "user_action",
      category,
      action,
      custom_parameters: details,
    })
  }

  public trackSearchQuery(query: string, results_count: number): void {
    this.trackEvent({
      event: "search",
      category: "search",
      action: "query",
      label: query,
      value: results_count,
      custom_parameters: {
        search_term: query,
        results_count,
      },
    })
  }

  public trackWatchlistAction(action: "add" | "remove", ticker: string): void {
    this.trackEvent({
      event: "watchlist",
      category: "watchlist",
      action,
      label: ticker,
      custom_parameters: {
        ticker_symbol: ticker,
      },
    })
  }

  public trackAlertAction(action: "create" | "edit" | "delete", alert_type: string): void {
    this.trackEvent({
      event: "alert",
      category: "alerts",
      action,
      label: alert_type,
      custom_parameters: {
        alert_type,
      },
    })
  }

  public setUserProperties(properties: Record<string, any>): void {
    if (typeof window === "undefined" || !window.gtag) return

    window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      custom_map: properties,
    })
  }

  public setUserTier(tier: "free" | "premium"): void {
    this.setUserProperties({
      user_tier: tier,
    })
  }

  public trackConsentChoice(consent_type: string, granted: boolean): void {
    this.trackEvent({
      event: "consent",
      category: "privacy",
      action: granted ? "grant" : "deny",
      label: consent_type,
      custom_parameters: {
        consent_type,
        granted,
      },
    })
  }
}

// Singleton instance
export const analytics = new Analytics()

// Utility functions for common tracking scenarios

export function trackClick(element: string, location?: string): void {
  analytics.trackUserAction("click", "interaction", {
    element,
    location,
  })
}

export function trackFormSubmission(form_name: string, success: boolean): void {
  analytics.trackUserAction(success ? "form_submit_success" : "form_submit_error", "forms", {
    form_name,
    success,
  })
}

export function trackFeatureUsage(feature: string, action: string): void {
  analytics.trackUserAction(action, "features", {
    feature_name: feature,
  })
}

export function trackPerformance(metric: string, value: number, unit = "ms"): void {
  analytics.trackEvent({
    event: "performance",
    category: "performance",
    action: metric,
    value,
    custom_parameters: {
      metric_name: metric,
      unit,
    },
  })
}

export function trackError(error: Error, context?: string): void {
  analytics.trackEvent({
    event: "error",
    category: "errors",
    action: error.name,
    label: error.message,
    custom_parameters: {
      error_stack: error.stack,
      context,
    },
  })
}

// Ad revenue tracking specifically
export function trackAdInteraction(
  ad_slot_id: string, 
  interaction_type: "impression" | "click" | "viewable",
  value?: number
): void {
  analytics.trackEvent({
    event: "ad_interaction",
    category: "advertising",
    action: interaction_type,
    label: ad_slot_id,
    value,
    custom_parameters: {
      ad_slot_id,
      interaction_type,
    },
  })
}

export function trackContentEngagement(
  content_type: "transaction" | "company" | "person",
  content_id: string,
  engagement_type: "view" | "click" | "share"
): void {
  analytics.trackEvent({
    event: "content_engagement",
    category: "content",
    action: engagement_type,
    label: `${content_type}:${content_id}`,
    custom_parameters: {
      content_type,
      content_id,
      engagement_type,
    },
  })
}

// Real-time revenue calculation for ads
export function calculateAdRevenue(impressions: number, cpm: number): number {
  return (impressions * cpm) / 1000
}

export function calculateConversionRate(conversions: number, total_visitors: number): number {
  return total_visitors > 0 ? (conversions / total_visitors) * 100 : 0
}

// A/B Testing support
export function trackExperiment(experiment_id: string, variant: string): void {
  analytics.trackEvent({
    event: "experiment",
    category: "experiments",
    action: "exposure",
    label: experiment_id,
    custom_parameters: {
      experiment_id,
      variant,
    },
  })
}

export function trackExperimentConversion(experiment_id: string, variant: string, goal: string): void {
  analytics.trackEvent({
    event: "experiment_conversion",
    category: "experiments", 
    action: "conversion",
    label: `${experiment_id}:${goal}`,
    custom_parameters: {
      experiment_id,
      variant,
      goal,
    },
  })
}