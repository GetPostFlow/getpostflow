import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createDb } from "@getpostflow/db";
import { orgs, clients } from "@getpostflow/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId, orgId } = await auth();
  
  const db = createDb(process.env.DATABASE_URL!);
  
  // Find org by clerkOrgId
  const [org] = orgId 
    ? await db.select().from(orgs).where(eq(orgs.clerkOrgId, orgId)).limit(1)
    : [];
    
  // Count clients for this org
  const clientCount = org 
    ? (await db.select().from(clients).where(eq(clients.orgId, org.id))).length
    : 0;
    
  // List all orgs for debugging
  const allOrgs = await db.select({ id: orgs.id, name: orgs.name, clerkOrgId: orgs.clerkOrgId }).from(orgs);
  
  return NextResponse.json({
    userId,
    orgId,
    resolvedOrg: org ? { id: org.id, name: org.name, clerkOrgId: org.clerkOrgId } : null,
    clientCount,
    allOrgs,
    timestamp: new Date().toISOString(),
  });
}
