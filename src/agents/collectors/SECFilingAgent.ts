/**
 * SEC Filing Data Collection Agent
 * Monitors SEC EDGAR database for new insider trading filings (Form 4)
 */

import { BaseAgent, AgentConfig, AgentResult } from '../core/BaseAgent';

export interface InsiderTrade {
  cik: string;
  issuer: {
    name: string;
    symbol: string;
  };
  insider: {
    name: string;
    title: string;
    isOfficer: boolean;
    isDirector: boolean;
  };
  transaction: {
    date: string;
    code: 'A' | 'D' | 'S' | 'P'; // Acquisition, Disposition, etc.
    shares: number;
    pricePerShare: number;
    totalValue: number;
    sharesOwned: number;
  };
  filingDate: string;
  documentUrl: string;
}

export interface SECFilingResult {
  newFilings: InsiderTrade[];
  totalProcessed: number;
  lastUpdateTime: string;
}

export class SECFilingAgent extends BaseAgent {
  private readonly SEC_BASE_URL = 'https://data.sec.gov/api/xbrl/companyfacts';
  private readonly SEC_SUBMISSIONS_URL = 'https://data.sec.gov/api/xbrl/submissions';
  private readonly SEC_FILINGS_URL = 'https://www.sec.gov/cgi-bin/browse-edgar';
  
  private lastCheckedTime: Date;
  private processedFilings = new Set<string>();

  constructor(config: Partial<AgentConfig> = {}) {
    super({
      name: 'SEC Filing Collector',
      enabled: true,
      interval: 15 * 60 * 1000, // Check every 15 minutes
      ...config
    });

    this.lastCheckedTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // Start from 24h ago
  }

  async execute(): Promise<AgentResult<SECFilingResult>> {
    this.log('info', 'Starting SEC filing collection...');

    try {
      // In a real implementation, you would:
      // 1. Query SEC EDGAR API for recent Form 4 filings
      // 2. Parse XML/XBRL documents
      // 3. Extract insider trading data
      // 4. Store in database
      
      // For demo purposes, we'll simulate the process
      const mockData = await this.simulateDataCollection();

      if (mockData.newFilings.length > 0) {
        this.log('info', `Found ${mockData.newFilings.length} new insider trades`);
        
        // In production, save to database here
        await this.saveToDatabase(mockData.newFilings);
      }

      this.lastCheckedTime = new Date();

      return {
        success: true,
        data: mockData
      };

    } catch (error) {
      this.log('error', 'Failed to collect SEC filings', error);
      throw error;
    }
  }

  validate(data: SECFilingResult): boolean {
    return (
      Array.isArray(data.newFilings) &&
      typeof data.totalProcessed === 'number' &&
      typeof data.lastUpdateTime === 'string'
    );
  }

  private async simulateDataCollection(): Promise<SECFilingResult> {
    // Simulate API delay
    await this.delay(1000 + Math.random() * 2000);

    // Generate mock insider trades
    const mockTrades: InsiderTrade[] = [];
    const companies = [
      { name: 'Apple Inc.', symbol: 'AAPL', cik: '0000320193' },
      { name: 'Microsoft Corporation', symbol: 'MSFT', cik: '0000789019' },
      { name: 'NVIDIA Corporation', symbol: 'NVDA', cik: '0001045810' },
      { name: 'Tesla Inc', symbol: 'TSLA', cik: '0001318605' }
    ];

    const insiders = [
      { name: 'Timothy D. Cook', title: 'CEO', isOfficer: true, isDirector: true },
      { name: 'Luca Maestri', title: 'CFO', isOfficer: true, isDirector: false },
      { name: 'Katherine L. Adams', title: 'General Counsel', isOfficer: true, isDirector: false }
    ];

    // Randomly generate 0-3 new trades
    const numTrades = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numTrades; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const insider = insiders[Math.floor(Math.random() * insiders.length)];
      const isAcquisition = Math.random() > 0.7; // 30% chance of acquisition
      
      const shares = Math.floor(Math.random() * 50000) + 1000;
      const price = 100 + Math.random() * 200;
      
      const trade: InsiderTrade = {
        cik: company.cik,
        issuer: {
          name: company.name,
          symbol: company.symbol
        },
        insider: {
          name: insider.name,
          title: insider.title,
          isOfficer: insider.isOfficer,
          isDirector: insider.isDirector
        },
        transaction: {
          date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          code: isAcquisition ? 'A' : 'D',
          shares,
          pricePerShare: Math.round(price * 100) / 100,
          totalValue: Math.round(shares * price),
          sharesOwned: Math.floor(Math.random() * 100000) + shares
        },
        filingDate: new Date().toISOString().split('T')[0],
        documentUrl: `https://www.sec.gov/Archives/edgar/data/${company.cik}/000${company.cik}${Date.now()}.xml`
      };

      // Check if we've already processed this filing
      const filingId = `${trade.cik}-${trade.insider.name}-${trade.filingDate}`;
      if (!this.processedFilings.has(filingId)) {
        mockTrades.push(trade);
        this.processedFilings.add(filingId);
      }
    }

    return {
      newFilings: mockTrades,
      totalProcessed: numTrades,
      lastUpdateTime: new Date().toISOString()
    };
  }

  private async saveToDatabase(trades: InsiderTrade[]): Promise<void> {
    // Simulate database save operation
    this.log('info', `Saving ${trades.length} trades to database...`);
    
    for (const trade of trades) {
      // In production, you would save to your database here
      // await db.insertTrade(trade);
      this.log('info', `Saved trade: ${trade.insider.name} ${trade.transaction.code === 'A' ? 'bought' : 'sold'} ${trade.transaction.shares} shares of ${trade.issuer.symbol}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to get processed filings count
  getProcessedCount(): number {
    return this.processedFilings.size;
  }

  // Method to clear processed filings cache (for testing)
  clearCache(): void {
    this.processedFilings.clear();
    this.log('info', 'Cleared processed filings cache');
  }

  // Method to set custom check time (for testing)
  setLastCheckedTime(date: Date): void {
    this.lastCheckedTime = date;
    this.log('info', `Set last checked time to ${date.toISOString()}`);
  }
}