import { db } from "@getpostflow/db";
import { eq } from "drizzle-orm";
import { brandKitTable } from "@getpostflow/db/schema";
import { getOrgFromAuth } from "@getpostflow/auth/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Content Library",
  description: "Manage brand assets and content templates",
};

export default async function ContentLibraryPage() {
  const org = await getOrgFromAuth();
  if (!org) redirect("/");

  const brandKits = await db
    .select()
    .from(brandKitTable)
    .where(eq(brandKitTable.orgId, org.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage brand assets, logos, and content templates
        </p>
      </div>

      <div className="grid gap-6">
        {/* Brand Assets Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Brand Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandKits.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No brand assets uploaded yet</p>
              </div>
            ) : (
              brandKits.map((kit) => (
                <div key={kit.id} className="rounded-lg border border-border bg-secondary p-4">
                  <div className="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Asset Preview</span>
                  </div>
                  <p className="font-medium text-sm">{kit.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {kit.clientId ? "Client Kit" : "Agency Kit"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Content Templates Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Content Templates</h2>
          <div className="space-y-3">
            <div className="p-4 bg-secondary rounded-lg border border-border">
              <p className="font-medium text-sm">Social Media Post Template</p>
              <p className="text-xs text-muted-foreground mt-1">
                Standard format for Instagram, Facebook, and LinkedIn
              </p>
            </div>
            <div className="p-4 bg-secondary rounded-lg border border-border">
              <p className="font-medium text-sm">Story Template</p>
              <p className="text-xs text-muted-foreground mt-1">
                Vertical format for Instagram and Facebook Stories
              </p>
            </div>
            <div className="p-4 bg-secondary rounded-lg border border-border">
              <p className="font-medium text-sm">Video Thumbnail Template</p>
              <p className="text-xs text-muted-foreground mt-1">
                Standard dimensions for YouTube and TikTok
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
