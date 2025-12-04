/**
 * VAHAN Client
 * Provider-agnostic client with adapters for Parivahan, Surepass, Backup
 * Implements rate-limiting, exponential backoff, circuit breaker
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

export type VahanProvider = 'PARIVAHAN' | 'SUREPASS' | 'BACKUP';

export interface VahanClientConfig {
  parivahan?: {
    baseUrl?: string;
    apiKey?: string;
    timeout?: number;
  };
  surepass?: {
    baseUrl?: string;
    apiKey?: string;
    timeout?: number;
  };
  backup?: {
    baseUrl?: string;
    apiKey?: string;
    timeout?: number;
  };
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
  };
  retry?: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
  };
  circuitBreaker?: {
    failureThreshold?: number;
    resetTimeoutMs?: number;
  };
}

export interface VahanResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider: VahanProvider;
  txnId?: string;
  timestamp: Date;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailureTime?: Date;
  isOpen: boolean;
}

/**
 * VAHAN Client with provider failover
 */
export class VahanClient {
  private config: Required<VahanClientConfig>;
  private clients: Map<VahanProvider, AxiosInstance> = new Map();
  private circuitBreakers: Map<VahanProvider, CircuitBreakerState> = new Map();
  private rateLimitQueue: Array<{ provider: VahanProvider; resolve: () => void }> = [];
  private requestCounts: Map<VahanProvider, { count: number; resetAt: Date }> = new Map();

  constructor(config: VahanClientConfig = {}) {
    this.config = {
      parivahan: {
        baseUrl: config.parivahan?.baseUrl || 'https://parivahan.gov.in/api',
        apiKey: config.parivahan?.apiKey || '',
        timeout: config.parivahan?.timeout || 30000,
      },
      surepass: {
        baseUrl: config.surepass?.baseUrl || 'https://api.surepass.io',
        apiKey: config.surepass?.apiKey || '',
        timeout: config.surepass?.timeout || 30000,
      },
      backup: {
        baseUrl: config.backup?.baseUrl || 'https://api.backup-provider.com',
        apiKey: config.backup?.apiKey || '',
        timeout: config.backup?.timeout || 30000,
      },
      rateLimit: {
        requestsPerMinute: config.rateLimit?.requestsPerMinute || 60,
        requestsPerHour: config.rateLimit?.requestsPerHour || 1000,
      },
      retry: {
        maxRetries: config.retry?.maxRetries || 3,
        initialDelayMs: config.retry?.initialDelayMs || 1000,
        maxDelayMs: config.retry?.maxDelayMs || 30000,
      },
      circuitBreaker: {
        failureThreshold: config.circuitBreaker?.failureThreshold || 5,
        resetTimeoutMs: config.circuitBreaker?.resetTimeoutMs || 60000,
      },
    };

    this.initializeClients();
    this.initializeCircuitBreakers();
  }

