import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Insider Pilot specific variants
        bullish:
          "border-transparent bg-bullish-100 text-bullish-800 dark:bg-bullish-900 dark:text-bullish-300",
        bearish:
          "border-transparent bg-bearish-100 text-bearish-800 dark:bg-bearish-900 dark:text-bearish-300",
        neutral:
          "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        premium:
          "border-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold",
        politician:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        corporate:
          "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }