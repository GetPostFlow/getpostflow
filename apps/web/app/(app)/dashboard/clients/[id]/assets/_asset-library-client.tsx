"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AssetUploader from "@/components/asset-uploader";

interface AssetData {
  id: string;
  type: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  publicUrl: string | null;
  source: string;
  aiTags: string[];
  tags: string[];
  createdAt: string;
}

interface Props {
  assets: AssetData[];
  allTags: string[];
  clientId: string;
  currentType: string | null;
  currentTag: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const SOURCE_LABELS: Record<string, string> = {
  intake_upload: "From intake",
  portal_upload: "From client",
  agency_upload: "Agency",
  generated: "AI-generated",
};

const SOURCE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  intake_upload: { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  portal_upload: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
  agency_upload: { bg: "#faf5ff", text: "#7c3aed", border: "#ddd6fe" },
  generated: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
};

function AssetIcon({ type }: { type: string }) {
  if (type === "image") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)" }}>
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "video") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)" }}>
        <rect x="2" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17 9l5-3v12l-5-3V9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "audio") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)" }}>
        <path d="M9 18V6l12-2v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)" }}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function AssetLibraryClient({
  assets: initialAssets,
  allTags,
  clientId,
  currentType,
  currentTag,
}: Props) {
  const router = useRouter();
  const [showUploader, setShowUploader] = useState(false);
  const [assets, setAssets] = useState<AssetData[]>(initialAssets);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const displayAssets = assets.filter((a) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      a.filename.toLowerCase().includes(query) ||
      a.aiTags.some((t) => t.toLowerCase().includes(query)) ||
      a.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  async function handleDelete(assetId: string) {
    if (!confirm("Delete this asset? This cannot be undone.")) return;
    setDeletingId(assetId);
    try {
      const res = await fetch(`/api/assets/${assetId}`, { method: "DELETE" });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== assetId));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Upload button + search */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowUploader((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          style={{ background: "var(--brand-primary)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {showUploader ? "Cancel Upload" : "Upload Asset"}
        </button>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assets…"
          className="flex-1 min-w-[200px] rounded-xl px-3 py-2 text-sm outline-none"
          style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
        />
        {allTags.slice(0, 8).map((t) => (
          <Link
            key={t}
            href={currentTag === t ? `/dashboard/clients/${clientId}/assets` : `/dashboard/clients/${clientId}/assets?tag=${encodeURIComponent(t)}`}
            className="rounded-full px-2.5 py-1 text-xs font-medium transition hover:opacity-80"
            style={{
              background: currentTag === t ? "var(--brand-primary)" : "var(--bg-surface)",
              color: currentTag === t ? "white" : "var(--text-secondary)",
              border: currentTag === t ? "none" : "1px solid var(--border-soft)",
            }}
          >
            {t}
          </Link>
        ))}
      </div>

      {/* Uploader panel */}
      {showUploader && (
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: "var(--border-soft)", background: "var(--bg-subtle)" }}
        >
          <AssetUploader
            clientId={clientId}
            source="agency_upload"
            authMode="dashboard"
            onUploaded={(uploaded) => {
              setAssets((prev) => [
                {
                  id: uploaded.id,
                  type: uploaded.contentType.startsWith("image/")
                    ? "image"
                    : uploaded.contentType.startsWith("video/")
                    ? "video"
                    : uploaded.contentType.startsWith("audio/")
                    ? "audio"
                    : "document",
                  filename: uploaded.filename,
                  mimeType: uploaded.contentType,
                  sizeBytes: uploaded.sizeBytes,
                  storageKey: uploaded.key,
                  publicUrl: uploaded.publicUrl,
                  source: "agency_upload",
                  aiTags: [],
                  tags: [],
                  createdAt: new Date().toISOString(),
                },
                ...prev,
              ]);
              setShowUploader(false);
            }}
          />
        </div>
      )}

      {/* Asset grid */}
      {displayAssets.length === 0 ? (
        <div className="py-16 text-center" style={{ color: "var(--text-muted)" }}>
          <p className="text-sm">No assets yet. Upload some files to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayAssets.map((asset) => {
            const sourceColor = SOURCE_COLORS[asset.source] ?? SOURCE_COLORS["agency_upload"];
            return (
              <div
                key={asset.id}
                className="group relative rounded-xl overflow-hidden transition hover:ring-2 hover:ring-[var(--brand-primary)]"
                style={{
                  border: "1px solid var(--border-soft)",
                  background: "var(--bg-surface)",
                }}
              >
                {/* Thumbnail */}
                <div
                  className="flex items-center justify-center"
                  style={{ background: "var(--bg-subtle)", height: 100 }}
                >
                  {asset.type === "image" && asset.publicUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.publicUrl}
                      alt={asset.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <AssetIcon type={asset.type} />
                  )}
                </div>
                {/* Info */}
                <div className="p-2">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {asset.filename}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {formatBytes(asset.sizeBytes)}
                  </p>
                  {/* Source badge */}
                  <span
                    className="mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                    style={{
                      background: sourceColor.bg,
                      color: sourceColor.text,
                      border: `1px solid ${sourceColor.border}`,
                    }}
                  >
                    {SOURCE_LABELS[asset.source] ?? asset.source}
                  </span>
                  {(asset.aiTags.length > 0 || asset.tags.length > 0) && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {[...asset.aiTags.slice(0, 2), ...asset.tags.slice(0, 1)].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-1.5 py-0.5 text-[10px]"
                          style={{ background: "var(--brand-primary)10", color: "var(--brand-primary)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Delete button (hover) */}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleDelete(asset.id); }}
                  disabled={deletingId === asset.id}
                  title="Delete asset"
                  className="absolute top-1.5 right-1.5 hidden group-hover:flex items-center justify-center rounded-full w-6 h-6 transition"
                  style={{ background: "rgba(0,0,0,0.6)" }}
                >
                  {deletingId === asset.id ? (
                    <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25" />
                      <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