  private initializeClients(): void {
    // Parivahan client
    this.clients.set('PARIVAHAN', axios.create({
      baseURL: this.config.parivahan.baseUrl,
      timeout: this.config.parivahan.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.parivahan.apiKey}`,
        'Content-Type': 'application/json',
      },
    }));

    // Surepass client
    this.clients.set('SUREPASS', axios.create({
      baseURL: this.config.surepass.baseUrl,
      timeout: this.config.surepass.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.surepass.apiKey}`,
        'Content-Type': 'application/json',
      },
    }));

    // Backup client
    this.clients.set('BACKUP', axios.create({
      baseURL: this.config.backup.baseUrl,
      timeout: this.config.backup.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.backup.apiKey}`,
        'Content-Type': 'application/json',
      },
    }));
  }

  private initializeCircuitBreakers(): void {
    this.circuitBreakers.set('PARIVAHAN', { failures: 0, isOpen: false });
    this.circuitBreakers.set('SUREPASS', { failures: 0, isOpen: false });
    this.circuitBreakers.set('BACKUP', { failures: 0, isOpen: false });
  }

  /**
   * Check if circuit breaker is open for provider
   */
  private isCircuitBreakerOpen(provider: VahanProvider): boolean {
    const breaker = this.circuitBreakers.get(provider);
    if (!breaker) return false;

    if (breaker.isOpen) {
      const resetTimeout = this.config.circuitBreaker.resetTimeoutMs;
      if (breaker.lastFailureTime) {
        const timeSinceFailure = Date.now() - breaker.lastFailureTime.getTime();
        if (timeSinceFailure > resetTimeout) {
          // Reset circuit breaker
          breaker.isOpen = false;
          breaker.failures = 0;
          return false;
        }
      }
      return true;
    }

    return false;
  }

  /**
   * Record circuit breaker failure
   */
  private recordFailure(provider: VahanProvider): void {
    const breaker = this.circuitBreakers.get(provider);
    if (!breaker) return;

    breaker.failures++;
    breaker.lastFailureTime = new Date();

    if (breaker.failures >= this.config.circuitBreaker.failureThreshold) {
      breaker.isOpen = true;
    }
  }

  /**
   * Record circuit breaker success
   */
  private recordSuccess(provider: VahanProvider): void {
    const breaker = this.circuitBreakers.get(provider);
    if (!breaker) return;

    breaker.failures = 0;
    breaker.isOpen = false;
  }

  /**
   * Check rate limit for provider
   */
  private async checkRateLimit(provider: VahanProvider): Promise<void> {
    const now = new Date();
    const key = `${provider}_${now.getMinutes()}`;
    const count = this.requestCounts.get(provider);

    if (!count || count.resetAt < now) {
      this.requestCounts.set(provider, { count: 1, resetAt: new Date(now.getTime() + 60000) });
      return;
    }

    if (count.count >= this.config.rateLimit.requestsPerMinute) {
      // Wait until next minute
      const waitTime = count.resetAt.getTime() - now.getTime();
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCounts.set(provider, { count: 1, resetAt: new Date(now.getTime() + 60000) });
      return;
    }

    count.count++;
  }

  /**
   * Exponential backoff delay
   */
  private async exponentialBackoff(attempt: number): Promise<void> {
    const delay = Math.min(
      this.config.retry.initialDelayMs * Math.pow(2, attempt),
      this.config.retry.maxDelayMs
    );
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Fetch vehicle data from provider
   */
  private async fetchFromProvider(
    provider: VahanProvider,
    rcNumber: string,
    attempt: number = 0
  ): Promise<VahanResponse> {
    if (this.isCircuitBreakerOpen(provider)) {
      throw new Error(`Circuit breaker open for ${provider}`);
    }

    await this.checkRateLimit(provider);

    const client = this.clients.get(provider);
    if (!client) {
      throw new Error(`No client configured for ${provider}`);
    }

    try {
      // Mock implementation - replace with actual API call
      // const response = await client.post('/vahan/verify', { rc_number: rcNumber });
      // For now, return mock data
      const mockResponse = {
        data: {
          rc_number: rcNumber,
          provider,
          txn_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          // ... other fields
        },
      };

      this.recordSuccess(provider);

      return {
        success: true,
        data: mockResponse.data,
        provider,
        txnId: mockResponse.data.txn_id,
        timestamp: new Date(),
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      this.recordFailure(provider);

      if (attempt < this.config.retry.maxRetries) {
        await this.exponentialBackoff(attempt);
        return this.fetchFromProvider(provider, rcNumber, attempt + 1);
      }

      return {
        success: false,
        error: axiosError.message || 'Unknown error',
        provider,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Verify RC with failover: Parivahan → Surepass → Backup
   */
  async verifyRC(rcNumber: string): Promise<VahanResponse> {
    const providers: VahanProvider[] = ['PARIVAHAN', 'SUREPASS', 'BACKUP'];

    for (const provider of providers) {
      try {
        const response = await this.fetchFromProvider(provider, rcNumber);
        if (response.success) {
          return response;
        }
      } catch (error) {
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    return {
      success: false,
      error: 'All providers failed',
      provider: 'BACKUP',
      timestamp: new Date(),
    };
  }

  /**
   * Mock method for testing
   */
  setMockResponse(provider: VahanProvider, rcNumber: string, response: any): void {
    // Implementation for testing - override fetchFromProvider behavior
    // This would be used in tests to mock provider responses
  }
}

