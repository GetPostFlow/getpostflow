import { notFound } from "next/navigation";
import { requireOrgAuth } from "@/lib/auth-org";
import { createDb } from "@getpostflow/db";
import { assets, clients } from "@getpostflow/db";
import { eq, and, desc, or } from "drizzle-orm";
import Link from "next/link";
import AssetLibraryClient from "./_asset-library-client";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; tag?: string }>;
}

export default async function AssetLibraryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { type, tag } = await searchParams;

  const { orgRow: org } = await requireOrgAuth();

  const db = createDb(process.env.DATABASE_URL!);

  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const [client] = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(
      and(
        UUID_RE.test(id) ? eq(clients.id, id) : eq(clients.slug, id),
        eq(clients.orgId, org.id)
      )
    )
    .limit(1);
  if (!client) notFound();

  const allAssets = await db
    .select()
    .from(assets)
    .where(and(eq(assets.orgId, org.id), eq(assets.clientId, client.id)))
    .orderBy(desc(assets.createdAt))
    .limit(200);

  // Collect all unique tags
  const allTags = Array.from(
    new Set(
      allAssets.flatMap((a) => [
        ...((a.aiTags as string[]) ?? []),
        ...((a.tags as string[]) ?? []),
      ])
    )
  ).sort();

  // Filter on server side (can be moved to SQL for scale)
  const filtered = allAssets.filter((a) => {
    if (type && a.type !== type) return false;
    if (tag) {
      const allItemTags = [...((a.aiTags as string[]) ?? []), ...((a.tags as string[]) ?? [])];
      if (!allItemTags.includes(tag)) return false;
    }
    return true;
  });

  const counts = {
    image: allAssets.filter((a) => a.type === "image").length,
    video: allAssets.filter((a) => a.type === "video").length,
    document: allAssets.filter((a) => a.type === "document").length,
    audio: allAssets.filter((a) => a.type === "audio").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/clients/${id}`}
            className="flex items-center gap-1 text-sm transition hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {client.name}
          </Link>
          <span style={{ color: "var(--border-soft)" }}>/</span>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Asset Library
          </h1>
        </div>
      </div>

      {/* Type counts */}
      <div className="grid grid-cols-4 gap-3">
        {(
          [
            { key: "image", label: "Images", icon: "🖼" },
            { key: "video", label: "Videos", icon: "🎬" },
            { key: "document", label: "Documents", icon: "📄" },
            { key: "audio", label: "Audio", icon: "🎵" },
          ] as const
        ).map(({ key, label, icon }) => (
          <Link
            key={key}
            href={`/dashboard/clients/${id}/assets?type=${key}`}
            className="rounded-xl p-3 text-center transition hover:opacity-80"
            style={{
              background: type === key ? "var(--brand-primary)10" : "var(--bg-surface)",
              border: `1px solid ${type === key ? "var(--brand-primary)40" : "var(--border-soft)"}`,
            }}
          >
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {counts[key]}
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
          </Link>
        ))}
      </div>

      <AssetLibraryClient
        assets={filtered.map((a) => ({
          id: a.id,
          type: a.type,
          filename: a.filename ?? "Untitled",
          mimeType: a.mimeType ?? "",
          sizeBytes: a.sizeBytes ?? 0,
          storageKey: a.storageKey,
          publicUrl: a.publicUrl ?? null,
          source: (a.source as string) ?? "agency_upload",
          aiTags: (a.aiTags as string[]) ?? [],
          tags: (a.tags as string[]) ?? [],
          createdAt: a.createdAt.toISOString(),
        }))}
        allTags={allTags}
        clientId={client.id}
        currentType={type ?? null}
        currentTag={tag ?? null}
      />
    </div>
  );
}
