import assert from "node:assert/strict";
import test from "node:test";
import {
  assertCountryMatches,
  assertGenreMatches,
  assertKkphimDetailShape,
  assertListShapeBySource,
  assertNguoncDetailShape,
  assertOphimDetailShape,
  assertSearchMatches,
  assertVsmovDetailShape,
  countPlayableEpisodes,
} from "./test-helpers.mjs";

const WATCH_CASES = {
  ophim: {
    single: { slug: "nu-than-tham-enola-holmes", detailUrl: "https://ophim1.com/v1/api/phim/nu-than-tham-enola-holmes" },
    series: { slug: "tay-du-ky", detailUrl: "https://ophim1.com/v1/api/phim/tay-du-ky" },
  },
  kkphim: {
    single: { slug: "nu-than-tham-enola-holmes", detailUrl: "https://phimapi.com/phim/nu-than-tham-enola-holmes" },
    series: { slug: "tay-du-ky-phan-2", detailUrl: "https://phimapi.com/phim/tay-du-ky-phan-2" },
  },
  nguonc: {
    single: { slug: "nu-than-tham-enola-holmes", detailUrl: "https://phim.nguonc.com/api/film/nu-than-tham-enola-holmes" },
    series: { slug: "tay-du-ky-phan-2", detailUrl: "https://phim.nguonc.com/api/film/tay-du-ky-phan-2" },
  },
  vsmov: {
    single: { slug: "nu-than-tham-enola-holmes", detailUrl: "https://vsmov.com/api/phim/nu-than-tham-enola-holmes" },
    series: { slug: "tay-du-ky-phan-2", detailUrl: "https://vsmov.com/api/phim/tay-du-ky-phan-2" },
  },
};

const PAGE_ENDPOINTS = {
  ophim: {
    newlyUpdated: { url: "https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1" },
    list: { url: "https://ophim1.com/v1/api/danh-sach/phim-bo?page=1&limit=24" },
    genre: { url: "https://ophim1.com/v1/api/the-loai/gia-dinh?page=1", expectedGenre: "gia-dinh", verifyFilterFields: true },
    country: { url: "https://ophim1.com/v1/api/quoc-gia/han-quoc?page=1", expectedCountry: "han-quoc", verifyFilterFields: true },
    search: { url: "https://ophim1.com/v1/api/tim-kiem?keyword=nu-than-tham-enola-holmes&page=1", expectedKeyword: "enola" },
  },
  kkphim: {
    newlyUpdated: { url: "https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1" },
    list: { url: "https://phimapi.com/v1/api/danh-sach/phim-bo?page=1&limit=24" },
    genre: { url: "https://phimapi.com/v1/api/the-loai/gia-dinh?page=1", expectedGenre: "gia-dinh", verifyFilterFields: true },
    country: { url: "https://phimapi.com/v1/api/quoc-gia/han-quoc?page=1", expectedCountry: "han-quoc", verifyFilterFields: true },
    search: { url: "https://phimapi.com/v1/api/tim-kiem?keyword=nu-than-tham-enola-holmes&page=1", expectedKeyword: "enola" },
  },
  nguonc: {
    newlyUpdated: { url: "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1" },
    list: { url: "https://phim.nguonc.com/api/films/danh-sach/phim-bo?page=1" },
    genre: { url: "https://phim.nguonc.com/api/films/the-loai/gia-dinh?page=1", expectedGenre: "gia-dinh", verifyFilterFields: false },
    country: { url: "https://phim.nguonc.com/api/films/quoc-gia/han-quoc?page=1", expectedCountry: "han-quoc", verifyFilterFields: false },
    search: { url: "https://phim.nguonc.com/api/films/search?keyword=nu-than-tham-enola-holmes&page=1", expectedKeyword: "enola" },
  },
  vsmov: {
    newlyUpdated: { url: "https://vsmov.com/api/danh-sach/phim-moi-cap-nhat?page=1" },
    list: { url: "https://vsmov.com/api/danh-sach/phim-bo?page=1&limit=24" },
    genre: { url: "https://vsmov.com/api/the-loai/gia-dinh?page=1&limit=24", expectedGenre: "gia-dinh", verifyFilterFields: false },
    country: { url: "https://vsmov.com/api/quoc-gia/han-quoc?page=1&limit=24", expectedCountry: "han-quoc", verifyFilterFields: false },
    search: { url: "https://vsmov.com/api/tim-kiem?keyword=enola&page=1&limit=24", expectedKeyword: "enola" },
  },
};

const detailAsserters = {
  ophim: assertOphimDetailShape,
  kkphim: assertKkphimDetailShape,
  nguonc: assertNguoncDetailShape,
  vsmov: assertVsmovDetailShape,
};

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const response = await fetch(url, {
    headers: { "user-agent": "silent-ride-live-tests/1.0" },
    signal: controller.signal,
  });
  clearTimeout(timeout);
  assert.equal(response.ok, true, `Expected 200 OK for ${url}, got ${response.status}`);
  return response.json();
}

test("watch page source fixtures resolve playable single and series movies across all 4 sources", { timeout: 120000 }, async (t) => {
  for (const [source, cases] of Object.entries(WATCH_CASES)) {
    await t.test(`${source} single`, async () => {
      const data = await fetchJson(cases.single.detailUrl);
      const { movie, servers } = detailAsserters[source](data, cases.single.slug);
      assert.ok(movie, `${source} single should return movie payload`);
      assert.ok(countPlayableEpisodes(servers) >= 1, `${source} single should have at least 1 playable episode`);
    });

    await t.test(`${source} series`, async () => {
      const data = await fetchJson(cases.series.detailUrl);
      const { movie, servers } = detailAsserters[source](data, cases.series.slug);
      assert.ok(movie, `${source} series should return movie payload`);
      assert.ok(countPlayableEpisodes(servers) > 1, `${source} series should have more than 1 playable episode`);
    });
  }
});

test("non-watch page APIs return filtered results across all 4 sources", { timeout: 120000 }, async (t) => {
  for (const [source, endpoints] of Object.entries(PAGE_ENDPOINTS)) {
    for (const [pageName, config] of Object.entries(endpoints)) {
      await t.test(`${source} ${pageName}`, async () => {
        const data = await fetchJson(config.url);
        const items = assertListShapeBySource(source, pageName, data);
        if (config.expectedGenre && config.verifyFilterFields) assertGenreMatches(items, config.expectedGenre);
        if (config.expectedCountry && config.verifyFilterFields) assertCountryMatches(items, config.expectedCountry);
        if (config.expectedKeyword) assertSearchMatches(items, config.expectedKeyword);
      });
    }
  }
});
