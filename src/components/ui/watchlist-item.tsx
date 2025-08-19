/**
 * Watchlist Item Component - Individual item in a watchlist
 */

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PersonAvatar } from "@/components/ui/person-avatar"
import { PerformanceBadge } from "@/components/ui/performance-badge"
import { 
  X, 
  Bell, 
  BellOff, 
  TrendingUp, 
  TrendingDown,
  Building2,
  User
} from "lucide-react"
import { formatCurrency, formatNumber, cn } from "@/lib/utils"

export interface WatchlistItemData {
  id: string
  type: "PERSON" | "COMPANY"
  name: string
  ticker?: string
  title?: string
  personType?: "POLITICIAN" | "CORPORATE_INSIDER"
  party?: string
  state?: string
  company?: string
  currentPrice?: number
  priceChange?: number
  priceChangePercent?: number
  recentTrades: number
  totalVolume: number
  performance?: number
  alertsEnabled: boolean
  addedDate: string
}

interface WatchlistItemProps {
  item: WatchlistItemData
  onRemove?: (id: string) => void
  onToggleAlerts?: (id: string, enabled: boolean) => void
  showActions?: boolean
}

export function WatchlistItem({ 
  item, 
  onRemove, 
  onToggleAlerts, 
  showActions = true 
}: WatchlistItemProps) {
  const isCompany = item.type === "COMPANY"
  const linkUrl = isCompany ? `/ticker/${item.ticker}` : `/person/${item.id}`

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Link href={linkUrl} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {isCompany ? (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Building2 className="h-5 w-5" />
                </div>
              ) : (
                <PersonAvatar
                  name={item.name}
                  personType={item.personType!}
                  size="sm"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">
                  {isCompany ? item.ticker : item.name}
                </h3>
                
                {isCompany ? (
                  <Badge variant="outline" className="text-xs">
                    {item.name}
                  </Badge>
                ) : (
                  <>
                    {item.personType === "POLITICIAN" && (
                      <Badge 
                        variant={item.party === "Democrat" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {item.party}
                      </Badge>
                    )}
                    {item.personType === "CORPORATE_INSIDER" && (
                      <Badge variant="outline" className="text-xs">
                        {item.company}
                      </Badge>
                    )}
                  </>
                )}
              </div>

              <p className="text-sm text-muted-foreground truncate">
                {isCompany ? `${item.recentTrades} insider trades` : item.title}
              </p>

              <div className="flex items-center gap-4 mt-2">
                {isCompany && item.currentPrice && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">
                      {formatCurrency(item.currentPrice)}
                    </span>
                    <span className={cn(
                      "text-sm",
                      (item.priceChangePercent || 0) > 0 ? "text-bullish-600" : "text-bearish-600"
                    )}>
                      {(item.priceChangePercent || 0) > 0 ? (
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 inline mr-1" />
                      )}
                      {(item.priceChangePercent || 0) > 0 ? "+" : ""}{item.priceChangePercent?.toFixed(2)}%
                    </span>
                  </div>
                )}

                <div className="text-sm">
                  <span className="font-medium">{item.recentTrades}</span>
                  <span className="text-muted-foreground"> trades</span>
                </div>

                {item.performance !== undefined && (
                  <PerformanceBadge 
                    performance={item.performance}
                    size="sm"
                    showIcon={false}
                  />
                )}
              </div>
            </div>
          </Link>

          {showActions && (
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleAlerts?.(item.id, !item.alertsEnabled)}
                className="h-8 w-8 p-0"
              >
                {item.alertsEnabled ? (
                  <Bell className="h-4 w-4 text-bullish-600" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove?.(item.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}