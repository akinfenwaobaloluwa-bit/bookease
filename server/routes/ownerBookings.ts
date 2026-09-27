import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { bookings, services } from "../../drizzle/schema";
import { db } from "../db";
import { requireSession } from "../auth";
import { getOwnedBusinessId } from "../ownerBusiness";

const bookingStatusSchema = z.object({
    status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
});

export const ownerBookingsRouter = Router();

ownerBookingsRouter.use(requireSession);

ownerBookingsRouter.get("/", async (request, response) => {
    const userId = request.authUser?.userId;

    if (!userId) {
        return response.status(401).json({
            message: "Please log in.",
        });
    }

    try {
        const businessId = await getOwnedBusinessId(userId);

        if (!businessId) {
            return response.status(403).json({
                message: "No business is linked to this account.",
            });
        }

        const rows = await db
            .select({
                id: bookings.id,
                businessId: bookings.businessId,
                serviceId: bookings.serviceId,
                serviceName: services.name,
                customerName: bookings.customerName,
                customerPhone: bookings.customerPhone,
                customerEmail: bookings.customerEmail,
                bookingDate: bookings.bookingDate,
                startTime: bookings.startTime,
                note: bookings.note,
                status: bookings.status,
                createdAt: bookings.createdAt,
            })
            .from(bookings)
            .innerJoin(services, eq(bookings.serviceId, services.id))
            .where(eq(bookings.businessId, businessId))
            .orderBy(desc(bookings.createdAt));

        return response.json(rows);
    } catch (error) {
        console.error("List bookings error:", error);

        return response.status(500).json({
            message: "Unable to load bookings.",
        });
    }
});

ownerBookingsRouter.patch("/:id/status", async (request, response) => {
    const userId = request.authUser?.userId;
    const bookingId = Number(request.params.id);
    const parsed = bookingStatusSchema.safeParse(request.body);

    if (!userId) {
        return response.status(401).json({
            message: "Please log in.",
        });
    }

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
        return response.status(400).json({
            message: "Invalid booking ID.",
        });
    }

    if (!parsed.success) {
        return response.status(400).json({
            message: "Invalid booking status.",
            errors: parsed.error.flatten(),
        });
    }

    try {
        const businessId = await getOwnedBusinessId(userId);

        if (!businessId) {
            return response.status(403).json({
                message: "No business is linked to this account.",
            });
        }

        const updated = await db
            .update(bookings)
            .set({
                status: parsed.data.status,
            })
            .where(
                and(
                    eq(bookings.id, bookingId),
                    eq(bookings.businessId, businessId)
                )
            );

        if (updated[0].affectedRows === 0) {
            return response.status(404).json({
                message: "Booking not found.",
            });
        }

        return response.json({
            message: "Booking status updated.",
        });
    } catch (error) {
        console.error("Update booking status error:", error);

        return response.status(500).json({
            message: "Unable to update booking status.",
        });
    }
});
