/**
 * Google Maps Mock Service
 * Simulates Google Maps API for local development
 */

import express, { Request, Response } from 'express';

const router = express.Router();

// Mock geocoding (address to coordinates)
router.get('/geocode/json', (req: Request, res: Response) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address parameter required' });
  }

  // Mock coordinates based on city names (simplified)
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    mumbai: { lat: 19.0760, lng: 72.8777 },
    delhi: { lat: 28.6139, lng: 77.2090 },
    pune: { lat: 18.5204, lng: 73.8567 },
    bangalore: { lat: 12.9716, lng: 77.5946 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    kolkata: { lat: 22.5726, lng: 88.3639 },
    hyderabad: { lat: 17.3850, lng: 78.4867 },
    ahmedabad: { lat: 23.0225, lng: 72.5714 },
  };

  const addressLower = (address as string).toLowerCase();
  let coords = { lat: 19.0760, lng: 72.8777 }; // Default to Mumbai

  for (const [city, coord] of Object.entries(cityCoordinates)) {
    if (addressLower.includes(city)) {
      coords = coord;
      break;
    }
  }

  res.json({
    status: 'OK',
    results: [
      {
        geometry: {
          location: coords,
          location_type: 'APPROXIMATE',
        },
        formatted_address: address,
        place_id: `mock_place_${Date.now()}`,
      },
    ],
  });
});

// Mock reverse geocoding (coordinates to address)
router.get('/geocode/json', (req: Request, res: Response) => {
  const { latlng } = req.query;

  if (!latlng) {
    return res.status(400).json({ error: 'latlng parameter required' });
  }

  const [lat, lng] = (latlng as string).split(',').map(Number);

  res.json({
    status: 'OK',
    results: [
      {
        formatted_address: `${lat}, ${lng} Mock Address, India`,
        geometry: {
          location: { lat, lng },
        },
        place_id: `mock_place_${Date.now()}`,
      },
    ],
  });
});

// Mock distance matrix
router.get('/distancematrix/json', (req: Request, res: Response) => {
  const { origins, destinations, mode = 'driving' } = req.query;

  if (!origins || !destinations) {
    return res.status(400).json({ error: 'origins and destinations required' });
  }

  // Mock distance calculation (Haversine formula simplified)
  const [originLat, originLng] = (origins as string).split(',').map(Number);
  const [destLat, destLng] = (destinations as string).split(',').map(Number);

  // Simple distance approximation
  const distanceKm = Math.sqrt(
    Math.pow(destLat - originLat, 2) + Math.pow(destLng - originLng, 2)
  ) * 111; // Rough km conversion

  const durationSeconds = Math.floor(distanceKm * 60); // Rough 1km/min

  res.json({
    status: 'OK',
    origin_addresses: [origins as string],
    destination_addresses: [destinations as string],
    rows: [
      {
        elements: [
          {
            distance: {
              text: `${Math.round(distanceKm)} km`,
              value: Math.round(distanceKm * 1000),
            },
            duration: {
              text: `${Math.round(durationSeconds / 60)} mins`,
              value: durationSeconds,
            },
            status: 'OK',
          },
        ],
      },
    ],
  });
});

// Mock directions
router.get('/directions/json', (req: Request, res: Response) => {
  const { origin, destination } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'origin and destination required' });
  }

  res.json({
    status: 'OK',
    routes: [
      {
        overview_polyline: {
          points: 'mock_polyline_points',
        },
        legs: [
          {
            distance: { text: '100 km', value: 100000 },
            duration: { text: '2 hours', value: 7200 },
            start_address: origin as string,
            end_address: destination as string,
          },
        ],
      },
    ],
  });
});

export default router;

