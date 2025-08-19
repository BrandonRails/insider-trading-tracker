/**
 * Trade Pattern Analysis Agent
 * Analyzes insider trading patterns to identify trends and generate insights
 */

import { BaseAgent, AgentConfig, AgentResult } from '../core/BaseAgent';
import { InsiderTrade } from '../collectors/SECFilingAgent';

export interface TradePattern {
  pattern: 'cluster_buying' | 'cluster_selling' | 'pre_earnings' | 'unusual_volume' | 'timing_pattern';
  confidence: number; // 0-1 scale
  description: string;
  significance: 'low' | 'medium' | 'high';
  affectedTickers: string[];
  timeframe: {
    start: string;
    end: string;
  };
  metadata: Record<string, any>;
}

export interface InsiderInsight {
  insiderName: string;
  pattern: 'consistently_bullish' | 'consistently_bearish' | 'market_timer' | 'diversifier';
  accuracy: number; // Historical accuracy percentage
  recentTrades: number;
  avgReturn: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

export interface MarketSignal {
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-1 scale
  sector?: string;
  reason: string;
  supportingTrades: number;
  timeHorizon: 'short' | 'medium' | 'long';
}

export interface PatternAnalysisResult {
  patterns: TradePattern[];
  insiderInsights: InsiderInsight[];
  marketSignals: MarketSignal[];
  summary: {
    totalTrades: number;
    bullishSignals: number;
    bearishSignals: number;
    unusualActivity: number;
    analysisDate: string;
  };
}

export class TradePatternAgent extends BaseAgent {
  private tradeHistory: InsiderTrade[] = [];
  private patternCache = new Map<string, TradePattern[]>();

  constructor(config: Partial<AgentConfig> = {}) {
    super({
      name: 'Trade Pattern Analyzer',
      enabled: true,
      interval: 30 * 60 * 1000, // Analyze every 30 minutes
      ...config
    });
  }

  async execute(): Promise<AgentResult<PatternAnalysisResult>> {
    this.log('info', 'Starting trade pattern analysis...');

    try {
      // Load recent trades (in production, from database)
      const recentTrades = await this.loadRecentTrades();
      this.tradeHistory = recentTrades;

      if (recentTrades.length === 0) {
        this.log('warn', 'No trades available for analysis');
        return {
          success: true,
          data: this.getEmptyResult()
        };
      }

      // Perform various pattern analyses
      const patterns = await this.analyzePatterns(recentTrades);
      const insights = await this.generateInsiderInsights(recentTrades);
      const signals = await this.generateMarketSignals(recentTrades);

      const result: PatternAnalysisResult = {
        patterns,
        insiderInsights: insights,
        marketSignals: signals,
        summary: {
          totalTrades: recentTrades.length,
          bullishSignals: signals.filter(s => s.signal === 'bullish').length,
          bearishSignals: signals.filter(s => s.signal === 'bearish').length,
          unusualActivity: patterns.filter(p => p.significance === 'high').length,
          analysisDate: new Date().toISOString()
        }
      };

      this.log('info', `Analysis complete: Found ${patterns.length} patterns, ${insights.length} insights`);
      return {
        success: true,
        data: result
      };

    } catch (error) {
      this.log('error', 'Pattern analysis failed', error);
      throw error;
    }
  }

  validate(data: PatternAnalysisResult): boolean {
    return (
      Array.isArray(data.patterns) &&
      Array.isArray(data.insiderInsights) &&
      Array.isArray(data.marketSignals) &&
      data.summary &&
      typeof data.summary.totalTrades === 'number'
    );
  }

  private async loadRecentTrades(): Promise<InsiderTrade[]> {
    // Simulate loading trades from database
    await this.delay(500);

    // In production, this would query your database
    // For demo, return mock data
    return this.generateMockTrades();
  }

