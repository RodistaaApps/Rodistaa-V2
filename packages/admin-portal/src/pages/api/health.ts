/**
 * Health Check Endpoint
 * Returns service health status
 */

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'ok',
    service: 'rodistaa-portal',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}

