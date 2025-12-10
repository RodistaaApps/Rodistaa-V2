/**
 * feature-assembler.service.ts
 * Assemble features from request input
 */

import Redis from 'ioredis';
import { fetchCorridor } from './corridor.service';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function assembleFeatures(input: any, distanceKm: number) {
  // 1. Identify corridor
  const corridor = await fetchCorridor(input);

  // 2. Fetch diesel, DSI, other signals
  const diesel = await redis.get(`diesel:zone:${input.pickup.lat}:${input.pickup.lng}`);
  const dsi = await redis.get(`dsi:corridor:${corridor.id || 'default'}`);

  return {
    ...input,
    distance_km: distanceKm,
    corridor_id: corridor.id,
    corridor_stats: corridor,
    diesel_delta: diesel ? parseFloat(diesel) : 0,
    dsi: dsi ? parseFloat(dsi) : 1,
    time_of_day: new Date().getHours(),
  };
}
