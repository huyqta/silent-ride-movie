import assert from "node:assert/strict";

export function getEpisodeRouteKey(episode) {
  const slug = String(episode?.slug || "").trim();
  if (slug) return slug;
  return String(episode?.name || "").trim().toLowerCase().replace(/\s+/g, "-");
}

export function countPlayableEpisodes(servers) {
  return new Set(
    (servers || []).flatMap((server) =>
      (server?.server_data || server?.items || [])
        .filter((episode) => episode?.link_embed || episode?.link_m3u8 || episode?.embed || episode?.m3u8)
        .map(getEpisodeRouteKey)
        .filter(Boolean)
    )
  ).size;
}

export function assertOphimDetailShape(data, expectedSlug) {
  assert.equal(typeof data?.status, "string");
  assert.equal(data?.status, "success");
  assert.equal(data?.data?.item?.slug, expectedSlug);
  assert.ok(Array.isArray(data?.data?.item?.episodes));
  return { movie: data.data.item, servers: data.data.item.episodes };
}

export function assertKkphimDetailShape(data, expectedSlug) {
  assert.equal(typeof data?.movie?.slug, "string");
  assert.equal(data.movie.slug, expectedSlug);
  assert.ok(Array.isArray(data?.episodes));
  return { movie: data.movie, servers: data.episodes };
}

export function assertNguoncDetailShape(data, expectedSlug) {
  assert.equal(typeof data?.movie?.slug, "string");
  assert.equal(data.movie.slug, expectedSlug);
  assert.ok(Array.isArray(data?.movie?.episodes));
  return { movie: data.movie, servers: data.movie.episodes };
}

export function assertVsmovDetailShape(data, expectedSlug) {
  assert.equal(typeof data?.movie?.slug, "string");
  assert.equal(data.movie.slug, expectedSlug);
  assert.ok(Array.isArray(data?.episodes));
  return { movie: data.movie, servers: data.episodes };
}

export function getListItemsBySource(source, data) {
  if (source === "ophim" || source === "kkphim") {
    return Array.isArray(data?.data?.items) ? data.data.items : Array.isArray(data?.items) ? data.items : [];
  }
  if (source === "nguonc" || source === "vsmov") {
    return Array.isArray(data?.items) ? data.items : Array.isArray(data?.data?.items) ? data.data.items : [];
  }
  return [];
}

export function assertListShapeBySource(source, pageName, data) {
  const items = getListItemsBySource(source, data);
  assert.ok(Array.isArray(items), `${source} ${pageName} should expose an item array in the expected source-specific field`);
  assert.ok(items.length > 0, `${source} ${pageName} should return at least one item`);
  return items;
}

export function assertSearchMatches(items, keyword) {
  const normalizedKeyword = keyword.toLowerCase();
  assert.ok(
    items.some((item) => `${item?.name || ""} ${item?.origin_name || item?.original_name || ""}`.toLowerCase().includes(normalizedKeyword)),
    `search results should contain at least one movie related to keyword "${keyword}"`
  );
}

export function assertGenreMatches(items, expectedSlug) {
  assert.ok(
    items.some((item) =>
      Array.isArray(item?.category) && item.category.some((category) => category?.slug === expectedSlug)
    ),
    `genre results should include at least one item tagged with genre "${expectedSlug}"`
  );
}

export function assertCountryMatches(items, expectedSlug) {
  assert.ok(
    items.some((item) =>
      Array.isArray(item?.country) && item.country.some((country) => country?.slug === expectedSlug)
    ),
    `country results should include at least one item tagged with country "${expectedSlug}"`
  );
}
