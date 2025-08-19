/**
 * Person Detail Page - Politician or Corporate Insider profile with trading history
 */

import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TransactionCard, type TransactionData } from "@/components/ui/transaction-card"
import { PersonAvatar } from "@/components/ui/person-avatar"
import { PerformanceBadge } from "@/components/ui/performance-badge"
import { 
  Calendar,
  MapPin,
  Building2,
  TrendingUp,
  Award,
  ExternalLink,
  Bell,
  Share,
  Users,
  DollarSign
} from "lucide-react"
import { formatCurrency, formatNumber, cn } from "@/lib/utils"

// Mock data - in production this would come from the API
const mockPersonData = {
  "1": {
    id: "1",
    name: "Nancy Pelosi",
    type: "POLITICIAN" as const,
    title: "Former Speaker of the House",
    office: "Representative",
    party: "Democrat",
    state: "CA",
    district: "5th District",
    firstElected: "1987",
    age: 84,
    netWorth: 135000000,
    committee: "House Committee on Appropriations",
    website: "https://pelosi.house.gov",
    twitter: "@SpeakerPelosi",
    bio: "Nancy Patricia Pelosi is an American politician who served as the 52nd Speaker of the United States House of Representatives from 2019 to 2023.",
    totalTrades: 156,
    totalVolume: 45200000,
    avgPerformance: 28.4,
    winRate: 0.742,
    topSectors: ["Technology", "Healthcare", "Financial Services"]
  },
  "2": {
    id: "2", 
    name: "Jensen Huang",
    type: "CORPORATE_INSIDER" as const,
    title: "CEO & President",
    company: "NVIDIA Corporation",
    ticker: "NVDA",
    sector: "Technology",
    joinedCompany: "1993",
    age: 61,
    netWorth: 21000000000,
    education: "Stanford University (MS), Oregon State University (BS)",
    bio: "Jensen Huang is a Taiwanese-American billionaire business magnate and electrical engineer who co-founded and serves as president and CEO of NVIDIA Corporation.",
    totalTrades: 89,
    totalVolume: 2100000000,
    avgPerformance: 12.3,
    winRate: 0.651,
    topSectors: ["Technology"]
  }
}

const mockTransactions: Record<string, TransactionData[]> = {
  "1": [
    {
      id: "1",
      person: {
        id: "1",
        name: "Nancy Pelosi",
        title: "Former Speaker of the House",
        office: "Representative",
        party: "Democrat",
        state: "CA",
        type: "POLITICIAN"
      },
      company: {
        id: "1",
        name: "NVIDIA Corporation",
        ticker: "NVDA",
        sector: "Technology"
      },
      tradeType: "BUY",
      quantity: 2500,
      price: 600.00,
      estimatedValue: 1500000,
      transactionDate: "2024-01-15",
      reportedDate: "2024-01-18",
      filing: {
        id: "1",
        url: "https://disclosures-clerk.house.gov/filing/123",
        filingDate: "2024-01-18",
        formType: "PTR"
      },
      performanceSince: 23.4
    }
  ],
  "2": [
    {
      id: "2",
      person: {
        id: "2",
        name: "Jensen Huang",
        title: "CEO",
        type: "CORPORATE_INSIDER"
      },
      company: {
        id: "1",
        name: "NVIDIA Corporation", 
        ticker: "NVDA",
        sector: "Technology"
      },
      tradeType: "SELL",
      quantity: 240000,
      price: 772.50,
      estimatedValue: 185400000,
      transactionDate: "2024-01-12",
      reportedDate: "2024-01-14",
      filing: {
        id: "2",
        url: "https://sec.gov/Archives/edgar/data/123",
        filingDate: "2024-01-14",
        formType: "Form 4"
      },
      performanceSince: 18.7
    }
  ]
}

interface PersonPageProps {
  params: {
    id: string
  }
}

