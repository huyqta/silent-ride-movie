/**
 * GET /api/movies
 * Query params: page, limit, q (search), type, category (slug), country (slug)
 */

import { NextRequest, NextResponse } from "next/server";
import type { D1Movie } from "@/types/normalized";

async function getDB(): Promise<D1Database | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    return (ctx.env as Record<string, unknown>)?.DB as D1Database | undefined;
  } catch {
    return undefined;
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    if (!db) {
      return NextResponse.json({ success: false, error: "D1 binding not found" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const page    = Number.parseInt(searchParams.get("page")  || "1",  10);
    const limit   = Math.min(Number.parseInt(searchParams.get("limit") || "24", 10), 100);
    const q       = searchParams.get("q");
    const type    = searchParams.get("type");
    const category = searchParams.get("category");
    const country  = searchParams.get("country");
    const offset  = (page - 1) * limit;

    // Build WHERE clause dynamically
    const conditions: string[] = [];
    const bindings: unknown[] = [];

    if (q) {
      const searchKey = q.toLowerCase().trim();
      conditions.push("(search_key LIKE ? OR title LIKE ?)");
      bindings.push(`%${searchKey}%`, `%${q}%`);
    }
    if (type) {
      conditions.push("type = ?");
      bindings.push(type);
    }
    if (category) {
      // JSON contains search — tìm slug trong categories JSON string
      conditions.push("categories LIKE ?");
      bindings.push(`%"slug":"${category}"%`);
    }
    if (country) {
      conditions.push("countries LIKE ?");
      bindings.push(`%"slug":"${country}"%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [moviesResult, countResult] = await Promise.all([
      db.prepare(
        `SELECT * FROM movies ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`
      ).bind(...bindings, limit, offset).all<D1Movie>(),
      db.prepare(
        `SELECT COUNT(*) as count FROM movies ${where}`
      ).bind(...bindings).first<{ count: number }>(),
    ]);

    const totalItems = countResult?.count ?? 0;

    return NextResponse.json({
      success: true,
      items: moviesResult.results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit) || 1,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
