"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";

interface AssetData {
  id: string;
  type: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  publicUrl: string | null;
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
  assets,
  allTags,
  clientId,
  currentType,
  currentTag,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const displayAssets = assets.filter((a) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      a.filename.toLowerCase().includes(query) ||
      a.aiTags.some((t) => t.toLowerCase().includes(query)) ||
      a.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      setUploadProgress(`Uploading ${file.name}…`);
      try {
        // 1. Get presigned URL
        const presignRes = await fetch("/api/upload/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            clientId,
          }),
        });
        const presignData = await presignRes.json() as {
          uploadUrl: string;
          storageKey: string;
          assetId: string;
          publicUrl: string;
          devMode?: boolean;
          error?: string;
        };
        if (!presignRes.ok) throw new Error(presignData.error ?? "Presign failed");

        if (!presignData.devMode) {
          // 2. Upload to R2 via presigned URL
          await fetch(presignData.uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          });
        }

        setUploadProgress(`Uploaded ${file.name} ✓`);
      } catch (e) {
        setError(`Failed to upload ${file.name}: ${(e as Error).message}`);
      }
    }

    setUploading(false);
    setUploadProgress(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Upload area */}
      <Card>
        <CardContent>
          <div
            className="relative flex flex-col items-center justify-center rounded-xl py-8 transition cursor-pointer"
            style={{
              border: "2px dashed var(--border-soft)",
              background: "var(--bg-subtle)",
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files);
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)" }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {uploading ? uploadProgress : "Drop files here or click to upload"}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
              Images, videos, documents, audio · Auto-tagged by AI
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--brand-danger)/10", color: "var(--brand-danger)", border: "1px solid var(--brand-danger)/20" }}>
          {error}
        </div>
      )}

      {/* Search + tag filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assets…"
          className="flex-1 min-w-[200px] rounded-xl px-3 py-2 text-sm outline-none"
          style={{ border: "1px solid var(--border-soft)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
        />
        {allTags.slice(0, 10).map((t) => (
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

      {/* Asset grid */}
      {displayAssets.length === 0 ? (
        <div className="py-16 text-center" style={{ color: "var(--text-muted)" }}>
          <p className="text-sm">No assets yet. Upload some files to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayAssets.map((asset) => (
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
                {(asset.aiTags.length > 0 || asset.tags.length > 0) && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
