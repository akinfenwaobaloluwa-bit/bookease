/// <reference path="../express.d.ts" />

import { Router } from "express";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { availability, businesses } from "../../drizzle/schema";
import { db } from "../db";
import { requireSession } from "../auth";
import { getOwnedBusinessId } from "../ownerBusiness";

const businessSettingsSchema = z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1000).optional(),
    logoUrl: z.string().trim().max(500).optional(),
    whatsappNumber: z.string().trim().min(7).max(30),
    phone: z.string().trim().max(30).optional(),
    address: z.string().trim().max(255).optional(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

const availabilitySchema = z.object({
    dayOfWeek: z.number().int().min(1).max(7),
    isOpen: z.boolean(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const settingsRouter = Router();

settingsRouter.use(requireSession);

settingsRouter.get("/business", async (request, response) => {
    const userId = request.authUser?.userId;

    if (!userId) {
        return response.status(401).json({ message: "Please log in." });
    }

    try {
        const businessId = await getOwnedBusinessId(userId);

        if (!businessId) {
            return response.status(403).json({
                message: "No business is linked to this account.",
            });
        }

        const [business] = await db
            .select()
            .from(businesses)
            .where(eq(businesses.id, businessId))
            .limit(1);

        if (!business) {
            return response.status(404).json({
                message: "Business not found.",
            });
        }

        const hours = await db
            .select()
            .from(availability)
            .where(eq(availability.businessId, businessId))
            .orderBy(asc(availability.dayOfWeek));

        return response.json({ business, hours });
    } catch (error) {
        console.error("Load settings error:", error);
        return response.status(500).json({
            message: "Unable to load settings.",
        });
    }
});

settingsRouter.put("/business", async (request, response) => {
    const userId = request.authUser?.userId;
    const parsed = businessSettingsSchema.safeParse(request.body);

    if (!userId) {
        return response.status(401).json({ message: "Please log in." });
    }

    if (!parsed.success) {
        return response.status(400).json({
            message: "Please check the business details.",
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

        const input = parsed.data;

        const updated = await db
            .update(businesses)
            .set({
                name: input.name,
                description: input.description || null,
                logoUrl: input.logoUrl || null,
                whatsappNumber: input.whatsappNumber,
                phone: input.phone || null,
                address: input.address || null,
                primaryColor: input.primaryColor,
            })
            .where(eq(businesses.id, businessId));

        if (updated[0].affectedRows === 0) {
            return response.status(404).json({
                message: "Business not found.",
            });
        }

        return response.json({
            message: "Business settings updated.",
        });
    } catch (error) {
        console.error("Update settings error:", error);
        return response.status(500).json({
            message: "Unable to update settings.",
        });
    }
});

settingsRouter.put("/hours/:id", async (request, response) => {
    const userId = request.authUser?.userId;
    const hoursId = Number(request.params.id);
    const parsed = availabilitySchema.safeParse(request.body);

    if (!userId) {
        return response.status(401).json({ message: "Please log in." });
    }

    if (!Number.isInteger(hoursId) || hoursId <= 0) {
        return response.status(400).json({
            message: "Invalid hours ID.",
        });
    }

    if (!parsed.success) {
        return response.status(400).json({
            message: "Please check the opening hours.",
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

        const input = parsed.data;

        const updated = await db
            .update(availability)
            .set({
                isOpen: input.isOpen,
                startTime: input.startTime,
                endTime: input.endTime,
            })
            .where(
                and(
                    eq(availability.id, hoursId),
                    eq(availability.businessId, businessId)
                )
            );

        if (updated[0].affectedRows === 0) {
            return response.status(404).json({
                message: "Opening-hours row not found.",
            });
        }

        return response.json({
            message: "Opening hours updated.",
        });
    } catch (error) {
        console.error("Update hours error:", error);
        return response.status(500).json({
            message: "Unable to update opening hours.",
        });
    }
});