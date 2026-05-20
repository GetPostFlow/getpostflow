import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export * from "./schema";
export * from "./social-profile-repo";

export function createDb(databaseUrl?: string) {
  const url = databaseUrl ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("[db] DATABASE_URL is not set");
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}
