import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
import { decodeAuthHeader, AuthTokenPayload } from "./utils/auth";
import { Request } from "express";

export interface Context {
    prisma: PrismaClient;
    userId?: number;
}

export const context = ({ req }: { req: Request }): Context => {
    const token =
        req && req.headers.authorization
            ? decodeAuthHeader(req.headers.authorization)
            : null;

    return {
        prisma,
        userId: token?.userId,
    };
}
