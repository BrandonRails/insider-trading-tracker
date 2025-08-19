/**
 * Watchlist Page - User's saved people and companies to track
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WatchlistItem, type WatchlistItemData } from "@/components/ui/watchlist-item"
import { 
  Search, 
  Plus, 
  Bookmark, 
  Bell,
  Users,
  Building2,
  Filter,
  Settings
} from "lucide-react"

// Mock watchlist data
const mockWatchlistItems: WatchlistItemData[] = [
  {
    id: "1",
    type: "PERSON",
    name: "Nancy Pelosi",
    title: "Former Speaker of the House",
    personType: "POLITICIAN",
    party: "Democrat",
    state: "CA",
    recentTrades: 23,
    totalVolume: 15200000,
    performance: 28.4,
    alertsEnabled: true,
    addedDate: "2024-01-15"
  },
  {
    id: "2", 
    type: "COMPANY",
    name: "NVIDIA Corporation",
    ticker: "NVDA",
    currentPrice: 772.50,
    priceChange: 5.2,
    priceChangePercent: 0.68,
    recentTrades: 15,
    totalVolume: 425000000,
    performance: 12.3,
    alertsEnabled: true,
    addedDate: "2024-01-12"
  },
  {
    id: "3",
    type: "PERSON", 
    name: "Jensen Huang",
    title: "CEO",
    personType: "CORPORATE_INSIDER",
    company: "NVIDIA",
    recentTrades: 8,
    totalVolume: 425000000,
    performance: 12.3,
    alertsEnabled: false,
    addedDate: "2024-01-10"
  },
  {
    id: "4",
    type: "COMPANY",
    name: "Microsoft Corporation",
    ticker: "MSFT", 
    currentPrice: 415.26,
    priceChange: 2.1,
    priceChangePercent: 0.51,
    recentTrades: 12,
    totalVolume: 187000000,
    performance: 8.9,
    alertsEnabled: true,
    addedDate: "2024-01-08"
  }
]

export default function WatchlistPage() {
  const [watchlistItems, setWatchlistItems] = useState(mockWatchlistItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "people" | "companies">("all")

  // Filter items based on search and filter
  const filteredItems = watchlistItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.ticker && item.ticker.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filter === "all" ||
      (filter === "people" && item.type === "PERSON") ||
      (filter === "companies" && item.type === "COMPANY")
    
    return matchesSearch && matchesFilter
  })

  const peopleCount = watchlistItems.filter(item => item.type === "PERSON").length
  const companiesCount = watchlistItems.filter(item => item.type === "COMPANY").length
  const alertsCount = watchlistItems.filter(item => item.alertsEnabled).length

  const handleRemoveItem = (id: string) => {
    setWatchlistItems(items => items.filter(item => item.id !== id))
  }

  const handleToggleAlerts = (id: string, enabled: boolean) => {
    setWatchlistItems(items => 
      items.map(item => 
        item.id === id ? { ...item, alertsEnabled: enabled } : item
      )
    )
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">My Watchlist</h1>
          <p className="text-muted-foreground">
            Track your favorite politicians, insiders, and companies
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add to Watchlist
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Alert Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bookmark className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{watchlistItems.length}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{peopleCount}</p>
                <p className="text-sm text-muted-foreground">People</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{companiesCount}</p>
                <p className="text-sm text-muted-foreground">Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-bullish-500" />
              <div>
                <p className="text-2xl font-bold">{alertsCount}</p>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your watchlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === "people" ? "default" : "outline"}
            onClick={() => setFilter("people")}
            size="sm"
          >
            People
          </Button>
          <Button
            variant={filter === "companies" ? "default" : "outline"}
            onClick={() => setFilter("companies")}
            size="sm"
          >
            Companies
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Showing {filteredItems.length} of {watchlistItems.length} items
        </span>
        {searchTerm && (
          <Badge variant="secondary">
            Searching: "{searchTerm}"
          </Badge>
        )}
        {filter !== "all" && (
          <Badge variant="secondary">
            {filter === "people" ? "People only" : "Companies only"}
          </Badge>
        )}
      </div>

      {/* Watchlist Items */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <WatchlistItem
              key={item.id}
              item={item}
              onRemove={handleRemoveItem}
              onToggleAlerts={handleToggleAlerts}
            />
          ))
        ) : (
          <div className="text-center py-12">
            {searchTerm || filter !== "all" ? (
              <>
                <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No matches found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter settings
                </p>
              </>
            ) : (
              <>
                <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Your watchlist is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Start tracking politicians, corporate insiders, and companies to get real-time alerts
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick Add Section */}
      {watchlistItems.length > 0 && (
        <Card className="bg-gradient-to-br from-bullish-50 to-bullish-100 dark:from-bullish-950 dark:to-bullish-900 border-bullish-200 dark:border-bullish-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Add
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Discover trending politicians and companies to add to your watchlist
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Trending Politicians
              </Button>
              <Button variant="outline" size="sm">
                Hot Tickers
              </Button>
              <Button variant="outline" size="sm">
                Top Performers
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Generate metadata for SEO
export function generateMetadata() {
  return {
    title: "My Watchlist | Insider Pilot",
    description: "Track your favorite politicians, corporate insiders, and companies. Get real-time alerts when they make trades.",
    keywords: "watchlist, track politicians, track insiders, stock alerts, trading alerts",
  }
}