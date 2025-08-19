/**
 * Trading Feed Section - Live insider and politician trades
 */

"use client"

import * as React from "react"
import { useState } from "react"
import { TransactionCard, type TransactionData } from "@/components/ui/transaction-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshCw, Filter, Search } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data - in production this would come from the API
const mockTransactions: TransactionData[] = [
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
  },
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
  },
  {
    id: "3", 
    person: {
      id: "3",
      name: "Dan Crenshaw",
      title: "U.S. Representative",
      office: "Representative",
      party: "Republican",
      state: "TX",
      type: "POLITICIAN"
    },
    company: {
      id: "2",
      name: "Microsoft Corporation",
      ticker: "MSFT", 
      sector: "Technology"
    },
    tradeType: "BUY",
    quantity: 2000,
    price: 375.00,
    estimatedValue: 750000,
    transactionDate: "2024-01-10",
    reportedDate: "2024-01-12",
    filing: {
      id: "3",
      url: "https://disclosures-clerk.house.gov/filing/456",
      filingDate: "2024-01-12", 
      formType: "PTR"
    },
    performanceSince: 12.1
  },
  {
    id: "4",
    person: {
      id: "4",
      name: "Tim Cook",
      title: "CEO",
      type: "CORPORATE_INSIDER"
    },
    company: {
      id: "3",
      name: "Apple Inc.",
      ticker: "AAPL",
      sector: "Technology"
    },
    tradeType: "SELL",
    quantity: 511000,
    price: 171.00,
    estimatedValue: 87420000,
    transactionDate: "2024-01-08",
    reportedDate: "2024-01-10",
    filing: {
      id: "4",
      url: "https://sec.gov/Archives/edgar/data/789",
      filingDate: "2024-01-10",
      formType: "Form 4"
    },
    performanceSince: 8.9
  }
]

interface TradingFeedProps {
  className?: string
}

export function TradingFeed({ className }: TradingFeedProps) {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [tradeFilter, setTradeFilter] = useState<string>("all")

  // Filter transactions based on current filters
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = searchTerm === "" || 
        transaction.person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.company.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.company.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === "all" ||
        (typeFilter === "politician" && transaction.person.type === "POLITICIAN") ||
        (typeFilter === "corporate" && transaction.person.type === "CORPORATE_INSIDER")

      const matchesTrade = tradeFilter === "all" ||
        transaction.tradeType.toLowerCase() === tradeFilter.toLowerCase()

      return matchesSearch && matchesType && matchesTrade
    })
  }, [transactions, searchTerm, typeFilter, tradeFilter])

  const handleRefresh = async () => {
    setLoading(true)
    // In production, refetch from API
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Live Trade Feed</h2>
          <p className="text-muted-foreground">
            Real-time insider and politician trading activity
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={loading}
          className="self-start"
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ticker, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Person type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="politician">Politicians</SelectItem>
            <SelectItem value="corporate">Corporate Insiders</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tradeFilter} onValueChange={setTradeFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Trade type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trades</SelectItem>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Showing {filteredTransactions.length} of {transactions.length} trades
        </span>
        {searchTerm && (
          <Badge variant="secondary">
            Searching: "{searchTerm}"
          </Badge>
        )}
        {typeFilter !== "all" && (
          <Badge variant="secondary">
            {typeFilter === "politician" ? "Politicians" : "Corporate Insiders"}
          </Badge>
        )}
        {tradeFilter !== "all" && (
          <Badge variant="secondary">
            {tradeFilter.toUpperCase()} trades
          </Badge>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              showPerformance={true}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No trades found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredTransactions.length > 0 && (
        <div className="text-center pt-6">
          <Button variant="outline" size="lg">
            Load More Trades
          </Button>
        </div>
      )}
    </div>
  )
}