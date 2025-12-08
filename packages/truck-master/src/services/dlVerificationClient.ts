/**
 * DL Verification Client
 * Adapter for external DL verification service (mockable for tests)
 */

export interface DLVerificationResult {
  success: boolean;
  dl_number: string;
  dl_class?: string;
  name?: string;
  valid_from?: Date;
  valid_till?: Date;
  status?: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  provider?: string;
  txn_id?: string;
  error?: string;
}

/**
 * DL Verification Client Interface
 */
export interface IDLVerificationClient {
  verify(dl_number: string): Promise<DLVerificationResult>;
}

/**
 * Mock DL Verification Client (for development/testing)
 */
export class MockDLVerificationClient implements IDLVerificationClient {
  async verify(dl_number: string): Promise<DLVerificationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock successful verification for valid DL format
    if (dl_number.match(/^DL-\d{2}-\d{4}-\d{7}$/)) {
      return {
        success: true,
        dl_number,
        dl_class: 'HMV',
        name: 'Mock Driver',
        valid_from: new Date('2020-01-01'),
        valid_till: new Date('2030-01-01'),
        status: 'ACTIVE',
        provider: 'MOCK',
        txn_id: `MOCK-${Date.now()}`,
      };
    }

    // Mock failure for invalid DL
    return {
      success: false,
      dl_number,
      status: 'EXPIRED',
      provider: 'MOCK',
      txn_id: `MOCK-${Date.now()}`,
      error: 'DL number not found or invalid',
    };
  }
}

/**
 * External DL Verification Client (TODO: Integrate with real provider)
 */
export class ExternalDLVerificationClient implements IDLVerificationClient {
  private apiKey?: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.DL_VERIFY_API_KEY;
    this.baseUrl = process.env.DL_VERIFY_BASE_URL || 'https://api.dlverify.in';
  }

  async verify(dl_number: string): Promise<DLVerificationResult> {
    if (!this.apiKey) {
      throw new Error('DL_VERIFY_API_KEY not configured');
    }

    try {
      // TODO: Replace with actual API call
      // const response = await axios.post(`${this.baseUrl}/api/v1/verify`, {
      //   dl_number,
      // }, {
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      // });

      // For now, return mock response
      return {
        success: true,
        dl_number,
        provider: 'EXTERNAL',
        txn_id: `EXT-${Date.now()}`,
        error: 'External API not implemented yet',
      };
    } catch (error: any) {
      return {
        success: false,
        dl_number,
        provider: 'EXTERNAL',
        error: error.message || 'DL verification failed',
      };
    }
  }
}

/**
 * Factory to get DL verification client
 */
export function createDLVerificationClient(): IDLVerificationClient {
  const useMock = process.env.USE_MOCK_DL_VERIFY === 'true' || !process.env.DL_VERIFY_API_KEY;
  
  if (useMock) {
    return new MockDLVerificationClient();
  }
  
  return new ExternalDLVerificationClient();
}

// Export singleton instance
export const dlVerificationClient = createDLVerificationClient();

