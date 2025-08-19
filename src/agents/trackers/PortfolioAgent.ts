/**
 * Portfolio Performance Tracking Agent
 * Tracks insider trading performance and creates virtual portfolios based on insider activity
 */

import { BaseAgent, AgentConfig, AgentResult } from '../core/BaseAgent';
import { InsiderTrade } from '../collectors/SECFilingAgent';

export interface Position {
  ticker: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  firstPurchaseDate: string;
  lastUpdateDate: string;
}

export interface Transaction {
  id: string;
  portfolioId: string;
  ticker: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  totalValue: number;
  date: string;
  basedOnInsiderTrade: string; // Reference to the insider trade that triggered this
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  strategy: 'follow_all' | 'follow_officers' | 'follow_directors' | 'large_trades_only';
  createdDate: string;
  initialBalance: number;
  currentBalance: number;
  totalInvested: number;
  currentValue: number;
  cashBalance: number;
  totalReturn: number;
  totalReturnPercent: number;
  positions: Position[];
  transactions: Transaction[];
  benchmarkComparison: {
    sp500Return: number;
    outperformance: number;
  };
  metrics: {
    winRate: number;
    avgHoldingPeriod: number; // days
    maxDrawdown: number;
    sharpeRatio: number;
    totalTrades: number;
  };
}

export interface InsiderPerformanceMetrics {
  insiderName: string;
  title: string;
  company: string;
  trades: {
    total: number;
    buys: number;
    sells: number;
  };
  performance: {
    avgReturn: number;
    winRate: number;
    totalValue: number;
    bestTrade: number;
    worstTrade: number;
  };
  timeframes: {
    '30d': number;
    '90d': number;
    '1y': number;
  };
  accuracy: number; // Overall accuracy score 0-100
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

export interface PortfolioResult {
  portfolios: Portfolio[];
  insiderPerformance: InsiderPerformanceMetrics[];
  marketComparison: {
    sp500YTD: number;
    bestPerformingPortfolio: string;
    totalPortfoliosValue: number;
    totalOutperformance: number;
  };
  summary: {
    totalPortfolios: number;
    profitablePortfolios: number;
    totalTransactions: number;
    avgPortfolioReturn: number;
    topPerformer: string;
    analysisDate: string;
  };
}

export class PortfolioAgent extends BaseAgent {
  private portfolios: Map<string, Portfolio> = new Map();
  private insiderMetrics: Map<string, InsiderPerformanceMetrics> = new Map();
  private priceHistory: Map<string, Array<{date: string, price: number}>> = new Map();

  constructor(config: Partial<AgentConfig> = {}) {
    super({
      name: 'Portfolio Performance Tracker',
      enabled: true,
      interval: 60 * 60 * 1000, // Update every hour
      ...config
    });

    // Initialize with demo portfolios
    this.initializeDemoPortfolios();
  }

  async execute(): Promise<AgentResult<PortfolioResult>> {
    this.log('info', 'Starting portfolio performance tracking...');

    try {
      // Get recent insider trades
      const recentTrades = await this.getRecentInsiderTrades();
      
      // Update portfolios based on new insider activity
      await this.updatePortfoliosFromInsiderTrades(recentTrades);
      
      // Update current prices and calculate performance
      await this.updatePortfolioPrices();
      
      // Calculate insider performance metrics
      const insiderPerformance = await this.calculateInsiderPerformance(recentTrades);
      
      // Generate market comparison data
      const marketComparison = this.calculateMarketComparison();
      
      const portfolioArray = Array.from(this.portfolios.values());
      
      const result: PortfolioResult = {
        portfolios: portfolioArray,
        insiderPerformance,
        marketComparison,
        summary: {
          totalPortfolios: portfolioArray.length,
          profitablePortfolios: portfolioArray.filter(p => p.totalReturnPercent > 0).length,
          totalTransactions: portfolioArray.reduce((sum, p) => sum + p.transactions.length, 0),
          avgPortfolioReturn: portfolioArray.reduce((sum, p) => sum + p.totalReturnPercent, 0) / portfolioArray.length,
          topPerformer: this.getTopPerformer(portfolioArray),
          analysisDate: new Date().toISOString()
        }
      };

      this.log('info', `Portfolio analysis complete: ${portfolioArray.length} portfolios tracked`);
      return {
        success: true,
        data: result
      };

    } catch (error) {
      this.log('error', 'Portfolio tracking failed', error);
      throw error;
    }
  }

