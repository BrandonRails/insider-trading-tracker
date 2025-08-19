/**
 * Transaction Card Component - Core component for displaying insider trades
 */

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "./card"
import { TradeBadge } from "./trade-badge"
import { PerformanceBadge } from "./performance-badge"
import { PersonAvatar } from "./person-avatar"
import { Badge } from "./badge"
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils"
import { ExternalLink, FileText } from "lucide-react"

export interface TransactionData {
  id: string
  person: {
    id: string
    name: string
    title?: string
    office?: string
    party?: string
    state?: string
    type: "POLITICIAN" | "CORPORATE_INSIDER"
  }
  company: {
    id: string
    name: string
    ticker: string
    sector?: string
  }
  tradeType: "BUY" | "SELL" | "OTHER"
  quantity?: number
  price?: number
  estimatedValue?: number
  amountRange?: string
  transactionDate: string
  reportedDate: string
  filing: {
    id: string
    url: string
    filingDate: string
    formType: string
  }
  performanceSince?: number
}

export interface TransactionCardProps {
  transaction: TransactionData
  showPerformance?: boolean
  compact?: boolean
  className?: string
}

const TransactionCard = React.forwardRef<HTMLDivElement, TransactionCardProps>(
  ({ transaction, showPerformance = true, compact = false, className }, ref) => {
    const {
      person,
      company,
      tradeType,
      quantity,
      price,
      estimatedValue,
      amountRange,
      transactionDate,
      filing,
      performanceSince,
    } = transaction

    // Determine display values
    const displayValue = estimatedValue 
      ? formatCurrency(estimatedValue, { compact: true })
      : amountRange || "—"

    const personTitle = person.type === "POLITICIAN" 
      ? `${person.office}${person.party ? ` (${person.party})` : ""}${person.state ? ` - ${person.state}` : ""}`
      : person.title

    return (
      <Card 
        ref={ref}
        className={cn(
          "transition-all duration-200 hover:shadow-md border-l-4",
          tradeType === "BUY" ? "border-l-bullish-500" : 
          tradeType === "SELL" ? "border-l-bearish-500" : 
          "border-l-gray-400",
          compact ? "p-3" : "p-4",
          className
        )}
      >
        <CardContent className={cn("space-y-3", compact ? "p-0" : "p-0")}>
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <PersonAvatar
                name={person.name}
                personType={person.type}
                size={compact ? "sm" : "default"}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link 
                    href={`/person/${person.id}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {person.name}
                  </Link>
                  
                  <Badge 
                    variant={person.type === "POLITICIAN" ? "politician" : "corporate"}
                    className="text-xs"
                  >
                    {person.type === "POLITICIAN" ? "Politician" : "Insider"}
                  </Badge>
                </div>
                
                {personTitle && (
                  <p className="text-sm text-muted-foreground truncate">
                    {personTitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TradeBadge tradeType={tradeType} size={compact ? "sm" : "default"} />
              
              {showPerformance && (
                <PerformanceBadge 
                  performance={performanceSince}
                  size={compact ? "sm" : "default"}
                />
              )}
            </div>
          </div>

          {/* Trade Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Company</p>
              <Link 
                href={`/ticker/${company.ticker}`}
                className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                {company.ticker}
                <span className="text-muted-foreground">•</span>
                <span className="truncate">{company.name}</span>
              </Link>
              {company.sector && (
                <p className="text-xs text-muted-foreground truncate">
                  {company.sector}
                </p>
              )}
            </div>

            <div>
              <p className="text-muted-foreground">Value</p>
              <p className="font-medium text-foreground">
                {displayValue}
              </p>
              {quantity && price && (
                <p className="text-xs text-muted-foreground">
                  {formatNumber(quantity)} @ {formatCurrency(price)}
                </p>
              )}
            </div>

            <div>
              <p className="text-muted-foreground">Trade Date</p>
              <p className="font-medium text-foreground">
                {formatDate(transactionDate, "medium")}
              </p>
              <p className="text-xs text-muted-foreground">
                Filed: {formatDate(filing.filingDate, "relative")}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/filing/${filing.id}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <FileText className="h-3 w-3" />
                {filing.formType}
              </Link>
              
              <a
                href={filing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Source
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
TransactionCard.displayName = "TransactionCard"

export { TransactionCard }