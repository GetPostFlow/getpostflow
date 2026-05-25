import { createDb, clients } from "@getpostflow/db";
import { eq } from "drizzle-orm";
import { requireOrgAuth } from "@/lib/auth-org";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ContentLibraryPage() {
  const { orgRow } = await requireOrgAuth();
  if (!orgRow) redirect("/sign-in");

  const db = createDb();

  const allClients = await db
    .select()
    .from(clients)
    .where(eq(clients.orgId, orgRow.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Content Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage assets and media for all your clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allClients.map((client: any) => (
          <div key={client.id} className="p-6 bg-card border border-border rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                {client.name.charAt(0)}
              </div>
              <h3 className="font-semibold">{client.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground">Assets: Logo, Brand Kit, 24 Images</p>
            <Link 
              href={`/dashboard/clients/${client.id}/assets`}
              className="block w-full py-2 text-center text-xs font-medium border border-border rounded-lg hover:bg-secondary/50"
            >
              View Assets
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
