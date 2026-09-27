import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

const sessionCookieName = "bookease_session";

function getSessionSecret(): string {
    const secret = process.env.SESSION_SECRET;

    if (!secret) {
        throw new Error("SESSION_SECRET is missing from .env");
    }

    return secret;
}

export type SessionUser = {
    userId: number;
    email: string;
};

type AuthenticatedRequest = Request & {
    authUser?: SessionUser;
};

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(
    password: string,
    passwordHash: string
) {
    return bcrypt.compare(password, passwordHash);
}

export function createSessionToken(user: SessionUser) {
    const secret = getSessionSecret();

    return jwt.sign(user, secret, {
        expiresIn: 604800,
    });
}

export function readSessionUser(
    request: Request
): SessionUser | null {
    const token = request.cookies?.[sessionCookieName];

    if (!token) {
        return null;
    }

    try {
        const secret = getSessionSecret();

        return jwt.verify(
            token,
            secret
        ) as unknown as SessionUser;
    } catch {
        return null;
    }
}

export function setSessionCookie(
    response: Response,
    user: SessionUser
) {
    response.cookie(
        sessionCookieName,
        createSessionToken(user),
        {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }
    );
}

export function clearSessionCookie(response: Response) {
    response.clearCookie(sessionCookieName);
}

export function requireSession(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const user = readSessionUser(request);

    if (!user) {
        return response.status(401).json({
            message: "Please log in.",
        });
    }

    const authenticatedRequest =
        request as AuthenticatedRequest;

    authenticatedRequest.authUser = user;

    next();
}
