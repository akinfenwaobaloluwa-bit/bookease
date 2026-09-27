import { Router } from "express";
import { eq } from "drizzle-orm";
import { bookings, services } from "../../drizzle/schema";
import { db } from "../db";
import { createBookingSchema } from "../../shared/validation";

export const bookingRouter = Router();

bookingRouter.post("/", async (request, response) => {
    const parsed = createBookingSchema.safeParse(request.body);

    if (!parsed.success) {
        return response.status(400).json({
            message: "Please check the booking details.",
            errors: parsed.error.flatten(),
        });
    }

    try {
        const input = parsed.data;

        const [service] = await db
            .select()
            .from(services)
            .where(eq(services.id, input.serviceId))
            .limit(1);

        if (!service || service.businessId !== input.businessId) {
            return response.status(404).json({
                message: "The selected service was not found.",
            });
        }

        const inserted = await db
            .insert(bookings)
            .values({
                businessId: input.businessId,
                serviceId: input.serviceId,
                customerName: input.customerName,
                customerPhone: input.customerPhone,
                customerEmail: input.customerEmail || null,
                bookingDate: input.bookingDate,
                startTime: input.startTime,
                note: input.note || null,
                status: "pending",
            })
            .$returningId();

        return response.status(201).json({
            bookingId: inserted[0].id,
            message: "Booking request saved successfully.",
        });
    } catch (error) {
        console.error("Create booking error:", error);

        return response.status(500).json({
            message: "The booking could not be saved.",
        });
    }
});