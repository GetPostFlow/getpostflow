import { createDb } from "@getpostflow/db";
import { eq } from "drizzle-orm";
import { brandKits } from "@getpostflow/db";
import { auth } from "@getpostflow/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Content Library",
  description: "Manage brand assets and content templates",
};

export default async function ContentLibraryPage() {
  const { orgId } = await auth();
  if (!orgId) redirect("/");

  const db = createDb();
  const kits = await db
    .select()
    .from(brandKits)
    .where(eq(brandKits.clerkOrgId, orgId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage brand assets, logos, and content templates
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Brand Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kits.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No brand assets uploaded yet</p>
              </div>
            ) : (
              kits.map((kit: any) => (
                <div key={kit.id} className="rounded-lg border border-border bg-secondary p-4">
                  <div className="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Asset Preview</span>
                  </div>
                  <p className="font-medium text-sm">{kit.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
