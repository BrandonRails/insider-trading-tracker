/**
 * Performance Badge Component - Shows performance with color coding
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn, formatPercentage, getPerformanceColor } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const performanceBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        positive: "bg-bullish-50 text-bullish-700 dark:bg-bullish-950 dark:text-bullish-400",
        negative: "bg-bearish-50 text-bearish-700 dark:bg-bearish-950 dark:text-bearish-400",
        neutral: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-400",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs",
        default: "px-2 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
)

export interface PerformanceBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof performanceBadgeVariants> {
  performance: number | null | undefined
  showIcon?: boolean
  showSign?: boolean
}

const PerformanceBadge = React.forwardRef<HTMLSpanElement, PerformanceBadgeProps>(
  ({ className, performance, showIcon = true, showSign = true, size, ...props }, ref) => {
    if (performance === null || performance === undefined) {
      return (
        <span
          ref={ref}
          className={cn(performanceBadgeVariants({ variant: "neutral", size }), className)}
          {...props}
        >
          {showIcon && <Minus className="h-3 w-3" />}
          —
        </span>
      )
    }

    const variant = performance > 0 ? "positive" : performance < 0 ? "negative" : "neutral"
    const icon = performance > 0 ? TrendingUp : performance < 0 ? TrendingDown : Minus
    const IconComponent = icon

    return (
      <span
        ref={ref}
        className={cn(performanceBadgeVariants({ variant, size }), className)}
        {...props}
      >
        {showIcon && <IconComponent className="h-3 w-3" />}
        {formatPercentage(performance, { showSign })}
      </span>
    )
  }
)
PerformanceBadge.displayName = "PerformanceBadge"

export { PerformanceBadge, performanceBadgeVariants }