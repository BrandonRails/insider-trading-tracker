/**
 * Utility Functions - shadcn/ui + Insider Pilot specific helpers
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Financial formatting utilities
export function formatCurrency(
  amount: number | null | undefined,
  options: {
    compact?: boolean
    showSign?: boolean
    currency?: string
  } = {}
): string {
  if (amount === null || amount === undefined) return "—"
  
  const { compact = false, showSign = false, currency = "USD" } = options
  
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2,
  })
  
  const formatted = formatter.format(Math.abs(amount))
  
  if (showSign) {
    const sign = amount >= 0 ? "+" : "-"
    return `${sign}${formatted}`
  }
  
  return amount < 0 ? `-${formatted}` : formatted
}

export function formatNumber(
  num: number | null | undefined,
  options: {
    compact?: boolean
    decimals?: number
  } = {}
): string {
  if (num === null || num === undefined) return "—"
  
  const { compact = false, decimals = 0 } = options
  
  return new Intl.NumberFormat("en-US", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatPercentage(
  value: number | null | undefined,
  options: {
    showSign?: boolean
    decimals?: number
  } = {}
): string {
  if (value === null || value === undefined) return "—"
  
  const { showSign = true, decimals = 1 } = options
  
  const formatted = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: decimals,
    signDisplay: showSign ? "always" : "auto",
  }).format(value / 100)
  
  return formatted
}

// Date formatting utilities
export function formatDate(
  date: string | Date | null | undefined,
  format: "short" | "medium" | "long" | "relative" = "medium"
): string {
  if (!date) return "—"
  
  const dateObj = typeof date === "string" ? new Date(date) : date
  
  if (format === "relative") {
    return formatRelativeTime(dateObj)
  }
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    short: { month: "short", day: "numeric" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long: { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    },
  }
  
  return new Intl.DateTimeFormat("en-US", formatOptions[format]).format(dateObj)
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000
  
  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(date, "short")
}

// Trading utilities
export function getTradeTypeColor(tradeType: "BUY" | "SELL" | "OTHER"): string {
  switch (tradeType) {
    case "BUY":
      return "text-green-600 dark:text-green-400"
    case "SELL":
      return "text-red-600 dark:text-red-400"
    default:
      return "text-gray-600 dark:text-gray-400"
  }
}

export function getTradeTypeIcon(tradeType: "BUY" | "SELL" | "OTHER"): string {
  switch (tradeType) {
    case "BUY":
      return "↗"
    case "SELL":
      return "↘"
    default:
      return "↔"
  }
}

export function getPerformanceColor(performance: number | null | undefined): string {
  if (performance === null || performance === undefined) return "text-gray-500"
  
  if (performance > 0) return "text-green-600 dark:text-green-400"
  if (performance < 0) return "text-red-600 dark:text-red-400"
  return "text-gray-600 dark:text-gray-400"
}

export function getSentimentColor(sentiment: string): string {
  switch (sentiment.toLowerCase()) {
    case "very_bullish":
    case "bullish":
      return "text-green-600 dark:text-green-400"
    case "very_bearish": 
    case "bearish":
      return "text-red-600 dark:text-red-400"
    default:
      return "text-gray-600 dark:text-gray-400"
  }
}

// User utilities
export function getUserInitials(name: string | null | undefined): string {
  if (!name) return "?"
  
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2)
}

export function getUserRoleBadgeColor(role: "USER" | "ADMIN"): string {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

export function getPlanBadgeColor(plan: "FREE" | "PAID"): string {
  switch (plan) {
    case "PAID":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

// Search utilities
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
}

// URL utilities
export function createShareUrl(path: string, params?: Record<string, string>): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://insiderpilot.com"
  const url = new URL(path, baseUrl)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  
  return url.toString()
}

// Validation utilities
export function isValidTicker(ticker: string): boolean {
  return /^[A-Z]{1,5}$/.test(ticker.toUpperCase())
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Storage utilities
export function safeLocalStorage() {
  const isClient = typeof window !== "undefined"
  
  return {
    getItem: (key: string) => {
      if (!isClient) return null
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },
    setItem: (key: string, value: string) => {
      if (!isClient) return
      try {
        localStorage.setItem(key, value)
      } catch {
        // Silently fail
      }
    },
    removeItem: (key: string) => {
      if (!isClient) return
      try {
        localStorage.removeItem(key)
      } catch {
        // Silently fail
      }
    },
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Analytics utilities
export function trackEvent(
  event: string,
  properties?: Record<string, any>
): void {
  // Only track in production and with user consent
  if (process.env.NODE_ENV !== "production") return
  
  try {
    // Integration with analytics service would go here
    console.log("Track event:", event, properties)
  } catch {
    // Silently fail
  }
}