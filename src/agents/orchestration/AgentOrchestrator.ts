/**
 * Agent Orchestrator - Coordinates and schedules all AI agents for Insider Pulse
 * Manages dependencies, data flow, and system-wide operations
 */

import { AgentManager, AgentManagerConfig } from '../core/AgentManager';
import { SECFilingAgent } from '../collectors/SECFilingAgent';
import { TradePatternAgent } from '../analyzers/TradePatternAgent';
import { SentimentAgent } from '../analyzers/SentimentAgent';
import { AlertAgent } from '../notifiers/AlertAgent';
import { PortfolioAgent } from '../trackers/PortfolioAgent';

export interface OrchestrationConfig {
  enableAutoStart?: boolean;
  enableHealthMonitoring?: boolean;
  enableDataPipeline?: boolean;
  enableScheduling?: boolean;
  retryFailedAgents?: boolean;
}

export interface DataPipelineState {
  lastDataCollection: Date | null;
  lastAnalysis: Date | null;
  lastNotification: Date | null;
  dataFlowHealth: 'healthy' | 'degraded' | 'failed';
  pendingTasks: string[];
}

export interface SystemMetrics {
  totalAgents: number;
  runningAgents: number;
  failedAgents: number;
  totalExecutions: number;
  avgExecutionTime: number;
  systemUptime: number;
  dataFreshness: number; // minutes since last data update
  alertsGenerated: number;
  portfolioValue: number;
}

export class AgentOrchestrator {
  private manager: AgentManager;
  private agents: {
    secFiling?: SECFilingAgent;
    tradePattern?: TradePatternAgent;
    sentiment?: SentimentAgent;
    alert?: AlertAgent;
    portfolio?: PortfolioAgent;
  } = {};
  
  private config: OrchestrationConfig;
  private dataFlowScheduler?: NodeJS.Timeout;
  private healthMonitor?: NodeJS.Timeout;
  private isRunning = false;
  private startTime: Date;
  private systemMetrics: SystemMetrics = {
    totalAgents: 0,
    runningAgents: 0,
    failedAgents: 0,
    totalExecutions: 0,
    avgExecutionTime: 0,
    systemUptime: 0,
    dataFreshness: 0,
    alertsGenerated: 0,
    portfolioValue: 0
  };

  constructor(config: OrchestrationConfig = {}) {
    this.config = {
      enableAutoStart: true,
      enableHealthMonitoring: true,
      enableDataPipeline: true,
      enableScheduling: true,
      retryFailedAgents: true,
      ...config
    };

    this.manager = new AgentManager({
      maxConcurrentAgents: 8,
      healthCheckInterval: 30000, // 30 seconds
      enableLogging: true
    });

    this.startTime = new Date();
    console.log('🎼 Agent Orchestrator initialized');
  }

  /**
   * Initialize all agents and set up the system
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Insider Pulse Agent System...');

    try {
      // Create and register all agents
      await this.createAgents();
      await this.registerAgents();
      await this.setupDataPipeline();

      if (this.config.enableHealthMonitoring) {
        this.startHealthMonitoring();
      }

      if (this.config.enableAutoStart) {
        await this.startAll();
      }

      console.log('✅ Agent system initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize agent system:', error);
      throw error;
    }
  }

  /**
   * Start all agents in the correct order
   */
  async startAll(): Promise<void> {
    if (this.isRunning) {
      console.warn('Agent system is already running');
      return;
    }

    console.log('🎬 Starting all agents in orchestrated sequence...');
    
    try {
      // Start data collection agents first
      if (this.agents.secFiling) {
        await this.manager.startAgent('SEC Filing Collector');
        await this.delay(2000); // Allow SEC agent to collect initial data
      }

      // Start analysis agents
      if (this.agents.tradePattern) {
        await this.manager.startAgent('Trade Pattern Analyzer');
      }
      
      if (this.agents.sentiment) {
        await this.manager.startAgent('Sentiment Analysis Agent');
      }

      // Start tracking and notification agents
      if (this.agents.portfolio) {
        await this.manager.startAgent('Portfolio Performance Tracker');
      }

      if (this.agents.alert) {
        await this.manager.startAgent('Alert Notification Agent');
      }

      if (this.config.enableScheduling) {
        this.startDataFlowScheduler();
      }

      this.isRunning = true;
      console.log('✅ All agents started successfully');

    } catch (error) {
      console.error('❌ Failed to start agents:', error);
      throw error;
    }
  }

