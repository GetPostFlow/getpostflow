/**
 * Cloudflare R2 helper module.
 * Provides signed URL generation and object deletion using the AWS SDK.
 */
import {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT ?? process.env.R2_PUBLIC_URL;
const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? process.env.R2_BUCKET ?? "getpostflow-assets";
const ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? process.env.R2_SECRET_ACCESS_KEY;

export const R2_CONFIGURED = !!(ENDPOINT && ACCESS_KEY && SECRET_KEY);

export function getClient(): S3Client {
  if (!ENDPOINT || !ACCESS_KEY || !SECRET_KEY) {
    throw new Error("R2 credentials not configured");
  }
  return new S3Client({
    region: "auto",
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
  });
}

export async function getUploadSignedUrl({
  key,
  contentType,
  expiresIn = 3600,
}: {
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<{ url: string; key: string; expiresIn: number }> {
  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  // Sign including content-type header so R2 enforces it
  const url = await getSignedUrl(client, command, {
    expiresIn,
    signableHeaders: new Set(["content-type"]),
  });
  return { url, key, expiresIn };
}

export async function getReadSignedUrl(
  key: string,
  expiresIn = 900
): Promise<string> {
  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn });
}

export async function deleteObject(key: string): Promise<void> {
  const client = getClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export async function objectExists(key: string): Promise<boolean> {
  const client = getClient();
  try {
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export function buildStorageKey(orgId: string, filename: string): string {
  const ext = filename.split(".").pop() ?? "bin";
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  return `assets/${orgId}/${ts}-${rand}.${ext}`;
}

export function buildPublicUrl(key: string): string {
  if (!ENDPOINT) return `https://cdn.getpostflow.dev/${key}`;
  return `${ENDPOINT}/${BUCKET}/${key}`;
}
