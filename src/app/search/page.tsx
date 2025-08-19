/**
 * Search Results Page - Search across people, companies, and trades
 */

"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PersonAvatar } from "@/components/ui/person-avatar"
import { TransactionCard, type TransactionData } from "@/components/ui/transaction-card"
import { 
  Search, 
  Building2, 
  Users, 
  TrendingUp,
  Filter,
  X
} from "lucide-react"
import { formatCurrency, formatNumber, cn } from "@/lib/utils"

// Mock search results data
const mockSearchResults = {
  people: [
    {
      id: "1",
      name: "Nancy Pelosi",
      type: "POLITICIAN" as const,
      title: "Former Speaker of the House",
      party: "Democrat",
      state: "CA",
      totalTrades: 156,
      totalVolume: 45200000,
      avgPerformance: 28.4
    },
    {
      id: "2", 
      name: "Jensen Huang",
      type: "CORPORATE_INSIDER" as const,
      title: "CEO",
      company: "NVIDIA Corporation",
      ticker: "NVDA",
      totalTrades: 89,
      totalVolume: 2100000000,
      avgPerformance: 12.3
    }
  ],
  companies: [
    {
      id: "1",
      name: "NVIDIA Corporation",
      ticker: "NVDA",
      sector: "Technology",
      currentPrice: 772.50,
      priceChange: 5.2,
      priceChangePercent: 0.68,
      marketCap: 1890000000000,
      insiderTrades: 15,
      politicianTrades: 8
    },
    {
      id: "2",
      name: "Microsoft Corporation", 
      ticker: "MSFT",
      sector: "Technology",
      currentPrice: 415.26,
      priceChange: 2.1,
      priceChangePercent: 0.51,
      marketCap: 3080000000000,
      insiderTrades: 12,
      politicianTrades: 6
    }
  ],
  transactions: [
    {
      id: "1",
      person: {
        id: "1",
        name: "Nancy Pelosi",
        title: "Former Speaker of the House",
        office: "Representative",
        party: "Democrat",
        state: "CA",
        type: "POLITICIAN" as const
      },
      company: {
        id: "1",
        name: "NVIDIA Corporation",
        ticker: "NVDA",
        sector: "Technology"
      },
      tradeType: "BUY" as const,
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
  ]
}

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all')
  const [results, setResults] = useState(mockSearchResults)
  const [loading, setLoading] = useState(false)

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('q', searchTerm)
    if (filter !== 'all') params.set('filter', filter)
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
    router.replace(newUrl)
  }, [searchTerm, filter, router])

  // Simulate search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    setLoading(true)
    // In production, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setLoading(false)
  }

  const totalResults = results.people.length + results.companies.length + results.transactions.length

  const filteredResults = {
    people: filter === 'all' || filter === 'people' ? results.people : [],
    companies: filter === 'all' || filter === 'companies' ? results.companies : [],
    transactions: filter === 'all' || filter === 'transactions' ? results.transactions : []
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Search Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Search Results</h1>
          {searchTerm && (
            <p className="text-muted-foreground">
              Showing results for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Search Form */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search people, companies, or trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="people">People</SelectItem>
              <SelectItem value="companies">Companies</SelectItem>
              <SelectItem value="transactions">Transactions</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Results Summary */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {totalResults} results found
          </span>
          {searchTerm && (
            <Badge variant="secondary">
              "{searchTerm}"
            </Badge>
          )}
          {filter !== 'all' && (
            <Badge variant="secondary">
              {filter}
            </Badge>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-8">
        {/* People Results */}
        {filteredResults.people.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              People ({filteredResults.people.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResults.people.map((person) => (
                <Card key={person.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Link href={`/person/${person.id}`} className="block">
                      <div className="flex items-start gap-4">
                        <PersonAvatar
                          name={person.name}
                          personType={person.type}
                          size="md"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{person.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {person.title}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            {person.type === "POLITICIAN" ? (
                              <>
                                <Badge variant={person.party === "Democrat" ? "default" : "secondary"} className="text-xs">
                                  {person.party}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {person.state}
                                </span>
                              </>
                            ) : (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  {person.company}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {person.ticker}
                                </span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-sm">
                              <span className="font-medium">{person.totalTrades}</span>
                              <span className="text-muted-foreground"> trades</span>
                            </div>
                            <div className="text-sm font-medium text-bullish-600">
                              +{person.avgPerformance.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Companies Results */}
        {filteredResults.companies.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Companies ({filteredResults.companies.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResults.companies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Link href={`/ticker/${company.ticker}`} className="block">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{company.ticker}</h3>
                            <p className="text-sm text-muted-foreground">
                              {company.name}
                            </p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {company.sector}
                            </Badge>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(company.currentPrice)}
                            </div>
                            <div className={cn(
                              "text-sm",
                              company.priceChangePercent > 0 ? "text-bullish-600" : "text-bearish-600"
                            )}>
                              {company.priceChangePercent > 0 ? "+" : ""}{company.priceChange.toFixed(2)} ({company.priceChangePercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-muted-foreground">Market Cap: </span>
                            <span className="font-medium">
                              {formatCurrency(company.marketCap, { compact: true })}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <span>
                              <span className="font-medium">{company.insiderTrades}</span>
                              <span className="text-muted-foreground"> insiders</span>
                            </span>
                            <span>
                              <span className="font-medium">{company.politicianTrades}</span>
                              <span className="text-muted-foreground"> politicians</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Transactions Results */}
        {filteredResults.transactions.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Transactions ({filteredResults.transactions.length})
            </h2>
            <div className="space-y-4">
              {filteredResults.transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  showPerformance={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {totalResults === 0 && searchTerm && (
          <div className="text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}

        {/* Empty State */}
        {!searchTerm && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Start searching</h3>
            <p className="text-muted-foreground">
              Search for politicians, corporate insiders, companies, or specific trades
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchResultsContent />
    </Suspense>
  )
}

// Generate metadata for SEO
export function generateMetadata() {
  return {
    title: "Search | Insider Pilot",
    description: "Search for politicians, corporate insiders, companies, and trading activity. Find insider trades and track performance in real-time.",
    keywords: "search, insider trading, politicians, corporate insiders, stock search, trade search",
  }
}