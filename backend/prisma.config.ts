// backend/prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Przeniesiono konfigurację seed tutaj (wymaganie Prisma 7)
    seed: "ts-node prisma/seed.ts", 
  },
  datasource: {
    // Adres bazy musi być jawnie przekazany dla CLI (npx prisma db push)
    url: env("DATABASE_URL"),
  },
});