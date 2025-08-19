/**
 * Agent Manager - Orchestrates all AI agents for Insider Pulse
 * Handles agent lifecycle, monitoring, and coordination
 */

import { BaseAgent, AgentResult } from './BaseAgent';

export interface AgentManagerConfig {
  maxConcurrentAgents?: number;
  healthCheckInterval?: number;
  enableLogging?: boolean;
}

export interface AgentStatus {
  name: string;
  isRunning: boolean;
  executionCount: number;
  lastExecution?: Date;
  lastResult?: AgentResult;
  health: 'healthy' | 'warning' | 'error';
}

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
  private agentResults: Map<string, AgentResult[]> = new Map();
  private config: AgentManagerConfig;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config: AgentManagerConfig = {}) {
    this.config = {
      maxConcurrentAgents: 10,
      healthCheckInterval: 60000, // 1 minute
      enableLogging: true,
      ...config
    };

    if (this.config.enableLogging) {
      this.startHealthCheck();
    }
  }

  /**
   * Register an agent with the manager
   */
  registerAgent(agent: BaseAgent): void {
    const name = agent.status.name;
    
    if (this.agents.has(name)) {
      console.warn(`Agent ${name} is already registered, replacing...`);
    }

    this.agents.set(name, agent);
    this.agentResults.set(name, []);
    
    console.log(`📝 Registered agent: ${name}`);
  }

  /**
   * Start a specific agent
   */
  async startAgent(name: string): Promise<boolean> {
    const agent = this.agents.get(name);
    if (!agent) {
      console.error(`Agent ${name} not found`);
      return false;
    }

    try {
      await agent.start();
      return true;
    } catch (error) {
      console.error(`Failed to start agent ${name}:`, error);
      return false;
    }
  }

  /**
   * Stop a specific agent
   */
  async stopAgent(name: string): Promise<boolean> {
    const agent = this.agents.get(name);
    if (!agent) {
      console.error(`Agent ${name} not found`);
      return false;
    }

    try {
      await agent.stop();
      return true;
    } catch (error) {
      console.error(`Failed to stop agent ${name}:`, error);
      return false;
    }
  }

  /**
   * Start all registered agents
   */
  async startAllAgents(): Promise<void> {
    const runningCount = Array.from(this.agents.values())
      .filter(agent => agent.status.isRunning).length;

    if (runningCount >= (this.config.maxConcurrentAgents || 10)) {
      console.warn(`Cannot start agents: max concurrent limit (${this.config.maxConcurrentAgents}) reached`);
      return;
    }

    console.log(`🚀 Starting ${this.agents.size} agents...`);

    const startPromises = Array.from(this.agents.entries()).map(
      async ([name, agent]) => {
        try {
          await agent.start();
        } catch (error) {
          console.error(`Failed to start agent ${name}:`, error);
        }
      }
    );

    await Promise.allSettled(startPromises);
    console.log(`✅ Agent startup complete`);
  }

  /**
   * Stop all running agents
   */
  async stopAllAgents(): Promise<void> {
    console.log(`🛑 Stopping all agents...`);

    const stopPromises = Array.from(this.agents.values())
      .filter(agent => agent.status.isRunning)
      .map(agent => agent.stop());

    await Promise.allSettled(stopPromises);
    console.log(`✅ All agents stopped`);
  }

  /**
   * Get status of all agents
   */
  getAgentStatuses(): AgentStatus[] {
    return Array.from(this.agents.entries()).map(([name, agent]) => {
      const results = this.agentResults.get(name) || [];
      const lastResult = results[results.length - 1];
      
      return {
        ...agent.status,
        lastResult,
        health: this.determineAgentHealth(name, lastResult)
      };
    });
  }

  /**
   * Get specific agent status
   */
  getAgentStatus(name: string): AgentStatus | null {
    const agent = this.agents.get(name);
    if (!agent) return null;

    const results = this.agentResults.get(name) || [];
    const lastResult = results[results.length - 1];

    return {
      ...agent.status,
      lastResult,
      health: this.determineAgentHealth(name, lastResult)
    };
  }

  /**
   * Get recent results for an agent
   */
  getAgentResults(name: string, limit = 10): AgentResult[] {
    const results = this.agentResults.get(name) || [];
    return results.slice(-limit);
  }

  /**
   * Store agent execution result
   */
  storeResult(agentName: string, result: AgentResult): void {
    const results = this.agentResults.get(agentName) || [];
    results.push(result);
    
    // Keep only last 100 results per agent
    if (results.length > 100) {
      results.shift();
    }
    
    this.agentResults.set(agentName, results);
  }

  /**
   * Get system overview
   */
  getSystemStatus() {
    const agents = this.getAgentStatuses();
    const running = agents.filter(a => a.isRunning).length;
    const healthy = agents.filter(a => a.health === 'healthy').length;
    const errors = agents.filter(a => a.health === 'error').length;

    return {
      totalAgents: agents.length,
      runningAgents: running,
      healthyAgents: healthy,
      agentsWithErrors: errors,
      systemHealth: errors === 0 ? 'healthy' : errors < agents.length / 2 ? 'warning' : 'critical',
      uptime: process.uptime(),
      timestamp: new Date()
    };
  }

  private determineAgentHealth(name: string, lastResult?: AgentResult): 'healthy' | 'warning' | 'error' {
    if (!lastResult) return 'warning';
    
    if (!lastResult.success) return 'error';
    
    // Check if agent hasn't run recently (based on expected interval)
    const agent = this.agents.get(name);
    if (agent?.status.config.interval) {
      const timeSinceLastRun = Date.now() - lastResult.timestamp.getTime();
      if (timeSinceLastRun > agent.status.config.interval * 2) {
        return 'warning';
      }
    }

    return 'healthy';
  }

  private startHealthCheck(): void {
    if (this.healthCheckInterval) return;

    this.healthCheckInterval = setInterval(() => {
      const status = this.getSystemStatus();
      
      if (this.config.enableLogging) {
        console.log(`🏥 System Health Check:`, {
          running: `${status.runningAgents}/${status.totalAgents}`,
          health: status.systemHealth,
          uptime: `${Math.floor(status.uptime / 60)}m`
        });
      }

      // Alert on system issues
      if (status.systemHealth === 'critical') {
        console.error('🚨 CRITICAL: Multiple agents are failing');
      } else if (status.agentsWithErrors > 0) {
        console.warn(`⚠️ WARNING: ${status.agentsWithErrors} agents have errors`);
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    await this.stopAllAgents();
    this.agents.clear();
    this.agentResults.clear();
    
    console.log('🧹 Agent Manager destroyed');
  }
}