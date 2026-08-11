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

const fixtures = {
  ophim: {
    detailSingle: {
      status: "success",
      data: {
        item: {
          slug: "nu-than-tham-enola-holmes",
          type: "single",
          episodes: [
            {
              server_name: "Vietsub #1",
              server_data: [{ name: "Full", slug: "full", link_embed: "https://embed.example/enola", link_m3u8: "https://cdn.example/enola.m3u8" }],
            },
          ],
        },
      },
    },
    detailSeries: {
      status: "success",
      data: {
        item: {
          slug: "tay-du-ky",
          type: "series",
          episodes: [
            {
              server_name: "Vietsub #1",
              server_data: [
                { name: "1", slug: "tap-1", link_embed: "https://embed.example/tdk-1", link_m3u8: "https://cdn.example/tdk-1.m3u8" },
                { name: "2", slug: "tap-2", link_embed: "https://embed.example/tdk-2", link_m3u8: "https://cdn.example/tdk-2.m3u8" },
              ],
            },
          ],
        },
      },
    },
    list: { data: { items: [{ name: "Journey", category: [{ slug: "gia-dinh" }], country: [{ slug: "han-quoc" }] }] } },
    search: { data: { items: [{ name: "Nữ Thần Thám Enola Holmes", origin_name: "Enola Holmes" }] } },
    genre: { data: { items: [{ name: "Family Movie", category: [{ slug: "gia-dinh" }] }] } },
    country: { data: { items: [{ name: "K-Movie", country: [{ slug: "han-quoc" }] }] } },
    newlyUpdated: { items: [{ name: "Fresh OPhim" }] },
  },
  kkphim: {
    detailSingle: {
      movie: { slug: "nu-than-tham-enola-holmes", type: "single" },
      episodes: [{ server_data: [{ name: "Full", slug: "full", link_embed: "https://embed.example/enola", link_m3u8: "https://cdn.example/enola.m3u8" }] }],
    },
    detailSeries: {
      movie: { slug: "tay-du-ky-phan-2", type: "series" },
      episodes: [{ server_data: [
        { name: "1", slug: "tap-1", link_embed: "https://embed.example/tdk2-1", link_m3u8: "https://cdn.example/tdk2-1.m3u8" },
        { name: "2", slug: "tap-2", link_embed: "https://embed.example/tdk2-2", link_m3u8: "https://cdn.example/tdk2-2.m3u8" },
      ] }],
    },
    list: { data: { items: [{ name: "Journey", category: [{ slug: "gia-dinh" }], country: [{ slug: "han-quoc" }] }] } },
    search: { data: { items: [{ name: "Nữ Thần Thám Enola Holmes", origin_name: "Enola Holmes" }] } },
    genre: { data: { items: [{ name: "Family Movie", category: [{ slug: "gia-dinh" }] }] } },
    country: { data: { items: [{ name: "K-Movie", country: [{ slug: "han-quoc" }] }] } },
    newlyUpdated: { items: [{ name: "Fresh KKPhim" }] },
  },
  nguonc: {
    detailSingle: {
      movie: {
        slug: "nu-than-tham-enola-holmes",
        episodes: [{ items: [{ name: "Full", slug: "full", embed: "https://embed.example/enola", m3u8: "https://cdn.example/enola.m3u8" }] }],
      },
    },
    detailSeries: {
      movie: {
        slug: "tay-du-ky-phan-2",
        episodes: [{ items: [
          { name: "1", slug: "tap-1", embed: "https://embed.example/tdk2-1", m3u8: "https://cdn.example/tdk2-1.m3u8" },
          { name: "2", slug: "tap-2", embed: "https://embed.example/tdk2-2", m3u8: "https://cdn.example/tdk2-2.m3u8" },
        ] }],
      },
    },
    list: { items: [{ name: "Journey", category: [{ slug: "gia-dinh" }], country: [{ slug: "han-quoc" }] }] },
    search: { items: [{ name: "Nữ Thần Thám Enola Holmes", original_name: "Enola Holmes" }] },
    genre: { items: [{ name: "Family Movie", category: [{ slug: "gia-dinh" }] }] },
    country: { items: [{ name: "K-Movie", country: [{ slug: "han-quoc" }] }] },
    newlyUpdated: { items: [{ name: "Fresh NguonC" }] },
  },
  vsmov: {
    detailSingle: {
      movie: { slug: "nu-than-tham-enola-holmes", type: "single" },
      episodes: [{ server_data: [{ name: "Full", slug: "full", link_embed: "https://embed.example/enola" }] }],
    },
    detailSeries: {
      movie: { slug: "tay-du-ky-phan-2", type: "series" },
      episodes: [{ server_data: [
        { name: "1", slug: "tap-1", link_embed: "https://embed.example/tdk2-1" },
        { name: "2", slug: "tap-2", link_embed: "https://embed.example/tdk2-2" },
      ] }],
    },
    list: { items: [{ name: "Journey", category: [{ slug: "gia-dinh" }], country: [{ slug: "han-quoc" }] }] },
    search: { items: [{ name: "Enola Holmes" }] },
    genre: { items: [{ name: "Family Movie", category: [{ slug: "gia-dinh" }] }] },
    country: { items: [{ name: "K-Movie", country: [{ slug: "han-quoc" }] }] },
    newlyUpdated: { items: [{ name: "Fresh VSMov" }] },
  },
};

const detailAsserters = {
  ophim: assertOphimDetailShape,
  kkphim: assertKkphimDetailShape,
  nguonc: assertNguoncDetailShape,
  vsmov: assertVsmovDetailShape,
};

test("detail parser contracts are source-specific and enforce stronger series assertions", async (t) => {
  for (const [source, sourceFixtures] of Object.entries(fixtures)) {
    await t.test(`${source} single detail`, () => {
      const { servers } = detailAsserters[source](sourceFixtures.detailSingle, "nu-than-tham-enola-holmes");
      assert.ok(countPlayableEpisodes(servers) >= 1, `${source} single should have at least one playable episode`);
    });

    await t.test(`${source} series detail`, () => {
      const expectedSlug = source === "ophim" ? "tay-du-ky" : "tay-du-ky-phan-2";
      const { servers } = detailAsserters[source](sourceFixtures.detailSeries, expectedSlug);
      assert.ok(countPlayableEpisodes(servers) > 1, `${source} series should have more than one playable episode`);
    });
  }
});

test("non-watch endpoints enforce filter semantics, not only non-empty payloads", async (t) => {
  for (const [source, sourceFixtures] of Object.entries(fixtures)) {
    await t.test(`${source} newly updated`, () => {
      const items = assertListShapeBySource(source, "newlyUpdated", sourceFixtures.newlyUpdated);
      assert.ok(items[0]?.name, `${source} newlyUpdated should expose movie names`);
    });

    await t.test(`${source} list`, () => {
      const items = assertListShapeBySource(source, "list", sourceFixtures.list);
      assert.ok(items[0]?.name, `${source} list should expose movie names`);
    });

    await t.test(`${source} genre`, () => {
      const items = assertListShapeBySource(source, "genre", sourceFixtures.genre);
      assertGenreMatches(items, "gia-dinh");
    });

    await t.test(`${source} country`, () => {
      const items = assertListShapeBySource(source, "country", sourceFixtures.country);
      assertCountryMatches(items, "han-quoc");
    });

    await t.test(`${source} search`, () => {
      const items = assertListShapeBySource(source, "search", sourceFixtures.search);
      assertSearchMatches(items, "enola");
    });
  }
});
