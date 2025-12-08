/**
 * Franchise Service
 * Assign photo verification tasks to franchises
 */

import { query, PoolClient } from '../db';
import { FranchiseTask } from '../models/truckDimensions';

const PHOTO_VERIFICATION_DUE_HOURS = 48;

/**
 * Find nearest franchise for operator
 */
export async function findNearestFranchise(
  operatorId: string
): Promise<string | null> {
  // TODO: Implement geolocation-based franchise lookup
  // For now, return a default franchise ID
  
  // Placeholder implementation
  const result = await query<{ franchise_id: string }>(
    `SELECT franchise_id 
     FROM operator_franchise_mapping 
     WHERE operator_id = $1 
     LIMIT 1`,
    [operatorId]
  );

  if (result.rows.length > 0) {
    return result.rows[0].franchise_id;
  }

  // Default franchise (should be configured)
  return process.env.DEFAULT_FRANCHISE_ID || null;
}

/**
 * Assign photo verification task
 */
export async function assignPhotoVerificationTask(
  truckId: number,
  operatorId: string,
  client?: PoolClient
): Promise<number> {
  const queryFn = client ? client.query.bind(client) : query;

  // Find nearest franchise
  const franchiseId = await findNearestFranchise(operatorId);
  if (!franchiseId) {
    throw new Error('No franchise available for photo verification');
  }

  const dueAt = new Date();
  dueAt.setHours(dueAt.getHours() + PHOTO_VERIFICATION_DUE_HOURS);

  const result = await queryFn<{ id: number }>(
    `INSERT INTO franchise_tasks 
     (truck_id, task_type, assigned_franchise_id, status, payload, due_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      truckId,
      'PHOTO_VERIFY',
      franchiseId,
      'PENDING',
      JSON.stringify({
        required_photos: ['front', 'rear', 'side_left', 'side_right', 'tyres_closeup', 'deck_length_with_tape'],
        instructions: 'Verify truck dimensions and configuration with photos. Include measuring tape in deck length photo.',
      }),
      dueAt,
    ]
  );

  // TODO: Send notification to franchise via webhook
  // await notifyFranchise(franchiseId, result.rows[0].id);

  return result.rows[0].id;
}

/**
 * Get franchise tasks
 */
export async function getFranchiseTasks(
  franchiseId: string,
  filters: {
    status?: string;
    due_before?: Date;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ tasks: FranchiseTask[]; total: number }> {
  const conditions: string[] = [`assigned_franchise_id = $1`];
  const params: any[] = [franchiseId];
  let paramIndex = 2;

  if (filters.status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(filters.status);
  }
  if (filters.due_before) {
    conditions.push(`due_at <= $${paramIndex++}`);
    params.push(filters.due_before);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM franchise_tasks ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get tasks
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  params.push(limit, offset);

  const result = await query<FranchiseTask>(
    `SELECT id, truck_id, task_type, assigned_franchise_id, status, payload,
            created_at, due_at, completed_at, completed_by, result, notes
     FROM franchise_tasks
     ${whereClause}
     ORDER BY due_at ASC, created_at ASC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    params
  );

  const tasks = result.rows.map(row => ({
    ...row,
    payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
    result: row.result ? (typeof row.result === 'string' ? JSON.parse(row.result) : row.result) : undefined,
  }));

  return { tasks, total };
}

/**
 * Complete franchise task
 */
export async function completeFranchiseTask(
  taskId: number,
  franchiseId: string,
  result: {
    verified: boolean;
    photos_urls: string[];
    notes: string;
  }
): Promise<void> {
  await transaction(async (client) => {
    // Update task
    await client.query(
      `UPDATE franchise_tasks
       SET status = 'COMPLETED',
           completed_at = NOW(),
           completed_by = $1,
           result = $2
       WHERE id = $3 AND assigned_franchise_id = $4`,
      [franchiseId, JSON.stringify(result), taskId, franchiseId]
    );

    // Get task details
    const taskResult = await client.query<FranchiseTask>(
      `SELECT truck_id, payload FROM franchise_tasks WHERE id = $1`,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      throw new Error('Task not found');
    }

    const task = taskResult.rows[0];
    const payload = typeof task.payload === 'string' ? JSON.parse(task.payload) : task.payload;

    // Update truck flags based on verification result
    if (result.verified) {
      // Remove LENGTH_MISMATCH_WARNING flag
      await client.query(
        `UPDATE operator_trucks
         SET flags = (
           SELECT jsonb_agg(flag)
           FROM jsonb_array_elements(flags) flag
           WHERE flag->>'flag_code' != 'LENGTH_MISMATCH_WARNING'
         )
         WHERE id = $1`,
        [task.truck_id]
      );
    } else {
      // Verification failed - update flags and create ticket
      await client.query(
        `UPDATE operator_trucks
         SET flags = jsonb_insert(
           COALESCE(flags, '[]'::jsonb),
           '{-1}',
           jsonb_build_object(
             'flag_code', 'PHOTO_VERIFICATION_FAILED',
             'meta', jsonb_build_object(
               'reason', 'Franchise photo verification failed',
               'severity', 'HIGH',
               'notes', $1
             ),
             'created_at', NOW()
           )
         )
         WHERE id = $2`,
        [result.notes, task.truck_id]
      );
    }
  });
}