  private async analyzePatterns(trades: InsiderTrade[]): Promise<TradePattern[]> {
    const patterns: TradePattern[] = [];

    // 1. Detect cluster buying/selling patterns
    const clusterPatterns = this.detectClusterPatterns(trades);
    patterns.push(...clusterPatterns);

    // 2. Detect pre-earnings patterns
    const earningsPatterns = this.detectPreEarningsPatterns(trades);
    patterns.push(...earningsPatterns);

    // 3. Detect unusual volume patterns
    const volumePatterns = this.detectUnusualVolumePatterns(trades);
    patterns.push(...volumePatterns);

    return patterns;
  }

  private detectClusterPatterns(trades: InsiderTrade[]): TradePattern[] {
    const patterns: TradePattern[] = [];
    const tickerGroups = this.groupByTicker(trades);

    for (const [ticker, tickerTrades] of tickerGroups) {
      const recentTrades = tickerTrades.filter(t => 
        new Date(t.filingDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      if (recentTrades.length >= 3) {
        const buyTrades = recentTrades.filter(t => t.transaction.code === 'A');
        const sellTrades = recentTrades.filter(t => t.transaction.code === 'D');

        if (buyTrades.length >= 2) {
          patterns.push({
            pattern: 'cluster_buying',
            confidence: Math.min(buyTrades.length / 5, 1),
            description: `${buyTrades.length} insider purchases in ${ticker} within 7 days`,
            significance: buyTrades.length >= 4 ? 'high' : 'medium',
            affectedTickers: [ticker],
            timeframe: {
              start: Math.min(...buyTrades.map(t => new Date(t.transaction.date).getTime())).toString(),
              end: Math.max(...buyTrades.map(t => new Date(t.transaction.date).getTime())).toString()
            },
            metadata: {
              totalValue: buyTrades.reduce((sum, t) => sum + t.transaction.totalValue, 0),
              uniqueInsiders: new Set(buyTrades.map(t => t.insider.name)).size
            }
          });
        }

        if (sellTrades.length >= 2) {
          patterns.push({
            pattern: 'cluster_selling',
            confidence: Math.min(sellTrades.length / 5, 1),
            description: `${sellTrades.length} insider sales in ${ticker} within 7 days`,
            significance: sellTrades.length >= 4 ? 'high' : 'medium',
            affectedTickers: [ticker],
            timeframe: {
              start: Math.min(...sellTrades.map(t => new Date(t.transaction.date).getTime())).toString(),
              end: Math.max(...sellTrades.map(t => new Date(t.transaction.date).getTime())).toString()
            },
            metadata: {
              totalValue: sellTrades.reduce((sum, t) => sum + t.transaction.totalValue, 0),
              uniqueInsiders: new Set(sellTrades.map(t => t.insider.name)).size
            }
          });
        }
      }
    }

    return patterns;
  }

  private detectPreEarningsPatterns(trades: InsiderTrade[]): TradePattern[] {
    // Simulate earnings calendar lookup and pattern detection
    const patterns: TradePattern[] = [];
    
    // Mock: Assume earnings are typically reported quarterly
    const now = new Date();
    const possibleEarningsDates = [
      new Date(now.getFullYear(), 0, 15), // Q4 previous year
      new Date(now.getFullYear(), 3, 15), // Q1
      new Date(now.getFullYear(), 6, 15), // Q2
      new Date(now.getFullYear(), 9, 15), // Q3
    ];

    for (const trade of trades) {
      for (const earningsDate of possibleEarningsDates) {
        const tradeDaysBeforeEarnings = (earningsDate.getTime() - new Date(trade.transaction.date).getTime()) / (1000 * 60 * 60 * 24);
        
        if (tradeDaysBeforeEarnings > 0 && tradeDaysBeforeEarnings <= 14) {
          patterns.push({
            pattern: 'pre_earnings',
            confidence: 0.7,
            description: `${trade.insider.name} traded ${trade.issuer.symbol} ${Math.floor(tradeDaysBeforeEarnings)} days before estimated earnings`,
            significance: tradeDaysBeforeEarnings <= 7 ? 'high' : 'medium',
            affectedTickers: [trade.issuer.symbol],
            timeframe: {
              start: trade.transaction.date,
              end: earningsDate.toISOString().split('T')[0]
            },
            metadata: {
              daysBeforeEarnings: Math.floor(tradeDaysBeforeEarnings),
              tradeValue: trade.transaction.totalValue,
              isOfficer: trade.insider.isOfficer
            }
          });
        }
      }
    }

    return patterns;
  }

  private detectUnusualVolumePatterns(trades: InsiderTrade[]): TradePattern[] {
    const patterns: TradePattern[] = [];
    const tickerGroups = this.groupByTicker(trades);

    for (const [ticker, tickerTrades] of tickerGroups) {
      const avgVolume = tickerTrades.reduce((sum, t) => sum + t.transaction.totalValue, 0) / tickerTrades.length;
      
      const unusualTrades = tickerTrades.filter(t => t.transaction.totalValue > avgVolume * 3);
      
      if (unusualTrades.length > 0) {
        patterns.push({
          pattern: 'unusual_volume',
          confidence: 0.8,
          description: `${unusualTrades.length} unusually large trades in ${ticker}`,
          significance: 'high',
          affectedTickers: [ticker],
          timeframe: {
            start: Math.min(...unusualTrades.map(t => new Date(t.transaction.date).getTime())).toString(),
            end: Math.max(...unusualTrades.map(t => new Date(t.transaction.date).getTime())).toString()
          },
          metadata: {
            avgVolume,
            largestTrade: Math.max(...unusualTrades.map(t => t.transaction.totalValue)),
            volumeMultiplier: Math.max(...unusualTrades.map(t => t.transaction.totalValue / avgVolume))
          }
        });
      }
    }

    return patterns;
  }

  private async generateInsiderInsights(trades: InsiderTrade[]): Promise<InsiderInsight[]> {
    const insights: InsiderInsight[] = [];
    const insiderGroups = this.groupByInsider(trades);

    for (const [insiderName, insiderTrades] of insiderGroups) {
      if (insiderTrades.length < 3) continue; // Need minimum trade history

      const buyTrades = insiderTrades.filter(t => t.transaction.code === 'A');
      const sellTrades = insiderTrades.filter(t => t.transaction.code === 'D');
      
      let pattern: InsiderInsight['pattern'] = 'diversifier';
      
      if (buyTrades.length > sellTrades.length * 2) {
        pattern = 'consistently_bullish';
      } else if (sellTrades.length > buyTrades.length * 2) {
        pattern = 'consistently_bearish';
      } else if (this.isMarketTimer(insiderTrades)) {
        pattern = 'market_timer';
      }

      insights.push({
        insiderName,
        pattern,
        accuracy: 0.65 + Math.random() * 0.3, // Mock accuracy
        recentTrades: insiderTrades.length,
        avgReturn: (Math.random() - 0.5) * 0.4, // Mock return -20% to +20%
        riskProfile: this.determineRiskProfile(insiderTrades)
      });
    }

    return insights;
  }

  private async generateMarketSignals(trades: InsiderTrade[]): Promise<MarketSignal[]> {
    const signals: MarketSignal[] = [];
    const tickerGroups = this.groupByTicker(trades);

    for (const [ticker, tickerTrades] of tickerGroups) {
      const recentTrades = tickerTrades.filter(t => 
        new Date(t.filingDate) >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      );

      if (recentTrades.length === 0) continue;

      const buyValue = recentTrades
        .filter(t => t.transaction.code === 'A')
        .reduce((sum, t) => sum + t.transaction.totalValue, 0);
      
      const sellValue = recentTrades
        .filter(t => t.transaction.code === 'D')
        .reduce((sum, t) => sum + t.transaction.totalValue, 0);

      const netFlow = buyValue - sellValue;
      const totalFlow = buyValue + sellValue;

      if (totalFlow > 0) {
        const signalStrength = Math.abs(netFlow) / totalFlow;
        
        if (signalStrength > 0.3) {
          signals.push({
            signal: netFlow > 0 ? 'bullish' : 'bearish',
            strength: signalStrength,
            reason: `Net insider ${netFlow > 0 ? 'buying' : 'selling'} of $${Math.abs(netFlow).toLocaleString()} in ${ticker}`,
            supportingTrades: recentTrades.length,
            timeHorizon: 'medium'
          });
        }
      }
    }

    return signals;
  }

  private groupByTicker(trades: InsiderTrade[]): Map<string, InsiderTrade[]> {
    const groups = new Map<string, InsiderTrade[]>();
    
    for (const trade of trades) {
      const ticker = trade.issuer.symbol;
      if (!groups.has(ticker)) {
        groups.set(ticker, []);
      }
      groups.get(ticker)!.push(trade);
    }

    return groups;
  }

  private groupByInsider(trades: InsiderTrade[]): Map<string, InsiderTrade[]> {
    const groups = new Map<string, InsiderTrade[]>();
    
    for (const trade of trades) {
      const name = trade.insider.name;
      if (!groups.has(name)) {
        groups.set(name, []);
      }
      groups.get(name)!.push(trade);
    }

    return groups;
  }

  private isMarketTimer(trades: InsiderTrade[]): boolean {
    // Simplified logic to detect market timing patterns
    // Could be enhanced with actual market data correlation
    return trades.length > 5 && Math.random() > 0.7;
  }

  private determineRiskProfile(trades: InsiderTrade[]): InsiderInsight['riskProfile'] {
    const avgTradeSize = trades.reduce((sum, t) => sum + t.transaction.totalValue, 0) / trades.length;
    
    if (avgTradeSize > 1000000) return 'aggressive';
    if (avgTradeSize > 100000) return 'moderate';
    return 'conservative';
  }

  private generateMockTrades(): InsiderTrade[] {
    // Generate realistic mock data for demonstration
    const trades: InsiderTrade[] = [];
    const companies = [
      { name: 'Apple Inc.', symbol: 'AAPL', cik: '0000320193' },
      { name: 'Microsoft Corporation', symbol: 'MSFT', cik: '0000789019' },
      { name: 'NVIDIA Corporation', symbol: 'NVDA', cik: '0001045810' }
    ];

    const insiders = [
      { name: 'John Smith', title: 'CEO', isOfficer: true, isDirector: true },
      { name: 'Jane Doe', title: 'CFO', isOfficer: true, isDirector: false },
      { name: 'Bob Johnson', title: 'VP Engineering', isOfficer: true, isDirector: false }
    ];

    for (let i = 0; i < 15; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const insider = insiders[Math.floor(Math.random() * insiders.length)];
      
      trades.push({
        cik: company.cik,
        issuer: company,
        insider,
        transaction: {
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          code: Math.random() > 0.6 ? 'A' : 'D',
          shares: Math.floor(Math.random() * 10000) + 1000,
          pricePerShare: 100 + Math.random() * 200,
          totalValue: 0,
          sharesOwned: Math.floor(Math.random() * 50000)
        },
        filingDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        documentUrl: `https://example.com/filing-${i}`
      });
      
      // Calculate total value
      trades[i].transaction.totalValue = Math.round(
        trades[i].transaction.shares * trades[i].transaction.pricePerShare
      );
    }

    return trades;
  }

  private getEmptyResult(): PatternAnalysisResult {
    return {
      patterns: [],
      insiderInsights: [],
      marketSignals: [],
      summary: {
        totalTrades: 0,
        bullishSignals: 0,
        bearishSignals: 0,
        unusualActivity: 0,
        analysisDate: new Date().toISOString()
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}