export default function PersonPage({ params }: PersonPageProps) {
  const person = mockPersonData[params.id as keyof typeof mockPersonData]
  const transactions = mockTransactions[params.id] || []
  
  if (!person) {
    notFound()
  }

  const isPolitician = person.type === "POLITICIAN"

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex items-start gap-6">
          <PersonAvatar
            name={person.name}
            personType={person.type}
            size="lg"
          />
          
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold">{person.name}</h1>
              <p className="text-xl text-muted-foreground">{person.title}</p>
              
              <div className="flex items-center gap-4 mt-2">
                {isPolitician ? (
                  <>
                    <Badge variant={person.party === "Democrat" ? "default" : "secondary"}>
                      {person.party}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{person.state} {person.district}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Badge variant="outline">{person.sector}</Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{person.company}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Key Stats */}
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold">
                  {formatNumber(person.totalTrades)}
                </div>
                <div className="text-sm text-muted-foreground">Total Trades</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(person.totalVolume, { compact: true })}
                </div>
                <div className="text-sm text-muted-foreground">Total Volume</div>
              </div>
              <div>
                <PerformanceBadge 
                  performance={person.avgPerformance}
                  showIcon={true}
                  size="lg"
                />
                <div className="text-sm text-muted-foreground mt-1">Avg Performance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Follow
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Win Rate</div>
            <div className="text-lg font-semibold">
              {(person.winRate * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Net Worth</div>
            <div className="text-lg font-semibold">
              {formatCurrency(person.netWorth, { compact: true })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Age</div>
            <div className="text-lg font-semibold">
              {person.age}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">
              {isPolitician ? "First Elected" : "Joined Company"}
            </div>
            <div className="text-lg font-semibold">
              {isPolitician ? person.firstElected : person.joinedCompany}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Trading History - Left Column */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Trading History</span>
                <Badge variant="outline">
                  {transactions.length} recent trades
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Suspense fallback={<div>Loading transactions...</div>}>
                {transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    showPerformance={true}
                  />
                ))}
              </Suspense>
              
              <div className="text-center pt-4">
                <Button variant="outline">
                  Load More Transactions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Sidebar - Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {isPolitician ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Office</span>
                      <span className="text-sm font-medium">{person.office}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Committee</span>
                      <span className="text-sm font-medium">{person.committee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">District</span>
                      <span className="text-sm font-medium">{person.district}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Company</span>
                      <span className="text-sm font-medium">{person.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Ticker</span>
                      <span className="text-sm font-medium">{person.ticker}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Education</span>
                      <span className="text-sm font-medium">{person.education}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  {person.bio}
                </p>
                
                <div className="space-y-2">
                  {person.website && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={person.website} target="_blank" rel="noopener noreferrer">
                        Official Website
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  
                  {person.twitter && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={`https://twitter.com/${person.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        Twitter {person.twitter}
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Sectors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Sectors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {person.topSectors.map((sector, index) => (
                <div key={sector} className="flex justify-between items-center">
                  <span className="text-sm">{sector}</span>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-bullish-600">
                  +{person.avgPerformance.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Average return since trade
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Profitable Trades</span>
                  <span className="text-sm font-medium">
                    {(person.winRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Volume</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(person.totalVolume, { compact: true })}
                  </span>
                </div>
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
export async function generateMetadata({ params }: PersonPageProps) {
  const person = mockPersonData[params.id as keyof typeof mockPersonData]
  
  if (!person) {
    return {
      title: "Person Not Found",
      description: "The requested person profile was not found."
    }
  }

  const personType = person.type === "POLITICIAN" ? "Politician" : "Corporate Insider"
  
  return {
    title: `${person.name} - ${personType} Trading Profile | Insider Pilot`,
    description: `Track ${person.name}'s trading activity and performance. ${person.totalTrades} trades worth ${formatCurrency(person.totalVolume, { compact: true })} with ${person.avgPerformance.toFixed(1)}% average performance.`,
    keywords: `${person.name}, ${personType.toLowerCase()}, insider trading, trading profile, ${person.type === 'POLITICIAN' ? 'congress trades' : 'corporate insider'}`,
  }
}