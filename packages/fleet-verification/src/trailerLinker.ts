/**
 * Trailer Linker
 * Logic to link tractor and trailer records, enforce pairing rules
 */

import { Pool } from 'pg';

export interface TrailerLinkResult {
  success: boolean;
  linked: boolean;
  error?: string;
}

/**
 * Trailer Linker
 */
export class TrailerLinker {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Link trailer to tractor
   */
  async linkTrailerToTractor(
    trailerRc: string,
    tractorRc: string,
    operatorId: string
  ): Promise<TrailerLinkResult> {
    // Verify both vehicles belong to operator
    const verification = await this.verifyOwnership(trailerRc, tractorRc, operatorId);
    if (!verification.valid) {
      return {
        success: false,
        linked: false,
        error: verification.error,
      };
    }

    // Update trailer record
    const updateTrailerQuery = `
      UPDATE operator_trucks
      SET linked_tractor_rc = $1,
          status = CASE WHEN status = 'PENDING_TRACTOR_PAIRING' THEN 'ACTIVE' ELSE status END,
          updated_at = CURRENT_TIMESTAMP
      WHERE rc_number = $2
      AND operator_id = $3
      AND is_trailer = TRUE
    `;

    // Update tractor record
    const updateTractorQuery = `
      UPDATE operator_trucks
      SET linked_trailer_rc = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE rc_number = $2
      AND operator_id = $3
      AND is_tractor = TRUE
    `;

    try {
      await this.db.query('BEGIN');

      await this.db.query(updateTrailerQuery, [tractorRc, trailerRc, operatorId]);
      await this.db.query(updateTractorQuery, [trailerRc, tractorRc, operatorId]);

      await this.db.query('COMMIT');

      return {
        success: true,
        linked: true,
      };
    } catch (error: any) {
      await this.db.query('ROLLBACK');
      return {
        success: false,
        linked: false,
        error: error.message || 'Failed to link trailer',
      };
    }
  }

  /**
   * Unlink trailer from tractor
   */
  async unlinkTrailer(trailerRc: string, operatorId: string): Promise<TrailerLinkResult> {
    // Get linked tractor
    const getTractorQuery = `
      SELECT linked_tractor_rc
      FROM operator_trucks
      WHERE rc_number = $1
      AND operator_id = $2
      AND is_trailer = TRUE
    `;

    const result = await this.db.query(getTractorQuery, [trailerRc, operatorId]);
    if (result.rows.length === 0) {
      return {
        success: false,
        linked: false,
        error: 'Trailer not found',
      };
    }

    const tractorRc = result.rows[0].linked_tractor_rc;
    if (!tractorRc) {
      return {
        success: true,
        linked: false,
      };
    }

    // Unlink both
    const updateTrailerQuery = `
      UPDATE operator_trucks
      SET linked_tractor_rc = NULL,
          status = 'PENDING_TRACTOR_PAIRING',
          updated_at = CURRENT_TIMESTAMP
      WHERE rc_number = $1
      AND operator_id = $2
    `;

    const updateTractorQuery = `
      UPDATE operator_trucks
      SET linked_trailer_rc = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE rc_number = $1
      AND operator_id = $2
    `;

    try {
      await this.db.query('BEGIN');

      await this.db.query(updateTrailerQuery, [trailerRc, operatorId]);
      await this.db.query(updateTractorQuery, [tractorRc, operatorId]);

      await this.db.query('COMMIT');

      return {
        success: true,
        linked: false,
      };
    } catch (error: any) {
      await this.db.query('ROLLBACK');
      return {
        success: false,
        linked: false,
        error: error.message || 'Failed to unlink trailer',
      };
    }
  }

  /**
   * Verify ownership of both vehicles
   */
  private async verifyOwnership(
    trailerRc: string,
    tractorRc: string,
    operatorId: string
  ): Promise<{ valid: boolean; error?: string }> {
    const query = `
      SELECT rc_number, is_trailer, is_tractor
      FROM operator_trucks
      WHERE rc_number IN ($1, $2)
      AND operator_id = $3
    `;

    const result = await this.db.query(query, [trailerRc, tractorRc, operatorId]);

    if (result.rows.length !== 2) {
      return {
        valid: false,
        error: 'One or both vehicles not found or not owned by operator',
      };
    }

    const trailer = result.rows.find((r: any) => r.rc_number === trailerRc && r.is_trailer);
    const tractor = result.rows.find((r: any) => r.rc_number === tractorRc && r.is_tractor);

    if (!trailer) {
      return {
        valid: false,
        error: 'Trailer RC not found or not marked as trailer',
      };
    }

    if (!tractor) {
      return {
        valid: false,
        error: 'Tractor RC not found or not marked as tractor',
      };
    }

    return { valid: true };
  }

  /**
   * Check if trailer can bid (must be linked to tractor)
   */
  async canTrailerBid(trailerRc: string, operatorId: string): Promise<boolean> {
    const query = `
      SELECT linked_tractor_rc, status
      FROM operator_trucks
      WHERE rc_number = $1
      AND operator_id = $2
      AND is_trailer = TRUE
    `;

    const result = await this.db.query(query, [trailerRc, operatorId]);
    if (result.rows.length === 0) {
      return false;
    }

    const trailer = result.rows[0];
    return trailer.linked_tractor_rc !== null && trailer.status === 'ACTIVE';
  }

  /**
   * Get linked tractor for trailer
   */
  async getLinkedTractor(trailerRc: string, operatorId: string): Promise<string | null> {
    const query = `
      SELECT linked_tractor_rc
      FROM operator_trucks
      WHERE rc_number = $1
      AND operator_id = $2
      AND is_trailer = TRUE
    `;

    const result = await this.db.query(query, [trailerRc, operatorId]);
    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].linked_tractor_rc;
  }
}

