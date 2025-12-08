/**
 * Mock API Server for Rodistaa Mobile Apps
 * Provides realistic mock responses for local development and testing
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Mock data
const mockUsers = {
  shipper: { id: 'SHP001', name: 'ABC Logistics', phone: '9876543210', role: 'shipper' },
  operator: { id: 'OPR001', name: 'XYZ Transport', phone: '9876543211', role: 'operator' },
  driver: { id: 'DRV001', name: 'Ramesh Kumar', phone: '9876543212', role: 'driver' },
};

const mockBookings = [
  {
    id: 'BKG001',
    shipperId: 'SHP001',
    pickup: { address: 'Hyderabad', city: 'Hyderabad', state: 'Telangana' },
    drop: { address: 'Mumbai', city: 'Mumbai', state: 'Maharashtra' },
    material: 'Electronics',
    weight: 5,
    priceRange: { min: 45000, max: 55000 },
    status: 'OPEN_FOR_BIDDING',
    createdAt: new Date().toISOString(),
  },
];

const mockBids = [];
const mockTrucks = [];
const mockShipments = [];

// Auth endpoints
app.post('/v1/auth/request-otp', (req, res) => {
  const { phone } = req.body;
  res.json({ success: true, message: 'OTP sent successfully', otp: '123456' });
});

app.post('/v1/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  let user = mockUsers.shipper;
  if (phone === '9876543211') user = mockUsers.operator;
  if (phone === '9876543212') user = mockUsers.driver;
  
  res.json({
    success: true,
    token: `mock-jwt-token-${user.id}`,
    user,
  });
});

// Bookings endpoints
app.get('/v1/bookings', (req, res) => {
  res.json({ data: mockBookings, total: mockBookings.length });
});

app.get('/v1/bookings/:id', (req, res) => {
  const booking = mockBookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json({ data: booking });
});

app.post('/v1/bookings', (req, res) => {
  const newBooking = { ...req.body, id: `BKG${Date.now()}`, createdAt: new Date().toISOString() };
  mockBookings.push(newBooking);
  res.json({ data: newBooking });
});

// Bids endpoints
app.get('/v1/bids', (req, res) => {
  res.json({ data: mockBids, total: mockBids.length });
});

app.post('/v1/bids', (req, res) => {
  const newBid = { ...req.body, id: `BID${Date.now()}`, createdAt: new Date().toISOString(), status: 'PENDING' };
  mockBids.push(newBid);
  res.json({ data: newBid });
});

// Trucks endpoints
app.get('/v1/operator/trucks', (req, res) => {
  res.json({ data: mockTrucks, total: mockTrucks.length });
});

// Shipments endpoints
app.get('/v1/shipments', (req, res) => {
  res.json({ data: mockShipments, total: mockShipments.length });
});

// Profile endpoints
app.get('/mobile/v1/users/:id/profile', (req, res) => {
  const userId = req.params.id;
  const user = mockUsers[userId.slice(0, 3).toLowerCase()] || mockUsers.shipper;
  res.json({
    name: user.name,
    id: user.id,
    role: user.role,
    mobile: user.phone,
    franchise: 'Rodistaa Hyderabad',
    trustScore: 85,
    documents: [
      { id: 'DOC001', type: 'PAN', status: 'uploaded', expiryDate: null },
      { id: 'DOC002', type: 'Aadhaar', status: 'uploaded', expiryDate: null },
      { id: 'DOC003', type: 'GST', status: 'expiring', expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  });
});

app.post('/mobile/v1/users/:id/profile/photo', (req, res) => {
  res.json({ success: true, photoUrl: 'https://example.com/photo.jpg' });
});

app.post('/mobile/v1/documents/:docId/view', (req, res) => {
  const { reason } = req.body;
  if (!reason) {
    return res.status(400).json({ error: 'Reason required' });
  }
  // Mock audit log call
  console.log(`[AUDIT] Document ${req.params.docId} viewed. Reason: ${reason}`);
  res.json({ signedUrl: `https://example.com/documents/${req.params.docId}?token=mock-token` });
});

// Notifications endpoints
app.get('/mobile/v1/notifications', (req, res) => {
  res.json({
    notifications: [
      { id: 'N1', title: 'New Bid Received', message: '3 operators bid on BK001', type: 'info', read: false },
      { id: 'N2', title: 'Shipment Update', message: 'Your shipment has been dispatched', type: 'info', read: false },
    ],
    unreadCount: 2,
  });
});

app.post('/mobile/v1/metrics/ack', (req, res) => {
  const { notificationIds } = req.body;
  res.json({ success: true, acknowledged: notificationIds });
});

// Dashboard endpoints - Mobile API v1
app.get('/mobile/v1/dashboard/shipper', (req, res) => {
  res.json({
    activePostings: 5,
    openBids: 12,
    shipmentsInTransit: 3,
    spend30d: 45000,
    recentLoads: [
      {
        id: 'BK001',
        route: 'Mumbai → Delhi',
        postedTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lowestBid: 25000,
        autoFinalizeCountdown: 43200,
      },
      {
        id: 'BK002',
        route: 'Bangalore → Hyderabad',
        postedTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        lowestBid: 18000,
        autoFinalizeCountdown: 75600,
      },
    ],
    suggestedPrice: {
      min: 20000,
      max: 28000,
      confidence: 85,
    },
  });
});

app.get('/mobile/v1/dashboard/operator', (req, res) => {
  res.json({
    availableTrucks: 8,
    activeBids: 12,
    pendingInspections: 3,
    ledgerBalance: 145000,
    recommendedLoads: [
      {
        id: 'LD001',
        route: 'Hyderabad → Mumbai',
        distance: 750,
        tonnage: 10,
        expectedPrice: 35000,
        postedTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ],
    trucksSnapshot: [
      { id: 'TR001', status: 'available', lastInspection: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'TR002', status: 'in_transit', lastInspection: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    inspectionReminders: [
      { truckId: 'TR003', dueIn: 3, message: 'Inspection due in 3 days' },
    ],
  });
});

app.get('/mobile/v1/dashboard/driver', (req, res) => {
  res.json({
    todayTrips: 2,
    earningsToday: 1500,
    behaviorScore: 95,
    lastPing: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    activeTrip: {
      id: 'TRIP001',
      route: 'Mumbai → Delhi',
      status: 'in_transit',
      eta: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      otpRequired: true,
    },
    recentTrips: [
      {
        id: 'TRIP002',
        route: 'Hyderabad → Bangalore',
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        earnings: 1800,
      },
    ],
  });
});

// Legacy dashboard endpoints (for backward compatibility)
app.get('/v1/operator/dashboard', (req, res) => {
  res.json({
    activeTrucks: 5,
    activeShipments: 8,
    activeBids: 12,
    pendingInspections: 3,
    winsToday: 2,
    mtdEarnings: 145000,
    pendingPayments: 45000,
    completedShipments: 234,
  });
});

app.get('/v1/shipper/dashboard', (req, res) => {
  res.json({
    activeBookings: 3,
    activeShipments: 2,
    totalSpend: 250000,
    pendingPayments: 50000,
  });
});

app.get('/v1/driver/dashboard', (req, res) => {
  res.json({
    activeTrip: null,
    earningsToday: 1500,
    earningsMonth: 35000,
    behaviorScore: 95,
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});

