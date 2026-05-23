import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createDb } from "@getpostflow/db";
import { orgs, clients } from "@getpostflow/db";
import { eq } from "drizzle-orm";

export async function GET() {
  let userId, orgId;
  try {
    const authResult = await auth();
    userId = authResult.userId;
    orgId = authResult.orgId;
  } catch {
    userId = null;
    orgId = null;
  }
  
  const db = createDb(process.env.DATABASE_URL!);
  
  const [org] = orgId 
    ? await db.select().from(orgs).where(eq(orgs.clerkOrgId, orgId)).limit(1)
    : [];
    
  const clientCount = org 
    ? (await db.select().from(clients).where(eq(clients.orgId, org.id))).length
    : 0;
    
  const allOrgs = await db.select({ id: orgs.id, name: orgs.name, clerkOrgId: orgs.clerkOrgId }).from(orgs);
  const allClients = await db.select({ id: clients.id, name: clients.name, orgId: clients.orgId }).from(clients);
  
  return NextResponse.json({
    userId,
    orgId,
    resolvedOrg: org ? { id: org.id, name: org.name, clerkOrgId: org.clerkOrgId } : null,
    clientCount,
    allOrgs,
    allClients,
    timestamp: new Date().toISOString(),
  });
}
