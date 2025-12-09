/**
 * Enhanced VAHAN Client with Provider Adapters
 * Parivahan (primary) → Surepass (fallback) with retries and circuit breaker
 */

import axios, { AxiosInstance } from 'axios';
import { VahanSnapshot } from '../models/truckDimensions';

export type VahanProvider = 'PARIVAHAN' | 'SUREPASS' | 'BACKUP';

/**
 * VAHAN Adapter Interface
 */
interface VahanAdapter {
  fetchSnapshot(rcNumber: string): Promise<VahanSnapshot>;
  provider: VahanProvider;
}

/**
 * Parivahan Adapter (Primary)
 */
class ParivahanAdapter implements VahanAdapter {
  provider: VahanProvider = 'PARIVAHAN';
  private client: AxiosInstance;
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.PARIVAHAN_API_KEY;
    this.client = axios.create({
      baseURL: process.env.PARIVAHAN_BASE_URL || 'https://api.parivahan.gov.in',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      },
    });
  }

  async fetchSnapshot(rcNumber: string): Promise<VahanSnapshot> {
    if (!this.apiKey) {
      throw new Error('PARIVAHAN_API_KEY not configured');
    }

    try {
      // TODO: Replace with actual Parivahan API endpoint
      // const response = await this.client.post('/vahan/v4/vehicledetails', {
      //   rcNumber: rcNumber.toUpperCase(),
      // });

      // Mock response for now
      const mockResponse = {
        data: {
          rcNumber: rcNumber.toUpperCase(),
          maker: 'TATA',
          modelName: '407',
          bodyTypeCode: 'SXL',
          bodyTypeName: 'OPEN BODY',
          vehicleCategory: 'GOODS',
          chassisNumber: 'CHASSIS123',
          engineNumber: 'ENGINE123',
          gvwKg: 7500,
          ulwKg: 3500,
          wheelbaseMm: 3600,
          permitValidUpto: '2025-12-31',
          fitnessValidUpto: '2025-12-31',
          insuranceValidUpto: '2025-12-31',
          registrationStatus: 'ACTIVE',
        },
        headers: {
          'x-txn-id': `PARIVAHAN-${Date.now()}`,
        },
      };

      return this.normalizeResponse(mockResponse.data, mockResponse.headers['x-txn-id']);
    } catch (error: any) {
      throw new Error(`Parivahan fetch failed: ${error.message}`);
    }
  }

  private normalizeResponse(data: any, txnId: string): VahanSnapshot {
    return {
      provider: 'PARIVAHAN',
      txn_id: txnId,
      raw_json: data,
      fetched_at: new Date(),
      maker: data.maker,
      model_name: data.modelName || data.model_name,
      body_type_code: data.bodyTypeCode || data.body_type_code,
      body_type_name: data.bodyTypeName || data.body_type_name,
      vehicle_category: data.vehicleCategory || data.vehicle_category,
      chassis_number: data.chassisNumber || data.chassis_number,
      engine_number: data.engineNumber || data.engine_number,
      gvw_kg: data.gvwKg || data.gvw_kg,
      ulw_kg: data.ulwKg || data.ulw_kg,
      wheelbase_mm: data.wheelbaseMm || data.wheelbase_mm,
      permit_valid_upto: data.permitValidUpto ? new Date(data.permitValidUpto) : undefined,
      fitness_valid_upto: data.fitnessValidUpto ? new Date(data.fitnessValidUpto) : undefined,
      insurance_valid_upto: data.insuranceValidUpto ? new Date(data.insuranceValidUpto) : undefined,
      registration_status: data.registrationStatus || data.registration_status,
    };
  }
}

/**
 * Surepass Adapter (Fallback)
 */
class SurepassAdapter implements VahanAdapter {
  provider: VahanProvider = 'SUREPASS';
  private client: AxiosInstance;
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.SUREPASS_API_KEY;
    this.client = axios.create({
      baseURL: process.env.SUREPASS_BASE_URL || 'https://api.surepass.io',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      },
    });
  }

  async fetchSnapshot(rcNumber: string): Promise<VahanSnapshot> {
    if (!this.apiKey) {
      throw new Error('SUREPASS_API_KEY not configured');
    }

    try {
      // TODO: Replace with actual Surepass API endpoint
      // const response = await this.client.post('/api/v1/rc/details', {
      //   rc_number: rcNumber.toUpperCase(),
      // });

      // Mock response
      const mockResponse = {
        data: {
          rc_number: rcNumber.toUpperCase(),
          manufacturer: 'TATA',
          model: '407',
          body_type: 'OPEN',
          category: 'GOODS',
          chassis_no: 'CHASSIS123',
          engine_no: 'ENGINE123',
          gvw: 7500,
          unladen_weight: 3500,
          wheelbase: 3600,
        },
        headers: {
          'x-request-id': `SUREPASS-${Date.now()}`,
        },
      };

      return this.normalizeResponse(mockResponse.data, mockResponse.headers['x-request-id']);
    } catch (error: any) {
      throw new Error(`Surepass fetch failed: ${error.message}`);
    }
  }

  private normalizeResponse(data: any, txnId: string): VahanSnapshot {
    return {
      provider: 'SUREPASS',
      txn_id: txnId,
      raw_json: data,
      fetched_at: new Date(),
      maker: data.manufacturer || data.maker,
      model_name: data.model || data.model_name,
      body_type_code: data.body_type_code,
      body_type_name: data.body_type || data.body_type_name,
      vehicle_category: data.category || data.vehicle_category,
      chassis_number: data.chassis_no || data.chassis_number,
      engine_number: data.engine_no || data.engine_number,
      gvw_kg: data.gvw || data.gvw_kg,
      ulw_kg: data.unladen_weight || data.ulw_kg,
      wheelbase_mm: data.wheelbase || data.wheelbase_mm,
      registration_status: data.status || 'ACTIVE',
    };
  }
}

