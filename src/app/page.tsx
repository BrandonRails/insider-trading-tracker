'use client';

import { useState } from 'react';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Menu, 
  X, 
  ArrowUpRight,
  Star,
  Bell,
  Share2,
  BarChart3,
  Users,
  Crown,
  Eye
} from 'lucide-react';
import AdSlot from '../components/AdSlot';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock data for trades
  const mockTrades = [
    {
      id: 1,
      name: 'Nancy Pelosi',
      role: 'Former Speaker of the House',
      party: 'Democrat',
      avatar: '/avatars/pelosi.jpg',
      tradeType: 'BUY',
      ticker: 'NVDA',
      company: 'NVIDIA Corporation',
      amount: 1500000,
      shares: 2500,
      date: '2024-01-15',
      source: 'Congressional Disclosure',
      performance: '+23.4%',
      sparkline: [100, 105, 110, 115, 123],
      category: 'politician'
    },
    {
      id: 2,
      name: 'Jensen Huang',
      role: 'CEO',
      party: null,
      avatar: '/avatars/huang.jpg',
      tradeType: 'SELL',
      ticker: 'NVDA',
      company: 'NVIDIA Corporation',
      amount: 185400000,
      shares: 240000,
      date: '2024-01-12',
      source: 'SEC Form 4',
      performance: '+18.7%',
      sparkline: [100, 98, 102, 108, 118],
      category: 'insider'
    },
    {
      id: 3,
      name: 'Dan Crenshaw',
      role: 'U.S. Representative',
      party: 'Republican',
      avatar: '/avatars/crenshaw.jpg',
      tradeType: 'BUY',
      ticker: 'MSFT',
      company: 'Microsoft Corporation',
      amount: 750000,
      shares: 2000,
      date: '2024-01-10',
      source: 'Congressional Disclosure',
      performance: '+12.1%',
      sparkline: [100, 103, 101, 107, 112],
      category: 'politician'
    },
    {
      id: 4,
      name: 'Tim Cook',
      role: 'CEO',
      party: null,
      avatar: '/avatars/cook.jpg',
      tradeType: 'SELL',
      ticker: 'AAPL',
      company: 'Apple Inc.',
      amount: 87420000,
      shares: 511000,
      date: '2024-01-08',
      source: 'SEC Form 4',
      performance: '+8.9%',
      sparkline: [100, 102, 105, 103, 108],
      category: 'insider'
    }
  ];

  const trendingTickers = [
    { ticker: 'NVDA', price: '$772.50', change: '+5.2%', volume: '45.2M' },
    { ticker: 'MSFT', price: '$415.26', change: '+2.1%', volume: '28.1M' },
    { ticker: 'AAPL', price: '$195.89', change: '-1.3%', volume: '52.8M' },
    { ticker: 'GOOGL', price: '$175.25', change: '+3.7%', volume: '22.4M' },
    { ticker: 'TSLA', price: '$248.42', change: '+7.8%', volume: '89.3M' }
  ];

  const topPoliticians = [
    { name: 'Nancy Pelosi', trades: 23, volume: '$15.2M', performance: '+28.4%' },
    { name: 'Dan Crenshaw', trades: 18, volume: '$8.7M', performance: '+22.1%' },
    { name: 'Josh Gottheimer', trades: 15, volume: '$12.3M', performance: '+19.8%' },
    { name: 'Susie Lee', trades: 12, volume: '$5.9M', performance: '+17.2%' },
    { name: 'Pat Fallon', trades: 9, volume: '$3.4M', performance: '+15.6%' }
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Profile image component showing initials badges (ready for real images when available)
  const ProfileImage = ({ trade }: { trade: typeof mockTrades[0] }) => {
    const isPolitician = trade.category === 'politician';
    
    const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    // Currently displays initials - replace with actual images when assets are available
    return (
      <div 
        className={`w-10 h-10 flex items-center justify-center text-white font-bold text-sm ${
          isPolitician ? 'rounded-full' : 'rounded-md'
        }`} 
        style={{ backgroundColor: '#21262D' }}
      >
        {getInitials(trade.name)}
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D1117' }}>
      {/* Sticky Navigation */}
      <header>
        <nav className="sticky top-0 z-50 border-b" style={{ 
          backgroundColor: '#161B22', 
          borderColor: '#21262D' 
        }}>
          <div className="container mx-auto">
            <div className="flex items-center justify-between h-16">
              {/* Logo & Brand */}
              <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#00C08B' }}>
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Insider Pulse</span>
              </a>

              {/* Center Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="/" className="text-white font-medium hover:opacity-80 transition-opacity">Home</a>
                <a href="/insider-trades" className="hover:text-white transition-colors" style={{ color: '#A1A1A6' }}>Insider Trades</a>
                <a href="/politician-trades" className="hover:text-white transition-colors" style={{ color: '#A1A1A6' }}>Politician Trades</a>
                <a href="/leaderboard" className="hover:text-white transition-colors" style={{ color: '#A1A1A6' }}>Leaderboard</a>
                <a href="/watchlist" className="hover:text-white transition-colors" style={{ color: '#A1A1A6' }}>Watchlist</a>
              </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#A1A1A6' }} />
                <input
                  type="text"
                  placeholder="Search insider, politician, ticker..."
                  className="pl-10 pr-4 py-2 rounded-lg border text-sm w-64 focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: '#0D1117', 
                    borderColor: '#21262D',
                    color: '#FFFFFF',
                    focusRingColor: '#00C08B'
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Auth Buttons */}
              <button className="px-4 py-2 text-sm font-medium text-white border rounded-lg hover:opacity-80" style={{ borderColor: '#21262D' }}>
                Login
              </button>
              <button 
                className="px-4 py-2 text-sm font-bold text-black rounded-lg hover:opacity-90 pulse-glow"
                style={{ backgroundColor: '#00C08B' }}
              >
                Upgrade
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: '#A1A1A6' }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t" style={{ borderColor: '#21262D' }}>
              <div className="py-4 space-y-2">
                <a href="/" className="block px-4 py-2 text-white font-medium">Home</a>
                <a href="/insider-trades" className="block px-4 py-2 hover:text-white transition-colors" style={{ color: '#A1A1A6' }}>Insider Trades</a>
                <a href="/politician-trades" className="block px-4 py-2 hover:text-white transition-colors" style={{ color: '#A1A1A6' }}>Politician Trades</a>
                <a href="/leaderboard" className="block px-4 py-2 hover:text-white transition-colors" style={{ color: '#A1A1A6' }}>Leaderboard</a>
                <a href="/watchlist" className="block px-4 py-2 hover:text-white transition-colors" style={{ color: '#A1A1A6' }}>Watchlist</a>
              </div>
            </div>
          )}
        </div>
      </nav>
      </header>

      {/* Hero Section */}
      <section className="hero relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="ticker-scroll flex space-x-8 whitespace-nowrap">
            <span className="text-4xl font-mono" style={{ color: '#00C08B' }}>NVDA $772.50 ↑5.2%</span>
            <span className="text-4xl font-mono" style={{ color: '#E63946' }}>TSLA $248.42 ↓2.1%</span>
            <span className="text-4xl font-mono" style={{ color: '#00C08B' }}>MSFT $415.26 ↑3.7%</span>
            <span className="text-4xl font-mono" style={{ color: '#00C08B' }}>AAPL $195.89 ↑1.3%</span>
          </div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 fade-in leading-tight">
            Track Insider & Politician Trades in{' '}
            <span style={{ color: '#00C08B' }}>Real Time</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto fade-in" style={{ color: '#A1A1A6' }}>
            Stay ahead of the market with actionable insights from SEC filings and Congressional disclosures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in">
            <button 
              className="px-8 py-4 rounded-lg font-bold text-black text-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#00C08B' }}
            >
              Explore Trades
            </button>
            <button className="px-8 py-4 rounded-lg font-medium text-white border text-lg hover:opacity-80 transition-opacity" style={{ borderColor: '#21262D' }}>
              Upgrade for Alerts
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto py-12">
        <div className="grid-12">
          {/* Live Feed - Left Column (8 cols) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Live Trade Feed</h2>
            
            {mockTrades.map((trade) => (
              <div 
                key={trade.id} 
                className="feed-card rounded-xl border hover:border-opacity-50 transition-all fade-in"
                style={{ 
                  backgroundColor: '#161B22', 
                  borderColor: '#21262D' 
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Profile Image */}
                    <ProfileImage trade={trade} />
                    
                    {/* Trade Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-white">{trade.name}</h3>
                        {trade.party && (
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: trade.party === 'Democrat' ? '#1f2937' : '#7f1d1d',
                              color: trade.party === 'Democrat' ? '#60a5fa' : '#fca5a5'
                            }}
                          >
                            {trade.party}
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: '#A1A1A6' }}>{trade.role}</p>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <span 
                          className={`trade-chip ${trade.tradeType === 'BUY' ? 'buy-chip' : 'sell-chip'}`}
                        >
                          {trade.tradeType}
                        </span>
                        <span className="font-bold text-white">{trade.ticker}</span>
                        <span className="font-semibold text-white">{formatCurrency(trade.amount)}</span>
                        <span className="text-sm" style={{ color: '#A1A1A6' }}>{new Date(trade.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Performance & Actions */}
                  <div className="trade-card-right">
                    <div className="text-right mb-2">
                      <div className="text-sm font-medium" style={{ color: '#00C08B' }}>
                        {trade.performance}
                      </div>
                      <div className="text-xs" style={{ color: '#A1A1A6' }}>
                        {trade.source}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 justify-end">
                      <button className="p-2 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: '#21262D' }}>
                        <Star className="standard-icon" style={{ color: '#A1A1A6' }} />
                      </button>
                      <button className="p-2 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: '#21262D' }}>
                        <Bell className="standard-icon" style={{ color: '#A1A1A6' }} />
                      </button>
                      <button className="p-2 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: '#21262D' }}>
                        <Share2 className="standard-icon" style={{ color: '#A1A1A6' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar - Right Column (4 cols) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Trending Tickers */}
            <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#161B22' }}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center icon-gap">
                <BarChart3 className="standard-icon" style={{ color: '#00C08B' }} />
                Trending Tickers
              </h3>
              <div className="space-y-3">
                {trendingTickers.map((ticker, index) => (
                  <div key={ticker.ticker} className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{ticker.ticker}</div>
                      <div className="text-sm" style={{ color: '#A1A1A6' }}>Vol: {ticker.volume}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">{ticker.price}</div>
                      <div 
                        className={`text-sm font-medium ${
                          ticker.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {ticker.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Politicians */}
            <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#161B22' }}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center icon-gap">
                <Crown className="standard-icon" style={{ color: '#00C08B' }} />
                Top Politicians This Week
              </h3>
              <div className="space-y-3">
                {topPoliticians.map((politician, index) => (
                  <div key={politician.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold w-6" style={{ color: '#A1A1A6' }}>#{index + 1}</span>
                      <div>
                        <div className="font-medium text-white">{politician.name}</div>
                        <div className="text-sm" style={{ color: '#A1A1A6' }}>{politician.trades} trades</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">{politician.volume}</div>
                      <div className="text-sm" style={{ color: '#00C08B' }}>{politician.performance}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ad Slot */}
            <AdSlot />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12" style={{ borderColor: '#21262D' }}>
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#00C08B' }}>
                <Search className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">Insider Pulse</span>
              <span className="text-sm" style={{ color: '#A1A1A6' }}>Real-time market intelligence</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm hover:text-white" style={{ color: '#A1A1A6' }}>Terms</a>
              <a href="#" className="text-sm hover:text-white" style={{ color: '#A1A1A6' }}>Privacy</a>
              <a href="#" className="text-sm hover:text-white" style={{ color: '#A1A1A6' }}>Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center" style={{ borderColor: '#21262D' }}>
            <div className="ticker-scroll text-sm opacity-60" style={{ color: '#A1A1A6' }}>
              Not financial advice • Data from SEC filings and public disclosures • Trade at your own risk
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
