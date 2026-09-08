import fs from "node:fs";
import path from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface R2ObjectLike {
  key: string;
  size: number;
  uploaded: Date;
  httpMetadata?: {
    contentType?: string;
    cacheControl?: string;
  };
}

export interface R2ObjectsLike {
  objects: R2ObjectLike[];
  truncated: boolean;
  cursor?: string;
}

export interface R2BucketLike {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream | string | Blob | Buffer,
    options?: {
      httpMetadata?: {
        contentType?: string;
        cacheControl?: string;
      };
      customMetadata?: Record<string, string>;
    }
  ): Promise<R2ObjectLike | null>;
  get(key: string): Promise<R2ObjectLike | null>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<R2ObjectsLike>;
}

class LocalR2Storage implements R2BucketLike {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), ".wrangler", "state", "v3", "r2", "igotthrift-media");
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private resolvePath(key: string): string {
    const safeKey = key.replace(/^\/+/, "");
    return path.join(this.baseDir, safeKey);
  }

  async put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream | string | Blob | Buffer,
    options?: {
      httpMetadata?: {
        contentType?: string;
        cacheControl?: string;
      };
      customMetadata?: Record<string, string>;
    }
  ): Promise<R2ObjectLike | null> {
    const filePath = this.resolvePath(key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let buffer: Buffer;
    if (Buffer.isBuffer(value)) {
      buffer = value;
    } else if (value instanceof ArrayBuffer) {
      buffer = Buffer.from(value);
    } else if (ArrayBuffer.isView(value)) {
      buffer = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
    } else if (typeof value === "string") {
      buffer = Buffer.from(value, "utf-8");
    } else {
      buffer = Buffer.from(value as unknown as ArrayBuffer);
    }

    fs.writeFileSync(filePath, buffer);

    const stat = fs.statSync(filePath);
    return {
      key,
      size: stat.size,
      uploaded: stat.mtime,
      httpMetadata: options?.httpMetadata,
    };
  }

  async get(key: string): Promise<R2ObjectLike | null> {
    const filePath = this.resolvePath(key);
    if (!fs.existsSync(filePath)) return null;
    const stat = fs.statSync(filePath);
    return {
      key,
      size: stat.size,
      uploaded: stat.mtime,
    };
  }

  async delete(keys: string | string[]): Promise<void> {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    for (const key of keyArray) {
      const filePath = this.resolvePath(key);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // Ignore delete error if file is missing
        }
      }
    }
  }

  async list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<R2ObjectsLike> {
    const prefix = options?.prefix ? options.prefix.replace(/^\/+/, "") : "";
    const results: R2ObjectLike[] = [];

    const walk = (currentDir: string, currentPrefix: string) => {
      if (!fs.existsSync(currentDir)) return;
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relKey = currentPrefix ? `${currentPrefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          walk(fullPath, relKey);
        } else if (entry.isFile()) {
          if (!prefix || relKey.startsWith(prefix)) {
            const stat = fs.statSync(fullPath);
            results.push({
              key: relKey,
              size: stat.size,
              uploaded: stat.mtime,
            });
          }
        }
      }
    };

    walk(this.baseDir, "");
    return {
      objects: results,
      truncated: false,
    };
  }
}

let localStorageInstance: LocalR2Storage | null = null;

export function getStorage(): R2BucketLike {
  try {
    const { env } = getCloudflareContext();
    if (env && (env as unknown as Record<string, R2BucketLike>).STORE_ASSETS) {
      return (env as unknown as Record<string, R2BucketLike>).STORE_ASSETS;
    }
  } catch {
    // Ignore error when called outside of Cloudflare request context
  }

  const cloudflareR2 =
    (process.env as unknown as Record<string, R2BucketLike>).STORE_ASSETS ||
    (globalThis as unknown as Record<string, R2BucketLike>).STORE_ASSETS ||
    ((globalThis as unknown as Record<string, Record<string, R2BucketLike>>).__env__?.STORE_ASSETS);

  if (cloudflareR2) {
    return cloudflareR2;
  }

  if (!localStorageInstance) {
    localStorageInstance = new LocalR2Storage();
  }

  return localStorageInstance;
}

/**
 * Returns the public URL for an asset key.
 */
export function getPublicUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://assets.igotthrift.in";
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanKey = key.replace(/^\/+/, "");
  return `${cleanBase}/${cleanKey}`;
}

/**
 * Maps a MIME type to its clean file extension.
 */
export function getExtensionFromMimeType(contentType: string, originalFilename?: string): string {
  if (originalFilename) {
    const ext = path.extname(originalFilename).replace(/^\./, "").toLowerCase();
    if (ext && ["jpg", "jpeg", "png", "webp", "mp4", "webm", "mov"].includes(ext)) {
      return ext;
    }
  }

  const mimeMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };

  return mimeMap[contentType.toLowerCase()] || "png";
}

/**
 * R2 Upload helper with server authorization verification.
 */
export async function uploadStorageAsset(params: {
  storeId: string;
  pathKey: string;
  buffer: Buffer;
  contentType: string;
}): Promise<{ storagePath: string; publicUrl: string }> {
  // Validate path belongs to store
  if (!params.pathKey.startsWith(`stores/${params.storeId}/`) && !params.pathKey.startsWith(`products/${params.storeId}/`)) {
    throw new Error("Unauthorized storage path");
  }

  const storage = getStorage();
  await storage.put(params.pathKey, params.buffer, {
    httpMetadata: {
      contentType: params.contentType,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  const publicUrl = getPublicUrl(params.pathKey) || params.pathKey;
  return { storagePath: params.pathKey, publicUrl };
}

/**
 * R2 Delete helper with server authorization verification.
 */
export async function removeStorageAsset(storeId: string, pathKey: string): Promise<void> {
  if (!pathKey.startsWith(`stores/${storeId}/`) && !pathKey.startsWith(`products/${storeId}/`)) {
    throw new Error("Unauthorized storage path");
  }

  const storage = getStorage();
  await storage.delete(pathKey);
}

/**
 * R2 Bulk Delete helper with server authorization verification.
 */
export async function removeStorageAssets(storeId: string, pathKeys: string[]): Promise<void> {
  const validKeys = pathKeys.filter(
    (key) => key.startsWith(`stores/${storeId}/`) || key.startsWith(`products/${storeId}/`)
  );
  if (validKeys.length > 0) {
    const storage = getStorage();
    await storage.delete(validKeys);
  }
}
