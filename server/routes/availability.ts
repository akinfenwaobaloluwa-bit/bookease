import { Router } from "express";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { availability, bookings, services } from "../../drizzle/schema";
import { db } from "../db";

const availabilityQuerySchema = z.object({
    businessId: z.coerce.number().int().positive(),
    serviceId: z.coerce.number().int().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

type TimeRange = {
    start: number;
    end: number;
};

function timeToMinutes(value: string) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(value: number) {
    const hours = Math.floor(value / 60)
        .toString()
        .padStart(2, "0");
    const minutes = (value % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

function overlaps(first: TimeRange, second: TimeRange) {
    return first.start < second.end && first.end > second.start;
}

function getDayOfWeek(dateString: string) {
    const date = new Date(`${dateString}T00:00:00`);
    const day = date.getDay();

    // Database values use Monday = 1 through Sunday = 7.
    return day === 0 ? 7 : day;
}

export const availabilityRouter = Router();

availabilityRouter.get("/", async (request, response) => {
    const parsed = availabilityQuerySchema.safeParse(request.query);

    if (!parsed.success) {
        return response.status(400).json({
            message: "A valid business, service, and date are required.",
            errors: parsed.error.flatten(),
        });
    }

    try {
        const { businessId, serviceId, date } = parsed.data;
        const dayOfWeek = getDayOfWeek(date);

        const [service] = await db
            .select({
                id: services.id,
                businessId: services.businessId,
                durationMinutes: services.durationMinutes,
            })
            .from(services)
            .where(
                and(
                    eq(services.id, serviceId),
                    eq(services.businessId, businessId)
                )
            )
            .limit(1);

        if (!service) {
            return response.status(404).json({
                message: "Service not found.",
            });
        }

        const [openingHours] = await db
            .select()
            .from(availability)
            .where(
                and(
                    eq(availability.businessId, businessId),
                    eq(availability.dayOfWeek, dayOfWeek)
                )
            )
            .limit(1);

        if (!openingHours || !openingHours.isOpen) {
            return response.json({
                date,
                slots: [],
                message: "The business is closed on this day.",
            });
        }

        const existingBookings = await db
            .select({
                startTime: bookings.startTime,
                serviceId: bookings.serviceId,
            })
            .from(bookings)
            .where(
                and(
                    eq(bookings.businessId, businessId),
                    eq(bookings.bookingDate, date),
                    ne(bookings.status, "cancelled")
                )
            );

        const openingStart = timeToMinutes(openingHours.startTime);
        const openingEnd = timeToMinutes(openingHours.endTime);
        const serviceDuration = service.durationMinutes;

        const bookedRanges: TimeRange[] = [];

        for (const booking of existingBookings) {
            const [bookedService] = await db
                .select({ durationMinutes: services.durationMinutes })
                .from(services)
                .where(eq(services.id, booking.serviceId))
                .limit(1);

            if (!bookedService) continue;

            const start = timeToMinutes(booking.startTime);
            bookedRanges.push({
                start,
                end: start + bookedService.durationMinutes,
            });
        }

        const slots: string[] = [];

        for (
            let start = openingStart;
            start + serviceDuration <= openingEnd;
            start += 30
        ) {
            const candidate: TimeRange = {
                start,
                end: start + serviceDuration,
            };

            const isBooked = bookedRanges.some((bookedRange) =>
                overlaps(candidate, bookedRange)
            );

            if (!isBooked) {
                slots.push(minutesToTime(start));
            }
        }

        return response.json({
            date,
            slots,
            message:
                slots.length === 0
                    ? "There are no available slots for this date."
                    : "Available slots loaded.",
        });
    } catch (error) {
        console.error("Availability error:", error);

        return response.status(500).json({
            message: "Unable to check availability.",
        });
    }
});