/**
 * Circuit Breaker State
 */
interface CircuitBreakerState {
  failures: number;
  lastFailureTime?: Date;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

/**
 * Enhanced VAHAN Client with Provider Failover
 */
export class VahanClientEnhanced {
  private parivahanAdapter: ParivahanAdapter;
  private surepassAdapter: SurepassAdapter;
  private circuitBreaker: Map<VahanProvider, CircuitBreakerState>;
  private maxRetries = 3;
  private retryDelay = 1000; // ms

  constructor() {
    this.parivahanAdapter = new ParivahanAdapter();
    this.surepassAdapter = new SurepassAdapter();
    this.circuitBreaker = new Map([
      ['PARIVAHAN', { failures: 0, state: 'CLOSED' }],
      ['SUREPASS', { failures: 0, state: 'CLOSED' }],
    ]);
  }

  /**
   * Fetch VAHAN snapshot with provider failover
   */
  async fetchVahanSnapshot(rcNumber: string): Promise<VahanSnapshot> {
    // Try Parivahan first
    if (await this.canUseProvider('PARIVAHAN')) {
      try {
        const snapshot = await this.retryWithBackoff(
          () => this.parivahanAdapter.fetchSnapshot(rcNumber),
          'PARIVAHAN'
        );
        this.recordSuccess('PARIVAHAN');
        return snapshot;
      } catch (error) {
        console.warn(`Parivahan failed for RC ${rcNumber}:`, error);
        this.recordFailure('PARIVAHAN');
      }
    }

    // Fallback to Surepass
    if (await this.canUseProvider('SUREPASS')) {
      try {
        const snapshot = await this.retryWithBackoff(
          () => this.surepassAdapter.fetchSnapshot(rcNumber),
          'SUREPASS'
        );
        this.recordSuccess('SUREPASS');
        return snapshot;
      } catch (error) {
        console.warn(`Surepass failed for RC ${rcNumber}:`, error);
        this.recordFailure('SUREPASS');
      }
    }

    // Both providers failed - return error snapshot
    throw new Error(`All VAHAN providers failed for RC ${rcNumber}`);
  }

  /**
   * Retry with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    provider: VahanProvider,
    attempt = 1
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= this.maxRetries) {
        throw error;
      }

      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      await this.sleep(delay);
      return this.retryWithBackoff(fn, provider, attempt + 1);
    }
  }

  /**
   * Check if provider can be used (circuit breaker)
   */
  private async canUseProvider(provider: VahanProvider): Promise<boolean> {
    const state = this.circuitBreaker.get(provider)!;

    if (state.state === 'OPEN') {
      // Check if we should transition to HALF_OPEN (after timeout)
      const timeout = 60000; // 1 minute
      if (state.lastFailureTime && Date.now() - state.lastFailureTime.getTime() > timeout) {
        state.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }

    return true; // CLOSED or HALF_OPEN
  }

  /**
   * Record provider success
   */
  private recordSuccess(provider: VahanProvider): void {
    const state = this.circuitBreaker.get(provider)!;
    state.failures = 0;
    state.state = 'CLOSED';
  }

  /**
   * Record provider failure
   */
  private recordFailure(provider: VahanProvider): void {
    const state = this.circuitBreaker.get(provider)!;
    state.failures++;
    state.lastFailureTime = new Date();

    if (state.failures >= 5) {
      state.state = 'OPEN'; // Open circuit after 5 consecutive failures
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get circuit breaker stats for monitoring
   */
  getCircuitBreakerStats(): Record<VahanProvider, CircuitBreakerState> {
    return {
      PARIVAHAN: { ...this.circuitBreaker.get('PARIVAHAN')! },
      SUREPASS: { ...this.circuitBreaker.get('SUREPASS')! },
    };
  }
}

// Export singleton instance
export const vahanClient = new VahanClientEnhanced();

