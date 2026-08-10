/**
 * GET /api/movies/[slug]
 * Chi tiết 1 phim từ D1 với tất cả sources và episodes
 */

import { NextRequest, NextResponse } from "next/server";
import type { D1Movie, D1MovieSource, D1EpisodeServer, NormalizedEpisode } from "@/types/normalized";
import { normalizeTitle } from "@/lib/movies/merge";

async function getDB(): Promise<D1Database | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    return (ctx.env as Record<string, unknown>)?.DB as D1Database | undefined;
  } catch {
    return undefined;
  }
}

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const db = await getDB();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "D1 binding not found" },
        { status: 500 }
      );
    }

    // Normalize slug thành search_key để match
    const searchKey = normalizeTitle(slug.replaceAll("-", " "));

    // 1. Tìm movie
    const movie = await db
      .prepare(`SELECT * FROM movies WHERE search_key LIKE ? LIMIT 1`)
      .bind(`%${searchKey}%`)
      .first<D1Movie>();

    if (!movie) {
      return NextResponse.json(
        { success: false, error: "Movie not found" },
        { status: 404 }
      );
    }

    // 2. Lấy tất cả sources
    const sourcesResult = await db
      .prepare(`SELECT * FROM movie_sources WHERE movie_id = ?`)
      .bind(movie.id)
      .all<Omit<D1MovieSource, "servers">>();

    // 3. Lấy episode servers cho từng source
    const sources = await Promise.all(
      sourcesResult.results.map(async (source) => {
        const serversResult = await db!
          .prepare(
            `SELECT * FROM movie_episode_servers
             WHERE movie_source_id = ?
             ORDER BY server_index ASC`
          )
          .bind(source.id)
          .all<D1EpisodeServer>();

        const servers = serversResult.results.map((server) => ({
          ...server,
          episodes: JSON.parse(server.episodes_json) as NormalizedEpisode[],
        }));

        return { ...source, servers };
      })
    );

    return NextResponse.json({ success: true, movie, sources });
  } catch (error) {
    console.error("Error fetching movie detail:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
