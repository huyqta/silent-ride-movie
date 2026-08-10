/**
 * Cloudflare D1 type definitions
 * Source: https://developers.cloudflare.com/d1/platform/client-api/
 */

declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    dump(): Promise<ArrayBuffer>;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
    exec(query: string): Promise<D1ExecResult>;
  }

  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    first<T = unknown>(colName?: string): Promise<T | null>;
    run(): Promise<D1Response>;
    all<T = unknown>(): Promise<D1Result<T>>;
    raw<T = unknown[]>(): Promise<T[]>;
  }

  interface D1Result<T = unknown> {
    results: T[];
    success: boolean;
    meta: {
      duration: number;
      size_after: number;
      rows_read: number;
      rows_written: number;
    };
  }

  interface D1Response {
    success: boolean;
    meta: {
      duration: number;
      changes: number;
      last_row_id: number;
      rows_read: number;
      rows_written: number;
    };
  }

  interface D1ExecResult {
    count: number;
    duration: number;
  }
}

export {};
