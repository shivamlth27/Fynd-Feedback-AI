import { PrismaClient } from "@prisma/client";

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
    return new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
    });
}

export const prisma =
    global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}

