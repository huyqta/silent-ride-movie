export interface EpisodeLike {
    slug?: string | null;
    name?: string | null;
    link_embed?: string | null;
    link_m3u8?: string | null;
}

function parseEpisodeNumber(value: string): number | null {
    const normalized = value.trim().toLowerCase();
    const match = normalized.match(/^\d+(?:\.\d+)?$/) || normalized.match(/(?:tap|tập|episode|ep)\s*(\d+(?:\.\d+)?)/i);
    if (!match) return null;
    const raw = match[1] ?? match[0];
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : null;
}

export function getEpisodeRouteKey(episode: EpisodeLike): string {
    const slug = String(episode.slug || "").trim();
    if (slug) return slug;

    return String(episode.name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
}

export function isEpisodeRouteMatch(episode: EpisodeLike, routeKey: string): boolean {
    if (!routeKey) return false;
    return getEpisodeRouteKey(episode) === routeKey;
}

export function countPlayableEpisodes(episodes: any[]): number {
    if (!Array.isArray(episodes) || episodes.length === 0) return 0;

    const keys = new Set(
        episodes.flatMap((server) =>
            (server?.server_data || [])
                .filter((episode: EpisodeLike) => episode.link_embed || episode.link_m3u8)
                .map((episode: EpisodeLike) => getEpisodeRouteKey(episode))
                .filter(Boolean)
        )
    );

    return keys.size;
}

export function sortEpisodesForDisplay<T extends EpisodeLike>(episodes: T[]): T[] {
    return [...episodes].sort((left, right) => {
        const leftNumber = parseEpisodeNumber(String(left.name || left.slug || ""));
        const rightNumber = parseEpisodeNumber(String(right.name || right.slug || ""));

        if (leftNumber !== null && rightNumber !== null) {
            return leftNumber - rightNumber;
        }

        if (leftNumber !== null) return -1;
        if (rightNumber !== null) return 1;

        return String(left.name || left.slug || "").localeCompare(
            String(right.name || right.slug || ""),
            "vi",
            { numeric: true, sensitivity: "base" }
        );
    });
}
