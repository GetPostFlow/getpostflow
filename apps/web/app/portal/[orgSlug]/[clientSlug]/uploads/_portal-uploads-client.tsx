"use client";

import { useState } from "react";
import AssetUploader from "@/components/asset-uploader";

interface AssetItem {
  id: string;
  filename: string;
  type: string;
  sizeBytes: number;
  publicUrl: string | null;
  source: string;
  createdAt: string;
  folderName?: string | null;
}

interface Props {
  orgSlug: string;
  clientSlug: string;
  token: string;
  existingAssets: AssetItem[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(type: string) {
  if (type === "image") return "🖼";
  if (type === "video") return "🎬";
  if (type === "audio") return "🎵";
  return "📄";
}

export default function PortalUploadsClient({ orgSlug, clientSlug, token, existingAssets }: Props) {
  const [uploaded, setUploaded] = useState<AssetItem[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [folders, setFolders] = useState<string[]>(["Brand Assets", "Promotional Content", "Behind the Scenes"]);

  const allAssets = [...uploaded, ...existingAssets];

  const filteredAssets = activeFolder
    ? allAssets.filter((a) => a.folderName === activeFolder || (!a.folderName && activeFolder === "Uncategorized"))
    : allAssets;

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    setFolders((prev) => [...prev, newFolderName.trim()]);
    setNewFolderName("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Folders */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>Folders</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={handleCreateFolder}
              style={{
                background: "#2F5D62",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + New Folder
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveFolder(null)}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: `1px solid ${activeFolder === null ? "#2F5D62" : "#e5e7eb"}`,
              background: activeFolder === null ? "#2F5D62" : "#fff",
              color: activeFolder === null ? "#fff" : "#374151",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            All Files
          </button>
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: `1px solid ${activeFolder === f ? "#2F5D62" : "#e5e7eb"}`,
                background: activeFolder === f ? "#2F5D62" : "#fff",
                color: activeFolder === f ? "#fff" : "#374151",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              📁 {f}
            </button>
          ))}
        </div>
      </div>

      {/* Uploader */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 24,
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>
          Upload Files
        </p>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
          Drag and drop or click to upload images, videos, documents, or audio files.
        </p>
        <AssetUploader
          clientId=""
          source="portal_upload"
          authMode="portal"
          portalToken={token}
          orgSlug={orgSlug}
          clientSlug={clientSlug}
          onUploaded={(asset) => {
            setUploaded((prev) => [
              {
                id: asset.id,
                filename: asset.filename,
                type: asset.contentType.startsWith("image/")
                  ? "image"
                  : asset.contentType.startsWith("video/")
                  ? "video"
                  : asset.contentType.startsWith("audio/")
                  ? "audio"
                  : "document",
                sizeBytes: asset.sizeBytes,
                publicUrl: asset.publicUrl,
                source: "portal_upload",
                createdAt: new Date().toISOString(),
                folderName: activeFolder ?? null,
              },
              ...prev,
            ]);
          }}
        />
      </div>

      {/* Existing uploads */}
      {filteredAssets.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 16 }}>
            {activeFolder ? `${activeFolder} (${filteredAssets.length})` : `Your Uploads (${filteredAssets.length})`}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #f3f4f6",
                  background: "#f9fafb",
                }}
              >
                {asset.type === "image" && asset.publicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.publicUrl}
                    alt={asset.filename}
                    style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <span style={{ fontSize: 24 }}>{fileIcon(asset.type)}</span>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {asset.filename}
                  </p>
                  <p style={{ fontSize: 11, color: "#9ca3af" }}>
                    {formatBytes(asset.sizeBytes)} · {new Date(asset.createdAt).toLocaleDateString()}
                    {asset.folderName ? ` · ${asset.folderName}` : ""}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    background: "#f0fdf4",
                    color: "#16a34a",
                    borderRadius: 999,
                    padding: "2px 8px",
                    border: "1px solid #bbf7d0",
                    flexShrink: 0,
                  }}
                >
                  Uploaded
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
