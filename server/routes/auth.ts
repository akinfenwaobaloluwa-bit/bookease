import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { businesses, users } from "../../drizzle/schema";
import { db } from "../db";
import {
    clearSessionCookie,
    comparePassword,
    hashPassword,
    readSessionUser,
    setSessionCookie,
} from "../auth";

const registerSchema = z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(160),
    password: z.string().min(8).max(100),
    businessName: z.string().trim().min(2).max(120),
});

const loginSchema = z.object({
    email: z.string().trim().email().max(160),
    password: z.string().min(1).max(100),
});

export const authRouter = Router();

authRouter.post("/register", async (request, response) => {
    const parsed = registerSchema.safeParse(request.body);

    if (!parsed.success) {
        return response.status(400).json({
            message: "Enter a name, valid email, password of at least 8 characters, and business name.",
        });
    }

    try {
        const input = parsed.data;
        const email = input.email.toLowerCase();
        const [existing] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existing) {
            return response.status(409).json({ message: "An account already uses this email." });
        }

        const passwordHash = await hashPassword(input.password);

        const result = await db.transaction(async (transaction) => {
            const insertedUser = await transaction
                .insert(users)
                .values({ name: input.name, email, passwordHash })
                .$returningId();

            const userId = insertedUser[0].id;
            const slug = input.businessName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "") || `business-${userId}`;

            await transaction.insert(businesses).values({
                ownerId: userId,
                name: input.businessName,
                slug: `${slug}-${userId}`,
                description: "",
                whatsappNumber: "",
                primaryColor: "#7c3aed",
            });

            return { userId };
        });

        setSessionCookie(response, { userId: result.userId, email });
        return response.status(201).json({ message: "Account created." });
    } catch (error) {
        console.error("Register error:", error);
        return response.status(500).json({ message: "Unable to create account." });
    }
});

authRouter.post("/login", async (request, response) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
        return response.status(400).json({ message: "Enter a valid email and password." });
    }

    try {
        const email = parsed.data.email.toLowerCase();
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user || !(await comparePassword(parsed.data.password, user.passwordHash))) {
            return response.status(401).json({ message: "Email or password is incorrect." });
        }

        setSessionCookie(response, { userId: user.id, email: user.email });
        return response.json({ message: "Logged in." });
    } catch (error) {
        console.error("Login error:", error);
        return response.status(500).json({ message: "Unable to log in." });
    }
});

authRouter.post("/logout", (_request, response) => {
    clearSessionCookie(response);
    return response.json({ message: "Logged out." });
});

authRouter.get("/me", async (request, response) => {
    const sessionUser = readSessionUser(request);

    if (!sessionUser) {
        return response.status(401).json({ message: "Not logged in." });
    }

    const [user] = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, sessionUser.userId))
        .limit(1);

    if (!user) {
        return response.status(401).json({ message: "Account not found." });
    }

    return response.json({ user });
});