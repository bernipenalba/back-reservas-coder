import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, 'name es obligatorio'),
  description: z.string().min(1, 'description es obligatorio'),
  duration: z.number().positive('duration debe ser un número mayor a 0'),
  price: z.number().positive('price debe ser un número mayor a 0'),
  category: z.string().min(1, 'category es obligatorio'),
  available: z.boolean().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();