  validate(data: PortfolioResult): boolean {
    return (
      Array.isArray(data.portfolios) &&
      Array.isArray(data.insiderPerformance) &&
      data.marketComparison &&
      data.summary &&
      typeof data.summary.totalPortfolios === 'number'
    );
  }

  private async getRecentInsiderTrades(): Promise<InsiderTrade[]> {
    // In production, fetch from database or SEC agent results
    // For demo, return mock data
    await this.delay(300);

    return [
      {
        cik: '0000320193',
        issuer: { name: 'Apple Inc.', symbol: 'AAPL' },
        insider: { name: 'Tim Cook', title: 'CEO', isOfficer: true, isDirector: true },
        transaction: {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          code: 'A',
          shares: 25000,
          pricePerShare: 190.50,
          totalValue: 4762500,
          sharesOwned: 3200000
        },
        filingDate: new Date().toISOString().split('T')[0],
        documentUrl: 'https://example.com/filing'
      }
    ];
  }

  private async updatePortfoliosFromInsiderTrades(trades: InsiderTrade[]): Promise<void> {
    for (const trade of trades) {
      for (const [portfolioId, portfolio] of this.portfolios) {
        if (this.shouldExecuteTradeForPortfolio(portfolio, trade)) {
          await this.executePortfolioTrade(portfolio, trade);
        }
      }
    }
  }

  private shouldExecuteTradeForPortfolio(portfolio: Portfolio, trade: InsiderTrade): boolean {
    switch (portfolio.strategy) {
      case 'follow_all':
        return trade.transaction.code === 'A'; // Follow all acquisitions

      case 'follow_officers':
        return trade.insider.isOfficer && trade.transaction.code === 'A';

      case 'follow_directors':
        return trade.insider.isDirector && trade.transaction.code === 'A';

      case 'large_trades_only':
        return trade.transaction.code === 'A' && trade.transaction.totalValue > 1000000;

      default:
        return false;
    }
  }

  private async executePortfolioTrade(portfolio: Portfolio, insiderTrade: InsiderTrade): Promise<void> {
    const ticker = insiderTrade.issuer.symbol;
    const currentPrice = await this.getCurrentPrice(ticker);
    const maxPositionSize = portfolio.currentBalance * 0.05; // Max 5% per position
    const sharesToBuy = Math.floor(maxPositionSize / currentPrice);
    
    if (sharesToBuy === 0) return;

    const totalCost = sharesToBuy * currentPrice;
    
    if (totalCost > portfolio.cashBalance) return;

    // Execute the trade
    const transaction: Transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      portfolioId: portfolio.id,
      ticker,
      type: 'buy',
      shares: sharesToBuy,
      price: currentPrice,
      totalValue: totalCost,
      date: new Date().toISOString(),
      basedOnInsiderTrade: `${insiderTrade.cik}-${insiderTrade.insider.name}`
    };

    portfolio.transactions.push(transaction);
    portfolio.cashBalance -= totalCost;
    portfolio.totalInvested += totalCost;

    // Update or create position
    const existingPosition = portfolio.positions.find(p => p.ticker === ticker);
    if (existingPosition) {
      const newTotalShares = existingPosition.shares + sharesToBuy;
      const newTotalCost = existingPosition.totalInvested + totalCost;
      
      existingPosition.shares = newTotalShares;
      existingPosition.avgPrice = newTotalCost / newTotalShares;
      existingPosition.totalInvested = newTotalCost;
      existingPosition.lastUpdateDate = new Date().toISOString();
    } else {
      const position: Position = {
        ticker,
        shares: sharesToBuy,
        avgPrice: currentPrice,
        currentPrice,
        totalInvested: totalCost,
        currentValue: totalCost,
        unrealizedGainLoss: 0,
        unrealizedGainLossPercent: 0,
        firstPurchaseDate: new Date().toISOString(),
        lastUpdateDate: new Date().toISOString()
      };
      
      portfolio.positions.push(position);
    }

