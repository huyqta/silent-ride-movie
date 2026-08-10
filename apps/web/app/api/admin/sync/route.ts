/**
 * Admin sync API route
 * POST /api/admin/sync?source=ophim&token=SECRET&limit=500&page=1
 *
 * Query params:
 * - source: 'ophim' | 'nguonc' | 'kkphim' | 'all' (required)
 * - token: admin secret token (required)
 * - limit: số phim tối đa mỗi lần sync (optional, default: 0 = all)
 * - page: trang API cần fetch (optional, default: 1)
 *
 * Response: { success: true, results: {...}, timing: {...} }
 */

import { NextRequest, NextResponse } from "next/server";
import { syncSingleSource, syncAllSources } from "@/lib/movies/sync";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Auth check
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const ADMIN_TOKEN = process.env.ADMIN_SYNC_TOKEN;

    if (!ADMIN_TOKEN) {
      return NextResponse.json(
        { success: false, error: "ADMIN_SYNC_TOKEN not configured" },
        { status: 500 }
      );
    }

    if (token !== ADMIN_TOKEN) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get D1 binding — hỗ trợ cả Cloudflare runtime và local dev
    let db: D1Database | undefined;

    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = getCloudflareContext();
      db = (ctx.env as Record<string, unknown>)?.DB as D1Database | undefined;
    } catch {
      // Không phải Cloudflare runtime (ví dụ: next dev thông thường)
      db = undefined;
    }

    if (!db) {
      return NextResponse.json(
        {
          success: false,
          error:
            "D1 binding not available. Để test local, dùng: npx wrangler pages dev .open-next --d1=DB=silent-ride-movies",
        },
        { status: 503 }
      );
    }

    // 3. Parse params
    const source = searchParams.get("source") as "ophim" | "nguonc" | "kkphim" | "all" | null;
    const limit = Number.parseInt(searchParams.get("limit") || "0", 10);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    // pages=N: fetch N pages liên tiếp bắt đầu từ `page`
    // pages=0: fetch toàn bộ đến hết
    // pages không set: chỉ fetch đúng 1 page (dùng limit để slice)
    const pagesParam = searchParams.get("pages");
    const pages = pagesParam !== null ? Number.parseInt(pagesParam, 10) : undefined;

    if (!source || !["ophim", "nguonc", "kkphim", "all"].includes(source)) {
      return NextResponse.json(
        { success: false, error: "Invalid source. Must be: ophim, nguonc, kkphim, or all" },
        { status: 400 }
      );
    }

    // 4. Execute sync
    let results;
    if (source === "all") {
      results = await syncAllSources(db, { limit, page, pages });
    } else {
      const r = await syncSingleSource(db, source, { limit, page, pages });
      results = { [source]: r.count, pagesProcessed: r.pagesProcessed, errors: r.errors };
    }

    const endTime = Date.now();

    return NextResponse.json({
      success: true,
      source,
      results,
      timing: {
        duration_ms: endTime - startTime,
        limit,
        page,
        pages: pages ?? 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Allow OPTIONS for CORS if needed
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
