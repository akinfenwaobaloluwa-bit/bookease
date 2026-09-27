import { eq } from "drizzle-orm";
import { businesses } from "../drizzle/schema";
import { db } from "./db";

export async function getOwnedBusinessId(userId: number) {
    const [business] = await db
        .select({ id: businesses.id })
        .from(businesses)
        .where(eq(businesses.ownerId, userId))
        .limit(1);

    return business?.id ?? null;
}