    this.log('info', `Executed trade: Bought ${sharesToBuy} shares of ${ticker} at $${currentPrice} for portfolio ${portfolio.name}`);
  }

  private async updatePortfolioPrices(): Promise<void> {
    for (const portfolio of this.portfolios.values()) {
      let totalValue = portfolio.cashBalance;

      for (const position of portfolio.positions) {
        const currentPrice = await this.getCurrentPrice(position.ticker);
        
        position.currentPrice = currentPrice;
        position.currentValue = position.shares * currentPrice;
        position.unrealizedGainLoss = position.currentValue - position.totalInvested;
        position.unrealizedGainLossPercent = (position.unrealizedGainLoss / position.totalInvested) * 100;
        position.lastUpdateDate = new Date().toISOString();
        
        totalValue += position.currentValue;
      }

      portfolio.currentValue = totalValue;
      portfolio.totalReturn = portfolio.currentValue - portfolio.initialBalance;
      portfolio.totalReturnPercent = (portfolio.totalReturn / portfolio.initialBalance) * 100;
      
      // Update metrics
      portfolio.metrics = this.calculatePortfolioMetrics(portfolio);
    }
  }

  private async calculateInsiderPerformance(trades: InsiderTrade[]): Promise<InsiderPerformanceMetrics[]> {
    const insiderMap = new Map<string, InsiderTrade[]>();
    
    // Group trades by insider
    for (const trade of trades) {
      const key = `${trade.insider.name}-${trade.issuer.name}`;
      if (!insiderMap.has(key)) {
        insiderMap.set(key, []);
      }
      insiderMap.get(key)!.push(trade);
    }

    const metrics: InsiderPerformanceMetrics[] = [];
    
    for (const [key, insiderTrades] of insiderMap) {
      const firstTrade = insiderTrades[0];
      const buys = insiderTrades.filter(t => t.transaction.code === 'A');
      const sells = insiderTrades.filter(t => t.transaction.code === 'D');
      
      // Calculate mock performance (in production, use actual price data)
      const avgReturn = -5 + Math.random() * 30; // -5% to 25% range
      const winRate = 40 + Math.random() * 40; // 40% to 80% range
      
      metrics.push({
        insiderName: firstTrade.insider.name,
        title: firstTrade.insider.title,
        company: firstTrade.issuer.name,
        trades: {
          total: insiderTrades.length,
          buys: buys.length,
          sells: sells.length
        },
        performance: {
          avgReturn,
          winRate,
          totalValue: insiderTrades.reduce((sum, t) => sum + t.transaction.totalValue, 0),
          bestTrade: Math.max(...insiderTrades.map(t => t.transaction.totalValue * 0.1)),
          worstTrade: Math.min(...insiderTrades.map(t => -t.transaction.totalValue * 0.05))
        },
        timeframes: {
          '30d': avgReturn * (0.3 + Math.random() * 0.4),
          '90d': avgReturn * (0.7 + Math.random() * 0.6),
          '1y': avgReturn
        },
        accuracy: Math.round(winRate),
        riskProfile: this.determineRiskProfile(insiderTrades)
      });
    }

    return metrics;
  }

  private calculateMarketComparison() {
    const portfolios = Array.from(this.portfolios.values());
    const bestPerformer = portfolios.reduce((best, current) => 
      current.totalReturnPercent > best.totalReturnPercent ? current : best
    );

    const totalValue = portfolios.reduce((sum, p) => sum + p.currentValue, 0);
    const sp500YTD = 8.5 + Math.random() * 10; // Mock S&P 500 return
    const avgReturn = portfolios.reduce((sum, p) => sum + p.totalReturnPercent, 0) / portfolios.length;

    return {
      sp500YTD,
      bestPerformingPortfolio: bestPerformer.name,
      totalPortfoliosValue: totalValue,
      totalOutperformance: avgReturn - sp500YTD
    };
  }

