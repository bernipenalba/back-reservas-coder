import { Router } from 'express';
import {
  createBooking,
  getBookingById,
  addServiceToBooking,
} from '../controllers/bookings.controller.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import { createBookingSchema, bookingParamsSchema } from '../schemas/booking.schema.js';

const router = Router();

router.post('/', validateBody(createBookingSchema), createBooking);
router.get('/:bid', getBookingById);
router.post('/:bid/services/:sid', validateParams(bookingParamsSchema), addServiceToBooking);

export default router;
