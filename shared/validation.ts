import { z } from "zod";

export const createBookingSchema = z.object({
    businessId: z.number().int().positive(),
    serviceId: z.number().int().positive(),
    customerName: z.string().trim().min(2).max(120),
    customerPhone: z.string().trim().min(7).max(30),
    customerEmail: z.string().email().optional().or(z.literal("")),
    bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    note: z.string().trim().max(1000).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;