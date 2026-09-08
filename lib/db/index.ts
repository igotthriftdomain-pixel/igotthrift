import fs from "node:fs";
import path from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta?: Record<string, unknown>;
}

export interface D1ExecResult {
  success: boolean;
  meta?: {
    changes?: number;
    duration?: number;
    [key: string]: unknown;
  };
}

export interface D1PreparedStatement {
  bind(...params: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1ExecResult>;
  readonly sql?: string;
  readonly params?: unknown[];
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

interface SqliteDatabaseSync {
  prepare(sql: string): {
    get(...params: unknown[]): Record<string, unknown> | undefined;
    all(...params: unknown[]): unknown[];
    run(...params: unknown[]): { changes: number | bigint };
  };
  exec(sql: string): void;
}

class LocalPreparedStatement implements D1PreparedStatement {
  constructor(
    private sqliteDb: SqliteDatabaseSync,
    public readonly sql: string,
    public readonly params: unknown[] = []
  ) {}

  bind(...params: unknown[]): D1PreparedStatement {
    return new LocalPreparedStatement(this.sqliteDb, this.sql, params);
  }

  async first<T = unknown>(colName?: string): Promise<T | null> {
    const stmt = this.sqliteDb.prepare(this.sql);
    const row = stmt.get(...this.params);
    if (!row) return null;
    if (colName) {
      return (row[colName] ?? null) as T;
    }
    return row as T;
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    const stmt = this.sqliteDb.prepare(this.sql);
    const results = stmt.all(...this.params) as T[];
    return {
      results,
      success: true,
    };
  }

  async run(): Promise<D1ExecResult> {
    const stmt = this.sqliteDb.prepare(this.sql);
    const info = stmt.run(...this.params);
    return {
      success: true,
      meta: {
        changes: Number(info.changes),
      },
    };
  }
}

class LocalD1Database implements D1Database {
  constructor(private sqliteDb: SqliteDatabaseSync) {}

  prepare(query: string): D1PreparedStatement {
    return new LocalPreparedStatement(this.sqliteDb, query);
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    this.sqliteDb.exec("BEGIN IMMEDIATE");
    try {
      const results: D1Result<T>[] = [];
      for (const stmt of statements) {
        const res = await stmt.all<T>();
        results.push(res);
      }
      this.sqliteDb.exec("COMMIT");
      return results;
    } catch (err) {
      this.sqliteDb.exec("ROLLBACK");
      throw err;
    }
  }
}

let localDbInstance: LocalD1Database | null = null;

function findWranglerSqliteFile(): string | null {
  const d1Dir = path.join(process.cwd(), ".wrangler", "state", "v3", "d1", "miniflare-D1DatabaseObject");
  if (!fs.existsSync(d1Dir)) return null;
  const files = fs.readdirSync(d1Dir);
  const sqliteFile = files.find((f) => f.endsWith(".sqlite") && f !== "metadata.sqlite");
  if (sqliteFile) {
    return path.join(d1Dir, sqliteFile);
  }
  return null;
}

export function getDb(): D1Database {
  // 1. Try retrieving Cloudflare D1 database binding via @opennextjs/cloudflare context
  try {
    const { env } = getCloudflareContext();
    if (env && (env as unknown as Record<string, D1Database>).DB) {
      return (env as unknown as Record<string, D1Database>).DB;
    }
  } catch {
    // Ignore error when called outside of Cloudflare request context
  }

  // 2. Check for Cloudflare D1 environment binding across Workers global objects
  const cloudflareDb =
    (process.env as unknown as Record<string, D1Database>).DB ||
    (globalThis as unknown as Record<string, D1Database>).DB ||
    ((globalThis as unknown as Record<string, Record<string, D1Database>>).__env__?.DB) ||
    ((globalThis as unknown as Record<string, Record<string, D1Database>>).env?.DB);

  if (cloudflareDb) {
    return cloudflareDb;
  }

  // 2. Fallback to local SQLite instance for local Node.js / next dev mode
  if (!localDbInstance) {
    try {
      // Dynamic eval require to prevent bundling node:sqlite into Cloudflare Worker bundle
      // eslint-disable-next-line no-eval
      const req = eval("require");
      const sqliteModule = req("node:sqlite");
      const dbPath = findWranglerSqliteFile();
      let sqliteDb: SqliteDatabaseSync;
      if (dbPath && fs.existsSync(dbPath)) {
        sqliteDb = new sqliteModule.DatabaseSync(dbPath);
      } else {
        const fallbackDir = path.join(process.cwd(), "d1");
        if (!fs.existsSync(fallbackDir)) {
          fs.mkdirSync(fallbackDir, { recursive: true });
        }
        sqliteDb = new sqliteModule.DatabaseSync(path.join(fallbackDir, "local.sqlite"));
      }
      // Enable foreign keys
      sqliteDb.exec("PRAGMA foreign_keys = ON;");
      localDbInstance = new LocalD1Database(sqliteDb);
    } catch (err) {
      console.error("Local SQLite initialization error:", err);
      throw new Error("D1 database binding missing and local SQLite unavailable.");
    }
  }

  return localDbInstance;
}
