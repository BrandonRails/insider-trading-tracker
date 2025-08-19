/**
 * Alert Notification Agent
 * Monitors trading patterns and sends notifications based on user preferences
 */

import { BaseAgent, AgentConfig, AgentResult } from '../core/BaseAgent';
import { TradePattern, MarketSignal } from '../analyzers/TradePatternAgent';
import { InsiderTrade } from '../collectors/SECFilingAgent';

export interface AlertRule {
  id: string;
  userId: string;
  name: string;
  enabled: boolean;
  type: 'ticker_watch' | 'insider_follow' | 'volume_threshold' | 'pattern_detected' | 'market_signal';
  conditions: {
    tickers?: string[];
    insiders?: string[];
    minVolume?: number;
    patterns?: TradePattern['pattern'][];
    signalStrength?: number;
  };
  channels: NotificationChannel[];
  createdAt: string;
  lastTriggered?: string;
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'webhook' | 'push' | 'slack';
  config: {
    email?: string;
    phone?: string;
    webhookUrl?: string;
    pushToken?: string;
    slackChannel?: string;
  };
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  userId: string;
  type: AlertRule['type'];
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: {
    trades?: InsiderTrade[];
    patterns?: TradePattern[];
    signals?: MarketSignal[];
  };
  triggeredAt: string;
  sentAt?: string;
  channels: string[];
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
}

export interface AlertResult {
  alertsGenerated: number;
  alertsSent: number;
  alertsFailed: number;
  rulesProcessed: number;
  summary: {
    highPriorityAlerts: number;
    uniqueUsersNotified: number;
    processingTime: number;
  };
}

export class AlertAgent extends BaseAgent {
  private alertRules: Map<string, AlertRule> = new Map();
  private pendingAlerts: Alert[] = [];
  private alertHistory: Alert[] = [];

  constructor(config: Partial<AgentConfig> = {}) {
    super({
      name: 'Alert Notification Agent',
      enabled: true,
      interval: 5 * 60 * 1000, // Check every 5 minutes
      ...config
    });

    // Initialize with some mock alert rules
    this.initializeMockRules();
  }

  async execute(): Promise<AgentResult<AlertResult>> {
    this.log('info', 'Processing alert notifications...');

    try {
      const startTime = Date.now();

      // Get latest trading data and patterns
      const recentTrades = await this.getRecentTrades();
      const recentPatterns = await this.getRecentPatterns();
      const recentSignals = await this.getRecentSignals();

      let alertsGenerated = 0;
      let alertsSent = 0;
      let alertsFailed = 0;
      const processedRules = new Set<string>();
      const notifiedUsers = new Set<string>();

      // Process each alert rule
      for (const [ruleId, rule] of this.alertRules) {
        if (!rule.enabled) continue;

        processedRules.add(ruleId);

        const matchingAlerts = await this.checkRule(
          rule,
          recentTrades,
          recentPatterns,
          recentSignals
        );

        for (const alert of matchingAlerts) {
          alertsGenerated++;
          notifiedUsers.add(alert.userId);

          // Send the alert through configured channels
          const success = await this.sendAlert(alert);
          if (success) {
            alertsSent++;
            alert.status = 'sent';
            alert.sentAt = new Date().toISOString();
          } else {
            alertsFailed++;
            alert.status = 'failed';
          }

          // Store in history
          this.alertHistory.push(alert);
          
          // Update rule last triggered time
          rule.lastTriggered = new Date().toISOString();
        }
      }

      // Clean up old alerts (keep last 1000)
      if (this.alertHistory.length > 1000) {
        this.alertHistory = this.alertHistory.slice(-1000);
      }

      const processingTime = Date.now() - startTime;
      
      const result: AlertResult = {
        alertsGenerated,
        alertsSent,
        alertsFailed,
        rulesProcessed: processedRules.size,
        summary: {
          highPriorityAlerts: this.alertHistory.filter(a => 
            a.severity === 'high' || a.severity === 'critical'
          ).length,
          uniqueUsersNotified: notifiedUsers.size,
          processingTime
        }
      };

      this.log('info', `Alert processing complete: ${alertsSent}/${alertsGenerated} alerts sent`);
      return {
        success: true,
        data: result
      };

    } catch (error) {
      this.log('error', 'Alert processing failed', error);
      throw error;
    }
  }

  validate(data: AlertResult): boolean {
    return (
      typeof data.alertsGenerated === 'number' &&
      typeof data.alertsSent === 'number' &&
      typeof data.alertsFailed === 'number' &&
      typeof data.rulesProcessed === 'number' &&
      data.summary &&
      typeof data.summary.processingTime === 'number'
    );
  }

