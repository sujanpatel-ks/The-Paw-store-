import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL || "";

const prismaClientSingleton = () => {
  // Configure production-grade connection pooling directly on pg.Pool
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: isProduction ? 10 : undefined,                 // connectionLimit
    connectionTimeoutMillis: isProduction ? 10000 : undefined, // connectionTimeout: 10000ms
    idleTimeoutMillis: isProduction ? 30000 : undefined,       // idleTimeout: 30000ms
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: isProduction ? ["error"] : ["query", "info", "warn", "error"],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (!isProduction) {
  globalThis.prismaGlobal = prisma;
}
