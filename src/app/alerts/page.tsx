/**
 * Alerts Page - Alert history and notification settings
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { PersonAvatar } from "@/components/ui/person-avatar"
import { 
  Bell, 
  BellOff, 
  Clock, 
  Check,
  X,
  Search,
  Settings,
  Smartphone,
  Mail,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Filter
} from "lucide-react"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"

// Mock alert data
interface Alert {
  id: string
  type: "TRADE" | "PRICE" | "VOLUME" | "PERFORMANCE"
  title: string
  description: string
  person?: {
    id: string
    name: string
    type: "POLITICIAN" | "CORPORATE_INSIDER"
    avatar?: string
  }
  company?: {
    ticker: string
    name: string
  }
  value?: number
  performance?: number
  timestamp: string
  read: boolean
  priority: "LOW" | "MEDIUM" | "HIGH"
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "TRADE",
    title: "Nancy Pelosi bought NVDA",
    description: "Purchased $1.5M worth of NVIDIA shares at $600.00",
    person: {
      id: "1",
      name: "Nancy Pelosi",
      type: "POLITICIAN"
    },
    company: {
      ticker: "NVDA",
      name: "NVIDIA Corporation"
    },
    value: 1500000,
    timestamp: "2024-01-18T10:30:00Z",
    read: false,
    priority: "HIGH"
  },
  {
    id: "2",
    type: "PERFORMANCE",
    title: "Your NVDA watchlist alert",
    description: "NVIDIA is up 23.4% since Nancy Pelosi's purchase",
    person: {
      id: "1", 
      name: "Nancy Pelosi",
      type: "POLITICIAN"
    },
    company: {
      ticker: "NVDA",
      name: "NVIDIA Corporation"
    },
    performance: 23.4,
    timestamp: "2024-01-17T14:20:00Z",
    read: true,
    priority: "MEDIUM"
  },
  {
    id: "3",
    type: "TRADE",
    title: "Jensen Huang sold NVDA",
    description: "Sold $185.4M worth of NVIDIA shares at $772.50",
    person: {
      id: "2",
      name: "Jensen Huang", 
      type: "CORPORATE_INSIDER"
    },
    company: {
      ticker: "NVDA",
      name: "NVIDIA Corporation"
    },
    value: 185400000,
    timestamp: "2024-01-14T16:45:00Z",
    read: true,
    priority: "HIGH"
  },
  {
    id: "4",
    type: "PRICE", 
    title: "MSFT price alert triggered",
    description: "Microsoft reached your target price of $415.00",
    company: {
      ticker: "MSFT",
      name: "Microsoft Corporation"
    },
    value: 415.00,
    timestamp: "2024-01-12T09:15:00Z",
    read: true,
    priority: "LOW"
  }
]

const alertTypeIcons = {
  TRADE: TrendingUp,
  PRICE: DollarSign,
  VOLUME: TrendingUp,
  PERFORMANCE: TrendingUp
}

const priorityColors = {
  LOW: "text-muted-foreground",
  MEDIUM: "text-yellow-600",
  HIGH: "text-red-600"
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    trades: true,
    priceAlerts: true,
    performance: false,
    weeklyDigest: true
  })

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchTerm === "" ||
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.person?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alert.company?.ticker.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filter === "all" ||
      (filter === "unread" && !alert.read) ||
      (filter === "read" && alert.read)
    
    return matchesSearch && matchesFilter
  })

  const unreadCount = alerts.filter(alert => !alert.read).length

  const handleMarkAsRead = (id: string) => {
    setAlerts(alerts => 
      alerts.map(alert =>
        alert.id === id ? { ...alert, read: true } : alert
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setAlerts(alerts => 
      alerts.map(alert => ({ ...alert, read: true }))
    )
  }

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts => alerts.filter(alert => alert.id !== id))
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8" />
            Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Stay updated on your watchlist activity and market movements
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Alerts Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
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
                variant={filter === "unread" ? "default" : "outline"}
                onClick={() => setFilter("unread")}
                size="sm"
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === "read" ? "default" : "outline"}
                onClick={() => setFilter("read")}
                size="sm"
              >
                Read
              </Button>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => {
                const IconComponent = alertTypeIcons[alert.type]
                
                return (
                  <Card 
                    key={alert.id} 
                    className={`transition-all ${
                      !alert.read ? "ring-2 ring-bullish-200 bg-bullish-50/50 dark:bg-bullish-950/50" : "hover:shadow-md"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`p-2 rounded-full ${
                            !alert.read ? "bg-bullish-100" : "bg-muted"
                          }`}>
                            <IconComponent className={`h-4 w-4 ${priorityColors[alert.priority]}`} />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`font-semibold ${!alert.read ? "text-foreground" : "text-muted-foreground"}`}>
                                {alert.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {alert.description}
                              </p>

                              <div className="flex items-center gap-4 mt-3">
                                {alert.person && (
                                  <div className="flex items-center gap-2">
                                    <PersonAvatar
                                      name={alert.person.name}
                                      personType={alert.person.type}
                                      size="xs"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      {alert.person.name}
                                    </span>
                                  </div>
                                )}

                                {alert.company && (
                                  <div className="text-xs text-muted-foreground">
                                    {alert.company.ticker}
                                  </div>
                                )}

                                {alert.value && (
                                  <div className="text-xs font-medium">
                                    {formatCurrency(alert.value, { compact: true })}
                                  </div>
                                )}

                                {alert.performance && (
                                  <Badge variant="bullish" className="text-xs">
                                    +{alert.performance.toFixed(1)}%
                                  </Badge>
                                )}

                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatRelativeTime(new Date(alert.timestamp))}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              {!alert.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(alert.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAlert(alert.id)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-12">
                {searchTerm || filter !== "all" ? (
                  <>
                    <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No alerts found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filter settings
                    </p>
                  </>
                ) : (
                  <>
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No alerts yet</h3>
                    <p className="text-muted-foreground">
                      Start following people and companies to receive alerts
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Delivery Methods */}
              <div className="space-y-4">
                <h4 className="font-medium">Delivery Methods</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Email</span>
                    </div>
                    <Switch
                      checked={notificationSettings.email}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Push Notifications</span>
                    </div>
                    <Switch
                      checked={notificationSettings.push}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, push: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">SMS</span>
                    </div>
                    <Switch
                      checked={notificationSettings.sms}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, sms: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Alert Types */}
              <div className="space-y-4">
                <h4 className="font-medium">Alert Types</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New Trades</span>
                    <Switch
                      checked={notificationSettings.trades}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, trades: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Price Alerts</span>
                    <Switch
                      checked={notificationSettings.priceAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, priceAlerts: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Performance Updates</span>
                    <Switch
                      checked={notificationSettings.performance}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, performance: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly Digest</span>
                    <Switch
                      checked={notificationSettings.weeklyDigest}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, weeklyDigest: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Alerts</span>
                <span className="font-medium">{alerts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Unread</span>
                <span className="font-medium">{unreadCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="font-medium">
                  {alerts.filter(alert => 
                    new Date(alert.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Ad Slot */}
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">Advertisement</div>
                <div className="text-xs text-muted-foreground">
                  300x250 Ad Unit
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Generate metadata for SEO
export function generateMetadata() {
  return {
    title: "Alerts | Insider Pilot",
    description: "Stay updated with real-time alerts on insider trading activity, price movements, and performance updates from your watchlist.",
    keywords: "trading alerts, insider trading notifications, stock alerts, watchlist alerts",
  }
}