  private async checkRule(
    rule: AlertRule,
    trades: InsiderTrade[],
    patterns: TradePattern[],
    signals: MarketSignal[]
  ): Promise<Alert[]> {
    const alerts: Alert[] = [];

    switch (rule.type) {
      case 'ticker_watch':
        alerts.push(...await this.checkTickerWatch(rule, trades));
        break;
      
      case 'insider_follow':
        alerts.push(...await this.checkInsiderFollow(rule, trades));
        break;
      
      case 'volume_threshold':
        alerts.push(...await this.checkVolumeThreshold(rule, trades));
        break;
      
      case 'pattern_detected':
        alerts.push(...await this.checkPatternDetected(rule, patterns));
        break;
      
      case 'market_signal':
        alerts.push(...await this.checkMarketSignal(rule, signals));
        break;
    }

    return alerts;
  }

  private async checkTickerWatch(rule: AlertRule, trades: InsiderTrade[]): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const watchedTickers = rule.conditions.tickers || [];

    for (const ticker of watchedTickers) {
      const tickerTrades = trades.filter(t => t.issuer.symbol === ticker);
      
      if (tickerTrades.length > 0) {
        alerts.push({
          id: this.generateAlertId(),
          ruleId: rule.id,
          userId: rule.userId,
          type: 'ticker_watch',
          title: `New insider activity in ${ticker}`,
          message: `${tickerTrades.length} new insider trades detected in ${ticker}`,
          severity: tickerTrades.length > 3 ? 'high' : 'medium',
          data: { trades: tickerTrades },
          triggeredAt: new Date().toISOString(),
          channels: rule.channels.filter(c => c.enabled).map(c => c.type),
          status: 'pending'
        });
      }
    }

