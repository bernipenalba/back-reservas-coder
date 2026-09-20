import { z } from 'zod';

export const createBookingSchema = z.object({
  clientName: z.string().min(1, 'clientName es obligatorio'),
  clientEmail: z.string().email('clientEmail debe ser un email válido'),
  date: z.string().min(1, 'date es obligatorio'),
  time: z.string().min(1, 'time es obligatorio'),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  services: z
    .array(
      z.object({
        service: z.string(),
        quantity: z.number().optional(),
      })
    )
    .optional(),
});

export const bookingParamsSchema = z.object({
  bid: z.string().regex(/^[0-9a-fA-F]{24}$/, 'bid debe ser un ObjectId válido'),
  sid: z.string().regex(/^[0-9a-fA-F]{24}$/, 'sid debe ser un ObjectId válido'),
});
