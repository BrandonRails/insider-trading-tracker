/**
 * Homepage - Beautiful, modern design with working CSS
 */

import Link from "next/link"

// Mock data
const trendingTickers = [
  { ticker: "NVDA", price: 772.50, change: 5.2, volume: "45.2M" },
  { ticker: "MSFT", price: 415.26, change: 2.1, volume: "28.1M" },
  { ticker: "AAPL", price: 195.89, change: -1.3, volume: "52.8M" },
  { ticker: "GOOGL", price: 175.25, change: 3.7, volume: "22.4M" },
  { ticker: "TSLA", price: 248.42, change: 7.8, volume: "89.3M" }
]

const recentTrades = [
  {
    id: 1,
    person: "Nancy Pelosi",
    title: "Former Speaker of the House",
    party: "Democrat",
    state: "CA",
    company: "NVIDIA Corporation",
    ticker: "NVDA",
    tradeType: "BUY",
    value: 1500000,
    shares: 2500,
    price: 600.00,
    date: "Jan 14, 2024",
    performance: 23.4
  },
  {
    id: 2,
    person: "Jensen Huang",
    title: "CEO",
    company: "NVIDIA Corporation",
    ticker: "NVDA",
    tradeType: "SELL",
    value: 185000000,
    shares: 240000,
    price: 772.50,
    date: "Jan 12, 2024",
    performance: -18.7
  },
  {
    id: 3,
    person: "Dan Crenshaw",
    title: "Representative",
    party: "Republican",
    state: "TX",
    company: "Apple Inc",
    ticker: "AAPL",
    tradeType: "BUY",
    value: 950000,
    shares: 5000,
    price: 190.00,
    date: "Jan 10, 2024",
    performance: 12.8
  },
  {
    id: 4,
    person: "Tim Cook",
    title: "CEO",
    company: "Apple Inc",
    ticker: "AAPL",
    tradeType: "SELL",
    value: 4200000,
    shares: 22000,
    price: 191.00,
    date: "Jan 8, 2024",
    performance: 5.2
  }
]

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount.toFixed(2)}`
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export default function HomePage() {
  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <nav className="nav">
            <Link href="/" className="logo">
              <div className="logo-icon">IP</div>
              <span className="hidden md-block">Insider Pilot</span>
            </Link>
            
            <ul className="nav-links">
              <li><Link href="/" className="nav-link active">Feed</Link></li>
              <li><Link href="/search" className="nav-link">Search</Link></li>
              <li><Link href="/companies" className="nav-link">Companies</Link></li>
              <li><Link href="/politicians" className="nav-link">Politicians</Link></li>
              <li><Link href="/watchlist" className="nav-link">Watchlist</Link></li>
            </ul>
            
            <div className="flex items-center gap-4">
              <button className="btn btn-ghost">Sign In</button>
              <button className="btn btn-primary">Get Started</button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="text-center">
            <div className="badge">🚀 Now in Beta - Real-time insider tracking</div>
            <h1 className="hero-title">
              Track Insider & Politician Trades in Real Time
            </h1>
            <p className="hero-subtitle">
              Stay ahead of the market with actionable insights from SEC filings and Congressional disclosures. 
              Get instant alerts when insiders and politicians make moves.
            </p>
            
            <div className="flex justify-center gap-4 mt-4">
              <Link href="/trades" className="btn btn-primary">
                Explore Trades →
              </Link>
              <Link href="/demo" className="btn btn-secondary">
                ▶ Watch Demo
              </Link>
            </div>
            
            <div className="hero-badges">
              <div className="badge">📈 50,000+ trades tracked</div>
              <div className="badge">🔒 SOC 2 Type II</div>
              <div className="badge">⚖️ Enterprise security</div>
              <div className="badge">🛡️ OWASP ASVS 5.0</div>
              <div className="badge">✅ Security verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="feed-section">
        <div className="container">
          <div className="main-grid">
            {/* Feed */}
            <div>
              <h2 className="section-title">Live Trade Feed</h2>
              <p className="section-subtitle">Real-time insider and politician trading activity</p>
              
              {/* Controls */}
              <div className="controls">
                <button className="btn btn-ghost">🔄 Refresh</button>
                <input 
                  type="text" 
                  placeholder="Search by name, ticker, or company..." 
                  className="search-input"
                />
                <select className="select">
                  <option>All Types</option>
                  <option>Politicians</option>
                  <option>Corporate Insiders</option>
                </select>
                <select className="select">
                  <option>All Trades</option>
                  <option>Buy</option>
                  <option>Sell</option>
                </select>
              </div>
              
              <div className="text-sm text-muted-foreground mb-4">
                Showing {recentTrades.length} of {recentTrades.length} trades
              </div>

              {/* Trade Cards */}
              <div className="space-y-4">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="card fade-in">
                    <div className="transaction-card">
                      {/* Avatar */}
                      <div className="avatar">
                        {getInitials(trade.person)}
                      </div>
                      
                      {/* Person & Company Info */}
                      <div className="transaction-info">
                        <div className="person-name">{trade.person}</div>
                        <div className="person-title">
                          {trade.title}
                          {trade.party && ` (${trade.party})`}
                          {trade.state && ` - ${trade.state}`}
                        </div>
                        <div className="company-info">
                          <strong>{trade.ticker}</strong> • {trade.company}
                        </div>
                        <div className="company-info">
                          {trade.shares.toLocaleString()} @ ${trade.price.toFixed(2)} • {trade.date}
                        </div>
                      </div>
                      
                      {/* Trade Badge */}
                      <div className={`trade-badge ${trade.tradeType === 'BUY' ? 'trade-buy' : 'trade-sell'}`}>
                        {trade.tradeType}
                      </div>
                      
                      {/* Value & Performance */}
                      <div className="value-column">
                        <div className="trade-value">{formatCurrency(trade.value)}</div>
                        <div className={`performance ${trade.performance >= 0 ? 'positive' : 'negative'}`}>
                          {trade.performance >= 0 ? '+' : ''}{trade.performance.toFixed(1)}%
                        </div>
                        <div className="trade-details">
                          <Link href={`/filing/${trade.id}`} className="text-blue-600 hover:underline">
                            📄 PTR ↗ Source
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <button className="btn btn-primary">Load More Trades</button>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Trending Tickers */}
              <div className="sidebar">
                <h3 className="sidebar-title">📈 Trending Tickers</h3>
                {trendingTickers.map((ticker) => (
                  <div key={ticker.ticker} className="ticker-item">
                    <div>
                      <div className="ticker-symbol">{ticker.ticker}</div>
                      <div className="text-xs text-muted-foreground">Vol: {ticker.volume}</div>
                    </div>
                    <div className="text-right">
                      <div className="ticker-price">${ticker.price.toFixed(2)}</div>
                      <div className={`text-xs ${ticker.change >= 0 ? 'ticker-change positive' : 'ticker-change negative'}`}>
                        {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/trending" className="btn btn-ghost btn-sm mt-4 block text-center">
                  View All Trending →
                </Link>
              </div>

              {/* Ad Slot */}
              <div className="sidebar mt-4" style={{background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '2px dashed #0ea5e9'}}>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Advertisement</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    300x250 Ad Unit
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Upgrade to Pro to remove ads
                  </div>
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="sidebar mt-4" style={{background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', border: '1px solid #16a34a'}}>
                <div className="text-center">
                  <div className="text-2xl mb-2">👑</div>
                  <h3 className="font-bold text-green-900 mb-2">Upgrade to Pro</h3>
                  <p className="text-sm text-green-700 mb-4">
                    Get real-time alerts, advanced analytics, and ad-free experience for just $0.99/day.
                  </p>
                  <Link href="/pricing" className="btn btn-primary block">
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}