    return alerts;
  }

  private async checkInsiderFollow(rule: AlertRule, trades: InsiderTrade[]): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const watchedInsiders = rule.conditions.insiders || [];

    for (const insiderName of watchedInsiders) {
      const insiderTrades = trades.filter(t => t.insider.name === insiderName);
      
      if (insiderTrades.length > 0) {
        const totalValue = insiderTrades.reduce((sum, t) => sum + t.transaction.totalValue, 0);
        
        alerts.push({
          id: this.generateAlertId(),
          ruleId: rule.id,
          userId: rule.userId,
          type: 'insider_follow',
          title: `${insiderName} made new trades`,
          message: `${insiderName} executed ${insiderTrades.length} trades worth $${totalValue.toLocaleString()}`,
          severity: totalValue > 1000000 ? 'high' : 'medium',
          data: { trades: insiderTrades },
          triggeredAt: new Date().toISOString(),
          channels: rule.channels.filter(c => c.enabled).map(c => c.type),
          status: 'pending'
        });
      }
    }

    return alerts;
  }

  private async checkVolumeThreshold(rule: AlertRule, trades: InsiderTrade[]): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const minVolume = rule.conditions.minVolume || 0;

    const largeTrades = trades.filter(t => t.transaction.totalValue >= minVolume);
    
    if (largeTrades.length > 0) {
      const totalValue = largeTrades.reduce((sum, t) => sum + t.transaction.totalValue, 0);
      
      alerts.push({
        id: this.generateAlertId(),
        ruleId: rule.id,
        userId: rule.userId,
        type: 'volume_threshold',
        title: `Large insider trades detected`,
        message: `${largeTrades.length} trades above $${minVolume.toLocaleString()} threshold (total: $${totalValue.toLocaleString()})`,
        severity: totalValue > 10000000 ? 'critical' : 'high',
        data: { trades: largeTrades },
        triggeredAt: new Date().toISOString(),
        channels: rule.channels.filter(c => c.enabled).map(c => c.type),
        status: 'pending'
      });
    }

    return alerts;
  }

  private async checkPatternDetected(rule: AlertRule, patterns: TradePattern[]): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const watchedPatterns = rule.conditions.patterns || [];

    const matchingPatterns = patterns.filter(p => watchedPatterns.includes(p.pattern));
    
    if (matchingPatterns.length > 0) {
      for (const pattern of matchingPatterns) {
        alerts.push({
          id: this.generateAlertId(),
          ruleId: rule.id,
          userId: rule.userId,
          type: 'pattern_detected',
          title: `Trading pattern detected: ${pattern.pattern.replace('_', ' ')}`,
          message: pattern.description,
          severity: pattern.significance === 'high' ? 'high' : 'medium',
          data: { patterns: [pattern] },
          triggeredAt: new Date().toISOString(),
          channels: rule.channels.filter(c => c.enabled).map(c => c.type),
          status: 'pending'
        });
      }
    }

    return alerts;
  }

  private async checkMarketSignal(rule: AlertRule, signals: MarketSignal[]): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const minStrength = rule.conditions.signalStrength || 0.5;

    const strongSignals = signals.filter(s => s.strength >= minStrength);
    
    if (strongSignals.length > 0) {
      for (const signal of strongSignals) {
        alerts.push({
          id: this.generateAlertId(),
          ruleId: rule.id,
          userId: rule.userId,
          type: 'market_signal',
          title: `${signal.signal.toUpperCase()} market signal detected`,
          message: `${signal.reason} (Strength: ${Math.round(signal.strength * 100)}%)`,
          severity: signal.strength > 0.8 ? 'high' : 'medium',
          data: { signals: [signal] },
          triggeredAt: new Date().toISOString(),
          channels: rule.channels.filter(c => c.enabled).map(c => c.type),
          status: 'pending'
        });
      }
    }

    return alerts;
  }

  private async sendAlert(alert: Alert): Promise<boolean> {
    this.log('info', `Sending alert: ${alert.title}`);

    try {
      // In production, implement actual notification sending
      for (const channelType of alert.channels) {
        await this.sendToChannel(alert, channelType);
      }
      
      return true;
    } catch (error) {
      this.log('error', `Failed to send alert ${alert.id}`, error);
      return false;
    }
  }

  private async sendToChannel(alert: Alert, channelType: string): Promise<void> {
    // Simulate sending delay
    await this.delay(100);

    switch (channelType) {
      case 'email':
        this.log('info', `📧 Email sent for alert: ${alert.title}`);
        break;
      case 'sms':
        this.log('info', `📱 SMS sent for alert: ${alert.title}`);
        break;
      case 'webhook':
        this.log('info', `🔗 Webhook called for alert: ${alert.title}`);
        break;
      case 'push':
        this.log('info', `🔔 Push notification sent for alert: ${alert.title}`);
        break;
      case 'slack':
        this.log('info', `💬 Slack message sent for alert: ${alert.title}`);
        break;
    }
  }

  private async getRecentTrades(): Promise<InsiderTrade[]> {
    // In production, fetch from database or SEC agent results
    // For demo, return mock data
    return [
      {
        cik: '0000320193',
        issuer: { name: 'Apple Inc.', symbol: 'AAPL' },
        insider: { name: 'Tim Cook', title: 'CEO', isOfficer: true, isDirector: true },
        transaction: {
          date: new Date().toISOString().split('T')[0],
          code: 'D',
          shares: 50000,
          pricePerShare: 190.50,
          totalValue: 9525000,
          sharesOwned: 3200000
        },
        filingDate: new Date().toISOString().split('T')[0],
        documentUrl: 'https://example.com/filing'
      }
    ];
  }

  private async getRecentPatterns(): Promise<TradePattern[]> {
    // In production, fetch from pattern analysis agent
    return [
      {
        pattern: 'cluster_buying',
        confidence: 0.85,
        description: '4 insider purchases in NVDA within 5 days',
        significance: 'high',
        affectedTickers: ['NVDA'],
        timeframe: {
          start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        },
        metadata: { totalValue: 12500000, uniqueInsiders: 3 }
      }
    ];
  }

  private async getRecentSignals(): Promise<MarketSignal[]> {
    // In production, fetch from pattern analysis agent
    return [
      {
        signal: 'bullish',
        strength: 0.75,
        reason: 'Net insider buying of $15.2M across tech sector',
        supportingTrades: 8,
        timeHorizon: 'medium'
      }
    ];
  }

  private initializeMockRules(): void {
    // Mock alert rules for demonstration
    const rule1: AlertRule = {
      id: 'rule-1',
      userId: 'user-1',
      name: 'AAPL Insider Watch',
      enabled: true,
      type: 'ticker_watch',
      conditions: { tickers: ['AAPL', 'MSFT', 'NVDA'] },
      channels: [
        { type: 'email', config: { email: 'user@example.com' }, enabled: true },
        { type: 'push', config: { pushToken: 'token123' }, enabled: true }
      ],
      createdAt: new Date().toISOString()
    };

    const rule2: AlertRule = {
      id: 'rule-2',
      userId: 'user-1',
      name: 'Large Volume Alert',
      enabled: true,
      type: 'volume_threshold',
      conditions: { minVolume: 5000000 },
      channels: [
        { type: 'webhook', config: { webhookUrl: 'https://example.com/webhook' }, enabled: true }
      ],
      createdAt: new Date().toISOString()
    };

    this.alertRules.set(rule1.id, rule1);
    this.alertRules.set(rule2.id, rule2);
  }

  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for rule management
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    this.log('info', `Added alert rule: ${rule.name}`);
  }

  removeAlertRule(ruleId: string): boolean {
    const deleted = this.alertRules.delete(ruleId);
    if (deleted) {
      this.log('info', `Removed alert rule: ${ruleId}`);
    }
    return deleted;
  }

  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  getAlertHistory(limit = 50): Alert[] {
    return this.alertHistory.slice(-limit);
  }
}