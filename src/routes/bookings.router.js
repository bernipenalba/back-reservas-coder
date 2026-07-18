import { Router } from 'express';
import {
  createBooking,
  getBookingById,
  addServiceToBooking,
} from '../managers/BookingManager.js';

const router = Router();

// POST /api/bookings
router.post('/', async (req, res) => {
  const result = await createBooking(req.body);
  const statusCode = result.status === 'error' ? 400 : 201;
  res.status(statusCode).json(result);
});

// GET /api/bookings/:bid
router.get('/:bid', async (req, res) => {
  const { bid } = req.params;
  const booking = await getBookingById(bid);

  if (!booking) {
    return res.status(404).json({ status: 'error', message: 'Reserva no encontrada' });
  }

  res.status(200).json({ status: 'success', payload: booking });
});

// POST /api/bookings/:bid/services/:sid
router.post('/:bid/services/:sid', async (req, res) => {
  const { bid, sid } = req.params;
  const result = await addServiceToBooking(bid, sid);
  const statusCode = result.status === 'error' ? 404 : 200;
  res.status(statusCode).json(result);
});

export default router;
