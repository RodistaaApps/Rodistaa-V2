/**
 * VAHAN Client Service
 * Re-export from fleet-verification package with additional batched fetch API
 */

import { VahanClient as BaseVahanClient, type VahanResponse, type VahanProvider } from '@rodistaa/fleet-verification';

export { VahanClient as BaseVahanClient, type VahanResponse, type VahanProvider };

/**
 * Extended VAHAN Client with batched fetch
 */
export class VahanClient extends BaseVahanClient {
  /**
   * Batch fetch multiple RCs with concurrency control
   */
  async batchVerifyRC(
    rcNumbers: string[],
    concurrency: number = 10
  ): Promise<Map<string, VahanResponse>> {
    const results = new Map<string, VahanResponse>();
    const batches: string[][] = [];

    // Create batches
    for (let i = 0; i < rcNumbers.length; i += concurrency) {
      batches.push(rcNumbers.slice(i, i + concurrency));
    }

    // Process batches sequentially, RCs in parallel within batch
    for (const batch of batches) {
      const batchResults = await Promise.allSettled(
        batch.map(rc => this.verifyRC(rc))
      );

      batch.forEach((rc, index) => {
        const result = batchResults[index];
        if (result.status === 'fulfilled') {
          results.set(rc, result.value);
        } else {
          results.set(rc, {
            success: false,
            error: result.reason?.message || 'Unknown error',
            provider: 'BACKUP',
            timestamp: new Date(),
          });
        }
      });
    }

    return results;
  }
}

