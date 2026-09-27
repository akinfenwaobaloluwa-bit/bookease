/// <reference path="../express.d.ts" />

import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { services } from "../../drizzle/schema";
import { db } from "../db";
import { requireSession } from "../auth";
import { getOwnedBusinessId } from "../ownerBusiness";

const serviceInputSchema = z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1000).optional(),
    imageUrl: z.string().trim().max(500).optional(),
    price: z.number().int().nonnegative(),
    currency: z.string().trim().min(3).max(5).default("NGN"),
    durationMinutes: z.number().int().positive(),
});

export const servicesRouter = Router();

servicesRouter.use(requireSession);

servicesRouter.get("/", async (request, response) => {
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

        const businessServices = await db
            .select()
            .from(services)
            .where(eq(services.businessId, businessId));

        return response.json(businessServices);
    } catch (error) {
        console.error("List services error:", error);
        return response.status(500).json({
            message: "Unable to load services.",
        });
    }
});

servicesRouter.post("/", async (request, response) => {
    const userId = request.authUser?.userId;
    const parsed = serviceInputSchema.safeParse(request.body);

    if (!userId) {
        return response.status(401).json({ message: "Please log in." });
    }

    if (!parsed.success) {
        return response.status(400).json({
            message: "Please provide a valid service name, price, and duration.",
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

        const inserted = await db
            .insert(services)
            .values({
                businessId,
                name: input.name,
                description: input.description || null,
                imageUrl: input.imageUrl || null,
                price: input.price,
                currency: input.currency,
                durationMinutes: input.durationMinutes,
            })
            .$returningId();

        return response.status(201).json({
            id: inserted[0].id,
            message: "Service created.",
        });
    } catch (error) {
        console.error("Create service error:", error);
        return response.status(500).json({
            message: "Unable to create service.",
        });
    }
});

servicesRouter.put("/:id", async (request, response) => {
    const userId = request.authUser?.userId;
    const serviceId = Number(request.params.id);
    const parsed = serviceInputSchema.safeParse(request.body);

    if (!userId) {
        return response.status(401).json({ message: "Please log in." });
    }

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
        return response.status(400).json({ message: "Invalid service ID." });
    }

    if (!parsed.success) {
        return response.status(400).json({
            message: "Please provide valid service details.",
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
            .update(services)
            .set({
                name: input.name,
                description: input.description || null,
                imageUrl: input.imageUrl || null,
                price: input.price,
                currency: input.currency,
                durationMinutes: input.durationMinutes,
            })
            .where(
                and(
                    eq(services.id, serviceId),
                    eq(services.businessId, businessId)
                )
            );

        if (updated[0].affectedRows === 0) {
            return response.status(404).json({
                message: "Service not found.",
            });
        }

        return response.json({ message: "Service updated." });
    } catch (error) {
        console.error("Update service error:", error);
        return response.status(500).json({
            message: "Unable to update service.",
        });
    }
});

servicesRouter.delete("/:id", async (request, response) => {
    const userId = request.authUser?.userId;
    const serviceId = Number(request.params.id);

    if (!userId) {
        return response.status(401).json({ message: "Please log in." });
    }

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
        return response.status(400).json({
            message: "Invalid service ID.",
        });
    }

    try {
        const businessId = await getOwnedBusinessId(userId);

        if (!businessId) {
            return response.status(403).json({
                message: "No business is linked to this account.",
            });
        }

        const deleted = await db
            .delete(services)
            .where(
                and(
                    eq(services.id, serviceId),
                    eq(services.businessId, businessId)
                )
            );

        if (deleted[0].affectedRows === 0) {
            return response.status(404).json({
                message: "Service not found.",
            });
        }

        return response.json({ message: "Service deleted." });
    } catch (error) {
        console.error("Delete service error:", error);
        return response.status(500).json({
            message: "Unable to delete service.",
        });
    }
});