  /**
   * Stop all agents gracefully
   */
  async stopAll(): Promise<void> {
    if (!this.isRunning) {
      console.warn('Agent system is not running');
      return;
    }

    console.log('🛑 Stopping all agents...');

    // Stop schedulers first
    if (this.dataFlowScheduler) {
      clearInterval(this.dataFlowScheduler);
      this.dataFlowScheduler = undefined;
    }

    if (this.healthMonitor) {
      clearInterval(this.healthMonitor);
      this.healthMonitor = undefined;
    }

    // Stop all agents
    await this.manager.stopAllAgents();

    this.isRunning = false;
    console.log('✅ All agents stopped');
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus() {
    const agentStatuses = this.manager.getAgentStatuses();
    const systemStatus = this.manager.getSystemStatus();
    
    this.updateSystemMetrics(systemStatus, agentStatuses);

    return {
      isRunning: this.isRunning,
      uptime: Date.now() - this.startTime.getTime(),
      agentStatuses,
      systemHealth: systemStatus.systemHealth,
      dataFlow: this.getDataPipelineState(),
      metrics: this.systemMetrics,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Execute a complete data pipeline cycle manually
   */
  async executePipelineCycle(): Promise<void> {
    console.log('🔄 Executing manual data pipeline cycle...');

    try {
      // 1. Collect fresh SEC data
      if (this.agents.secFiling) {
        console.log('📊 Collecting SEC filing data...');
        await this.executeAgent('SEC Filing Collector');
      }

      // 2. Analyze patterns with fresh data
      if (this.agents.tradePattern) {
        console.log('🔍 Analyzing trade patterns...');
        await this.executeAgent('Trade Pattern Analyzer');
      }

      // 3. Update sentiment analysis
      if (this.agents.sentiment) {
        console.log('💭 Analyzing market sentiment...');
        await this.executeAgent('Sentiment Analysis Agent');
      }

      // 4. Update portfolio tracking
      if (this.agents.portfolio) {
        console.log('📈 Updating portfolio performance...');
        await this.executeAgent('Portfolio Performance Tracker');
      }

      // 5. Generate alerts based on fresh analysis
      if (this.agents.alert) {
        console.log('🚨 Processing alerts...');
        await this.executeAgent('Alert Notification Agent');
      }

      console.log('✅ Pipeline cycle completed successfully');

    } catch (error) {
      console.error('❌ Pipeline cycle failed:', error);
      throw error;
    }
  }

  /**
   * Restart a failed agent
   */
  async restartAgent(agentName: string): Promise<boolean> {
    console.log(`🔄 Restarting agent: ${agentName}`);

    try {
      await this.manager.stopAgent(agentName);
      await this.delay(1000);
      const success = await this.manager.startAgent(agentName);
      
      if (success) {
        console.log(`✅ Agent ${agentName} restarted successfully`);
      } else {
        console.error(`❌ Failed to restart agent ${agentName}`);
      }

      return success;
    } catch (error) {
      console.error(`❌ Error restarting agent ${agentName}:`, error);
      return false;
    }
  }

  /**
   * Get data freshness information
   */
  getDataFreshness() {
    // In production, check actual data timestamps
    return {
      secFilings: '2 minutes ago',
      patterns: '5 minutes ago', 
      sentiment: '3 minutes ago',
      portfolios: '1 minute ago',
      alerts: '30 seconds ago'
    };
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    await this.stopAll();
    await this.manager.destroy();
    console.log('🧹 Agent Orchestrator destroyed');
  }

  private async createAgents(): Promise<void> {
    console.log('🏗️ Creating agents...');

    this.agents.secFiling = new SECFilingAgent({
      interval: 15 * 60 * 1000 // 15 minutes
    });

    this.agents.tradePattern = new TradePatternAgent({
      interval: 30 * 60 * 1000 // 30 minutes
    });

    this.agents.sentiment = new SentimentAgent({
      interval: 20 * 60 * 1000 // 20 minutes
    });

    this.agents.portfolio = new PortfolioAgent({
      interval: 60 * 60 * 1000 // 1 hour
    });

    this.agents.alert = new AlertAgent({
      interval: 5 * 60 * 1000 // 5 minutes
    });

    console.log('✅ All agents created');
  }

  private async registerAgents(): Promise<void> {
    console.log('📝 Registering agents with manager...');

    Object.values(this.agents).forEach(agent => {
      if (agent) {
        this.manager.registerAgent(agent);
      }
    });

    console.log('✅ All agents registered');
  }

  private async setupDataPipeline(): Promise<void> {
    if (!this.config.enableDataPipeline) return;

    console.log('🔗 Setting up data pipeline...');
    
    // In production, this would set up actual data flow between agents
    // For now, we rely on the scheduling system to coordinate execution
    
    console.log('✅ Data pipeline configured');
  }

  private startDataFlowScheduler(): void {
    console.log('⏰ Starting data flow scheduler...');

    // Execute a full pipeline cycle every hour
    this.dataFlowScheduler = setInterval(async () => {
      console.log('⏰ Scheduled pipeline execution starting...');
      
      try {
        await this.executePipelineCycle();
      } catch (error) {
        console.error('❌ Scheduled pipeline execution failed:', error);
        
        if (this.config.retryFailedAgents) {
          console.log('🔄 Attempting to restart failed agents...');
          await this.restartFailedAgents();
        }
      }
    }, 60 * 60 * 1000); // Every hour
  }

  private startHealthMonitoring(): void {
    console.log('🏥 Starting health monitoring...');

    this.healthMonitor = setInterval(() => {
      const status = this.getSystemStatus();
      
      if (status.systemHealth === 'critical') {
        console.error('🚨 CRITICAL: System health is critical, attempting recovery...');
        this.attemptSystemRecovery();
      } else if (status.metrics.failedAgents > 0) {
        console.warn(`⚠️ WARNING: ${status.metrics.failedAgents} agents have failed`);
        
        if (this.config.retryFailedAgents) {
          this.restartFailedAgents();
        }
      }
    }, 30000); // Every 30 seconds
  }

  private async restartFailedAgents(): Promise<void> {
    const statuses = this.manager.getAgentStatuses();
    const failedAgents = statuses.filter(s => s.health === 'error');

    for (const agent of failedAgents) {
      await this.restartAgent(agent.name);
      await this.delay(2000); // Wait between restarts
    }
  }

  private async attemptSystemRecovery(): Promise<void> {
    console.log('🔄 Attempting system recovery...');

    try {
      await this.stopAll();
      await this.delay(5000);
      await this.startAll();
      console.log('✅ System recovery completed');
    } catch (error) {
      console.error('❌ System recovery failed:', error);
    }
  }

  private async executeAgent(agentName: string): Promise<void> {
    // In production, this would trigger a single execution of the agent
    // For now, we simulate by getting agent status
    const agent = this.manager.getAgentStatus(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }
    
    await this.delay(500 + Math.random() * 1500); // Simulate execution time
  }

  private getDataPipelineState(): DataPipelineState {
    return {
      lastDataCollection: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      lastAnalysis: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago  
      lastNotification: new Date(Date.now() - 30 * 1000), // 30 seconds ago
      dataFlowHealth: 'healthy',
      pendingTasks: []
    };
  }

  private updateSystemMetrics(systemStatus: any, agentStatuses: any[]): void {
    this.systemMetrics = {
      totalAgents: agentStatuses.length,
      runningAgents: agentStatuses.filter(a => a.isRunning).length,
      failedAgents: agentStatuses.filter(a => a.health === 'error').length,
      totalExecutions: agentStatuses.reduce((sum, a) => sum + a.executionCount, 0),
      avgExecutionTime: 1500, // Mock average
      systemUptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      dataFreshness: 2, // Mock: 2 minutes
      alertsGenerated: 15, // Mock count
      portfolioValue: 487500 // Mock total portfolio value
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}