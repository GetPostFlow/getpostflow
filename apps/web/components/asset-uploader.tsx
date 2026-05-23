"use client";

import { useState, useRef, useCallback } from "react";

export type AssetUploaderAuthMode = "dashboard" | "portal";

interface UploadedAsset {
  id: string;
  filename: string;
  key: string;
  publicUrl: string;
  contentType: string;
  sizeBytes: number;
}

interface Props {
  clientId: string;
  source: "intake_upload" | "portal_upload" | "agency_upload";
  onUploaded?: (asset: UploadedAsset) => void;
  accept?: string;
  /** "dashboard" uses Clerk-authed /api/assets/upload endpoint.
   *  "portal" uses token-based /api/portal/assets/upload endpoint. */
  authMode?: AssetUploaderAuthMode;
  /** Required when authMode="portal" */
  portalToken?: string;
  /** Required when authMode="portal" */
  orgSlug?: string;
  /** Required when authMode="portal" */
  clientSlug?: string;
}

interface FileProgress {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AssetUploader({
  clientId,
  source,
  onUploaded,
  accept = "image/*,video/*,audio/*,.pdf,.doc,.docx",
  authMode = "dashboard",
  portalToken,
  orgSlug,
  clientSlug,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<FileProgress[]>([]);

  const uploadFile = useCallback(
    async (file: File) => {
      setFiles((prev) =>
        prev.map((f) => (f.file === file ? { ...f, status: "uploading" as const } : f))
      );

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("source", source);

        let endpoint: string;
        if (authMode === "portal") {
          endpoint = "/api/portal/assets/upload";
          formData.append("token", portalToken ?? "");
          formData.append("orgSlug", orgSlug ?? "");
          formData.append("clientSlug", clientSlug ?? "");
        } else {
          endpoint = "/api/assets/upload";
          if (clientId) formData.append("clientId", clientId);
        }

        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? `Upload failed (${res.status})`);
        }

        const { asset } = (await res.json()) as {
          asset: {
            id: string;
            filename: string;
            storageKey: string;
            publicUrl: string;
            mimeType: string;
            sizeBytes: number;
          };
        };

        setFiles((prev) =>
          prev.map((f) => (f.file === file ? { ...f, status: "done" as const } : f))
        );

        onUploaded?.({
          id: asset.id,
          filename: asset.filename ?? file.name,
          key: asset.storageKey,
          publicUrl: asset.publicUrl ?? "",
          contentType: asset.mimeType ?? file.type,
          sizeBytes: asset.sizeBytes ?? file.size,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        setFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, status: "error" as const, error: msg } : f
          )
        );
      }
    },
    [authMode, clientId, clientSlug, onUploaded, orgSlug, portalToken, source]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const newFiles: FileProgress[] = Array.from(fileList).map((f) => ({
        file: f,
        status: "pending" as const,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      newFiles.forEach((fp) => uploadFile(fp.file));
    },
    [uploadFile]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        style={{
          border: `2px dashed ${dragging ? "#2F5D62" : "#d1d5db"}`,
          borderRadius: 12,
          padding: "32px 24px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "#f0fdf4" : "#f9fafb",
          transition: "all 0.15s",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "#6b7280", display: "inline-block" }}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 4 }}>
          Drop files here or click to browse
        </p>
        <p style={{ fontSize: 12, color: "#9ca3af" }}>
          Images, videos, documents, audio
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {files.map((fp, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                background:
                  fp.status === "done"
                    ? "#f0fdf4"
                    : fp.status === "error"
                    ? "#fef2f2"
                    : "#f9fafb",
                border: `1px solid ${
                  fp.status === "done"
                    ? "#bbf7d0"
                    : fp.status === "error"
                    ? "#fecaca"
                    : "#e5e7eb"
                }`,
              }}
            >
              <span style={{ flex: 1, fontSize: 13, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {fp.file.name}
              </span>
              <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>
                {formatBytes(fp.file.size)}
              </span>
              <span style={{ fontSize: 12, flexShrink: 0, color: fp.status === "done" ? "#16a34a" : fp.status === "error" ? "#dc2626" : "#9ca3af" }}>
                {fp.status === "uploading" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ display: "inline", animation: "spin 1s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                  </svg>
                )}
                {fp.status === "done" && "✓ Uploaded"}
                {fp.status === "error" && (fp.error ?? "Error")}
                {fp.status === "pending" && "Queued"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
