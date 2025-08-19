/**
 * Base Agent Class for Insider Pulse AI Agents
 * Provides common functionality for all trading analysis agents
 */

export interface AgentConfig {
  name: string;
  enabled: boolean;
  interval?: number; // in milliseconds
  retryAttempts?: number;
  timeout?: number;
}

export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  executionTime: number;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected isRunning = false;
  protected intervalId?: NodeJS.Timeout;
  protected lastExecution?: Date;
  protected executionCount = 0;

  constructor(config: AgentConfig) {
    this.config = {
      retryAttempts: 3,
      timeout: 30000, // 30 seconds
      ...config
    };
  }

  // Abstract methods that child agents must implement
  abstract execute(): Promise<AgentResult>;
  abstract validate(data: any): boolean;

  // Core agent functionality
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn(`Agent ${this.config.name} is already running`);
      return;
    }

    this.isRunning = true;
    console.log(`🤖 Starting agent: ${this.config.name}`);

    // Execute immediately
    await this.safeExecute();

    // Set up interval execution if specified
    if (this.config.interval) {
      this.intervalId = setInterval(async () => {
        await this.safeExecute();
      }, this.config.interval);
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn(`Agent ${this.config.name} is not running`);
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log(`🛑 Stopped agent: ${this.config.name}`);
  }

  private async safeExecute(): Promise<AgentResult> {
    const startTime = Date.now();
    this.executionCount++;

    try {
      console.log(`🔄 Executing ${this.config.name} (run #${this.executionCount})`);
      
      const result = await this.executeWithTimeout();
      this.lastExecution = new Date();
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ ${this.config.name} completed in ${executionTime}ms`);
      
      return {
        ...result,
        timestamp: this.lastExecution,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ ${this.config.name} failed after ${executionTime}ms:`, errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
        executionTime
      };
    }
  }

  private async executeWithTimeout(): Promise<AgentResult> {
    return Promise.race([
      this.executeWithRetry(),
      this.createTimeoutPromise()
    ]);
  }

  private async executeWithRetry(): Promise<AgentResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= (this.config.retryAttempts || 1); attempt++) {
      try {
        if (attempt > 1) {
          console.log(`🔄 ${this.config.name} retry attempt ${attempt}/${this.config.retryAttempts}`);
          await this.delay(1000 * attempt); // Exponential backoff
        }

        return await this.execute();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (attempt === this.config.retryAttempts) {
          throw lastError;
        }
      }
    }

    throw lastError;
  }

  private createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Agent ${this.config.name} timed out after ${this.config.timeout}ms`));
      }, this.config.timeout);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Getters for agent status
  get status() {
    return {
      name: this.config.name,
      isRunning: this.isRunning,
      executionCount: this.executionCount,
      lastExecution: this.lastExecution,
      config: this.config
    };
  }

  // Utility method for logging with agent context
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.config.name}] ${message}`;
    
    switch (level) {
      case 'info':
        console.log(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'error':
        console.error(logMessage, data || '');
        break;
    }
  }
}