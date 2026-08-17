import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  getCurrentUser,
  getUserById,
  getUsers,
  getUserWalletTransactions,
  getBookingsByUser,
  getBookingById,
  createBooking,
  updateBookingStatus,
  createSOSIncident,
  getActiveSOSIncidents,
  getDriverById,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
} from '@omnigo/api';

const app = express();
const PORT = Number(process.env.PORT || 3001);

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// Log all requests
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── User Routes ──────────────────────────────────────────────

// GET /api/user/me — get current authenticated user (stub: returns mock/first user)
app.get('/api/user/me', async (_req, res) => {
  try {
    const user = await getCurrentUser();
    res.json({ user });
  } catch (err: any) {
    console.error('[/api/user/me]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/:id — get user by ID
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err: any) {
    console.error('[/api/user/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/:id/bookings — bookings for a specific user
app.get('/api/user/:id/bookings', async (req, res) => {
  try {
    const bookings = await getBookingsByUser(req.params.id);
    res.json({ bookings });
  } catch (err: any) {
    console.error('[/api/user/:id/bookings]', err.message);
    res.status(500).json({ error: err.message, bookings: [] });
  }
});

// GET /api/user/:id/wallet — wallet balance + recent transactions
app.get('/api/user/:id/wallet', async (req, res) => {
  try {
    const [user, transactions] = await Promise.all([
      getUserById(req.params.id),
      getUserWalletTransactions(req.params.id),
    ]);
    res.json({
      balance: user?.walletBalance ?? 0,
      transactions: transactions ?? [],
    });
  } catch (err: any) {
    console.error('[/api/user/:id/wallet]', err.message);
    res.status(500).json({ error: err.message, balance: 0, transactions: [] });
  }
});

// ─── Booking Routes ───────────────────────────────────────────

// GET /api/bookings/:id — get a single booking
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking });
  } catch (err: any) {
    console.error('[/api/bookings/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings — create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = await createBooking(req.body);
    if (!booking) return res.status(500).json({ error: 'Failed to create booking' });
    res.status(201).json({ booking });
  } catch (err: any) {
    console.error('[POST /api/bookings]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/status — update booking status
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const booking = await updateBookingStatus(req.params.id, status, req.body.extraData);
    res.json({ booking });
  } catch (err: any) {
    console.error('[PATCH /api/bookings/:id/status]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── SOS Routes ───────────────────────────────────────────────

// POST /api/sos — create an SOS incident
app.post('/api/sos', async (req, res) => {
  try {
    const incident = await createSOSIncident(req.body);
    res.status(201).json({ incident });
  } catch (err: any) {
    console.error('[POST /api/sos]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sos — get active SOS incidents
app.get('/api/sos', async (_req, res) => {
  try {
    const incidents = await getActiveSOSIncidents();
    res.json({ incidents });
  } catch (err: any) {
    console.error('[GET /api/sos]', err.message);
    res.status(500).json({ error: err.message, incidents: [] });
  }
});

// ─── Driver Routes ────────────────────────────────────────────

// GET /api/drivers/:id — get driver details
app.get('/api/drivers/:id', async (req, res) => {
  try {
    const driver = await getDriverById(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json({ driver });
  } catch (err: any) {
    console.error('[/api/drivers/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Notification Routes ──────────────────────────────────────

// GET /api/notifications — list notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    const notifs = await getNotifications({ userId });
    res.json({ notifications: notifs });
  } catch (err: any) {
    console.error('[/api/notifications]', err.message);
    res.status(500).json({ error: err.message, notifications: [] });
  }
});

// POST /api/notifications/read-all — mark all notifications as read
app.post('/api/notifications/read-all', async (req, res) => {
  try {
    const { userId } = req.body;
    await markAllNotificationsAsRead({ userId });
    res.json({ success: true });
  } catch (err: any) {
    console.error('[/api/notifications/read-all]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read — mark single notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    await markNotificationAsRead(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[/api/notifications/:id/read]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notifications/:id — delete notification
app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await deleteNotification(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[/api/notifications/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Vehicle Types ────────────────────────────────────────────
app.get('/api/vehicle-types', (_req, res) => {
  res.json({
    vehicleTypes: [
      { id: 'flatbed', name: 'Flatbed Tow', icon: 'flatbed', basePrice: 850, pricePerKm: 15, eta: '8-12 min', description: 'For sedans, hatchbacks & SUVs' },
      { id: 'wheel_lift', name: 'Wheel-Lift Tow', icon: 'wheel_lift', basePrice: 650, pricePerKm: 12, eta: '5-8 min', description: 'For lighter vehicles, fast dispatch' },
      { id: 'heavy_duty', name: 'Heavy Duty Tow', icon: 'heavy_duty', basePrice: 1500, pricePerKm: 25, eta: '15-20 min', description: 'Trucks, buses & heavy vehicles' },
      { id: 'motorcycle', name: 'Bike Tow', icon: 'motorcycle', basePrice: 400, pricePerKm: 8, eta: '5-7 min', description: 'Two-wheelers & scooters' },
    ],
  });
});

// ─── 404 handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 OmniGo API Server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   DB: ✅ Supabase (${process.env.SUPABASE_URL || 'https://rowyjdwzpiyjamtrftuo.supabase.co'})\n`);
});

export default app;
