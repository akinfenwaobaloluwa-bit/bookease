import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { availability, businesses, services } from "../../drizzle/schema";
import { db } from "../db";

export const publicRouter = Router();

publicRouter.get("/businesses/:slug", async (request, response) => {
    const slug = request.params.slug;

    if (!slug) {
        return response.status(400).json({
            message: "A business slug is required.",
        });
    }

    try {
        const [business] = await db
            .select()
            .from(businesses)
            .where(eq(businesses.slug, slug))
            .limit(1);

        if (!business) {
            return response.status(404).json({
                message: "Business not found.",
            });
        }

        const [businessServices, hours] = await Promise.all([
            db
                .select()
                .from(services)
                .where(eq(services.businessId, business.id)),
            db
                .select()
                .from(availability)
                .where(eq(availability.businessId, business.id))
                .orderBy(asc(availability.dayOfWeek)),
        ]);

        return response.json({
            business,
            services: businessServices,
            hours,
        });
    } catch (error) {
        console.error("Load public business error:", error);

        return response.status(500).json({
            message: "Unable to load the business profile.",
        });
    }
});