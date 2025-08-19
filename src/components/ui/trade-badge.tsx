/**
 * Trade Badge Component - Displays BUY/SELL with consistent styling
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tradeBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        buy: "bg-bullish-100 text-bullish-800 dark:bg-bullish-900/30 dark:text-bullish-400",
        sell: "bg-bearish-100 text-bearish-800 dark:bg-bearish-900/30 dark:text-bearish-400",
        other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "other",
      size: "default",
    },
  }
)

export interface TradeBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tradeBadgeVariants> {
  tradeType: "BUY" | "SELL" | "OTHER"
}

const TradeBadge = React.forwardRef<HTMLSpanElement, TradeBadgeProps>(
  ({ className, tradeType, size, ...props }, ref) => {
    const variant = tradeType === "BUY" ? "buy" : tradeType === "SELL" ? "sell" : "other"
    
    return (
      <span
        ref={ref}
        className={cn(tradeBadgeVariants({ variant, size }), className)}
        {...props}
      >
        {tradeType}
      </span>
    )
  }
)
TradeBadge.displayName = "TradeBadge"

export { TradeBadge, tradeBadgeVariants }