/**
 * Insider Pulse AI Agents - Main Export
 * Complete AI agent system for insider trading analysis and automation
 */

// Core agent infrastructure
export { BaseAgent } from './core/BaseAgent';
export { AgentManager } from './core/AgentManager';
export { AgentOrchestrator } from './orchestration/AgentOrchestrator';

// Data collection agents
export { SECFilingAgent } from './collectors/SECFilingAgent';

// Analysis agents
export { TradePatternAgent } from './analyzers/TradePatternAgent';
export { SentimentAgent } from './analyzers/SentimentAgent';

// Notification agents
export { AlertAgent } from './notifiers/AlertAgent';

// Tracking agents  
export { PortfolioAgent } from './trackers/PortfolioAgent';

// Types and interfaces
export type { AgentConfig, AgentResult } from './core/BaseAgent';
export type { AgentManagerConfig, AgentStatus } from './core/AgentManager';
export type { 
  InsiderTrade, 
  SECFilingResult 
} from './collectors/SECFilingAgent';
export type { 
  TradePattern, 
  InsiderInsight, 
  MarketSignal, 
  PatternAnalysisResult 
} from './analyzers/TradePatternAgent';
export type { 
  NewsArticle, 
  SocialMediaPost, 
  SentimentAnalysis, 
  MarketMood, 
  SentimentResult 
} from './analyzers/SentimentAgent';
export type { 
  AlertRule, 
  NotificationChannel, 
  Alert, 
  AlertResult 
} from './notifiers/AlertAgent';
export type { 
  Position, 
  Transaction, 
  Portfolio, 
  InsiderPerformanceMetrics, 
  PortfolioResult 
} from './trackers/PortfolioAgent';

/**
 * Quick start helper function to initialize the complete agent system
 */
export async function initializeInsiderPulseAgents() {
  const orchestrator = new AgentOrchestrator({
    enableAutoStart: true,
    enableHealthMonitoring: true,
    enableDataPipeline: true,
    enableScheduling: true,
    retryFailedAgents: true
  });

  await orchestrator.initialize();
  
  return {
    orchestrator,
    status: orchestrator.getSystemStatus(),
    
    // Helper methods
    async stop() {
      await orchestrator.stopAll();
    },
    
    async restart() {
      await orchestrator.stopAll();
      await orchestrator.startAll();
    },
    
    async runPipeline() {
      await orchestrator.executePipelineCycle();
    },
    
    getHealth() {
      return orchestrator.getSystemStatus();
    },
    
    getFreshness() {
      return orchestrator.getDataFreshness();
    }
  };
}

/**
 * Agent system constants
 */
export const AGENT_CONSTANTS = {
  DEFAULT_INTERVALS: {
    SEC_FILING: 15 * 60 * 1000,        // 15 minutes
    TRADE_PATTERN: 30 * 60 * 1000,     // 30 minutes  
    SENTIMENT: 20 * 60 * 1000,         // 20 minutes
    PORTFOLIO: 60 * 60 * 1000,         // 1 hour
    ALERT: 5 * 60 * 1000               // 5 minutes
  },
  
  HEALTH_STATES: ['healthy', 'warning', 'error'] as const,
  
  AGENT_NAMES: {
    SEC_FILING: 'SEC Filing Collector',
    TRADE_PATTERN: 'Trade Pattern Analyzer', 
    SENTIMENT: 'Sentiment Analysis Agent',
    ALERT: 'Alert Notification Agent',
    PORTFOLIO: 'Portfolio Performance Tracker'
  } as const
};

/**
 * Usage example:
 * 
 * ```typescript
 * import { initializeInsiderPulseAgents } from './agents';
 * 
 * async function main() {
 *   const system = await initializeInsiderPulseAgents();
 *   
 *   // Monitor system health
 *   console.log('System Status:', system.getHealth());
 *   
 *   // Run manual pipeline cycle
 *   await system.runPipeline();
 *   
 *   // Stop when done
 *   await system.stop();
 * }
 * ```
 */