  private calculatePortfolioMetrics(portfolio: Portfolio) {
    const completedTrades = portfolio.transactions.filter(t => t.type === 'sell');
    const totalTrades = completedTrades.length;
    const profitableTrades = completedTrades.filter(t => t.totalValue > 0).length;
    
    return {
      winRate: totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0,
      avgHoldingPeriod: 45 + Math.random() * 90, // Mock: 45-135 days
      maxDrawdown: -2 - Math.random() * 8, // Mock: -2% to -10%
      sharpeRatio: 0.5 + Math.random() * 1.0, // Mock: 0.5 to 1.5
      totalTrades
    };
  }

  private determineRiskProfile(trades: InsiderTrade[]): InsiderPerformanceMetrics['riskProfile'] {
    const avgTradeSize = trades.reduce((sum, t) => sum + t.transaction.totalValue, 0) / trades.length;
    
    if (avgTradeSize > 2000000) return 'aggressive';
    if (avgTradeSize > 500000) return 'moderate';
    return 'conservative';
  }

  private async getCurrentPrice(ticker: string): Promise<number> {
    // Simulate API call to get current price
    await this.delay(50);
    
    // Mock price data based on ticker
    const basePrices: Record<string, number> = {
      'AAPL': 190,
      'MSFT': 380,
      'NVDA': 450,
      'TSLA': 220,
      'GOOGL': 140
    };

    const basePrice = basePrices[ticker] || 100;
    // Add some random variation (±5%)
    return basePrice * (0.95 + Math.random() * 0.1);
  }

  private getTopPerformer(portfolios: Portfolio[]): string {
    if (portfolios.length === 0) return '';
    
    return portfolios.reduce((best, current) => 
      current.totalReturnPercent > best.totalReturnPercent ? current : best
    ).name;
  }

  private initializeDemoPortfolios(): void {
    const portfolios: Portfolio[] = [
      {
        id: 'portfolio-1',
        name: 'Officer Following Strategy',
        description: 'Follows all insider purchases by company officers',
        strategy: 'follow_officers',
        createdDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        initialBalance: 100000,
        currentBalance: 0,
        totalInvested: 0,
        currentValue: 0,
        cashBalance: 100000,
        totalReturn: 0,
        totalReturnPercent: 0,
        positions: [],
        transactions: [],
        benchmarkComparison: { sp500Return: 8.5, outperformance: 0 },
        metrics: { winRate: 0, avgHoldingPeriod: 0, maxDrawdown: 0, sharpeRatio: 0, totalTrades: 0 }
      },
      {
        id: 'portfolio-2',
        name: 'Large Trades Only',
        description: 'Follows only insider trades above $1M value',
        strategy: 'large_trades_only',
        createdDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        initialBalance: 250000,
        currentBalance: 0,
        totalInvested: 0,
        currentValue: 0,
        cashBalance: 250000,
        totalReturn: 0,
        totalReturnPercent: 0,
        positions: [],
        transactions: [],
        benchmarkComparison: { sp500Return: 8.5, outperformance: 0 },
        metrics: { winRate: 0, avgHoldingPeriod: 0, maxDrawdown: 0, sharpeRatio: 0, totalTrades: 0 }
      }
    ];

    for (const portfolio of portfolios) {
      this.portfolios.set(portfolio.id, portfolio);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for external access
  getPortfolio(id: string): Portfolio | null {
    return this.portfolios.get(id) || null;
  }

  getAllPortfolios(): Portfolio[] {
    return Array.from(this.portfolios.values());
  }

  getInsiderMetrics(insiderName: string): InsiderPerformanceMetrics | null {
    return this.insiderMetrics.get(insiderName) || null;
  }
}