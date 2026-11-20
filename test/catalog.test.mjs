import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { listMenu, getMenuItem, PAGE_SIZE } from "../lambda/catalog.mjs";
import { menuItems, categories } from "../lambda/menu-data.mjs";
import { createHandler, ORIGIN } from "../lambda/app.mjs";
test("following next-page links collects all 120 unique items, with bounded responses", () => {
  const ids = new Set();
  let next = "/menu?page=1";
  let pages = 0;
  while (next) {
    const data = listMenu(new URL(next, ORIGIN).searchParams);
    assert.ok(data.items.length <= PAGE_SIZE);
    for (const item of data.items) {
      assert.ok(!ids.has(item.id));
      ids.add(item.id);
      assert.equal(item.description, undefined);
      assert.equal(item.sku, undefined);
      assert.ok(getMenuItem(item.id).description);
    }
    next = data.next;
    pages++;
    assert.ok(pages <= 20);
  }
  assert.equal(ids.size, 120);
  assert.equal(pages, 10);
  assert.equal(categories.length, 10);
});
test("category, search and sorting persist in navigation links", () => {
  for (const c of categories) {
    const d = listMenu(new URLSearchParams({ category: c.id }));
    assert.equal(d.total, 12);
    assert.ok(d.items.every((x) => x.category === c.id));
  }
  const d = listMenu(new URLSearchParams({ q: "chicken", sort: "price-asc" }));
  assert.ok(d.total > 12);
  assert.ok(d.items.every((x, i, a) => i === 0 || x.price >= a[i - 1].price));
  assert.match(d.next, /q=chicken/);
  assert.match(d.next, /sort=price-asc/);
  assert.equal(
    listMenu(new URLSearchParams({ q: "zz-no-such-food" })).total,
    0,
  );
  for (const params of [
    { page: "-1" },
    { page: "1000" },
    { page: "1.5" },
    { category: "missing" },
    { sort: "invalid" },
  ])
    assert.ok(listMenu(new URLSearchParams(params)).error);
  assert.equal(
    listMenu(new URLSearchParams({ limit: "99999", pageSize: "99999" })).items
      .length,
    12,
  );
});
test("every photo exists, fits a Lambda response, and full catalog is absent from browser bundles", async () => {
  for (const item of menuItems) {
    const s = await stat("src-site/public" + item.image);
    assert.ok(s.size < 4000000, item.image);
    assert.ok(item.price > 0);
  }
  const files = await readdir("build/private/assets");
  const js = (
    await Promise.all(
      files
        .filter((x) => x.endsWith(".js"))
        .map((x) => readFile("build/private/assets/" + x, "utf8")),
    )
  ).join("");
  for (const name of [
    "The Big Band Burger",
    "Mushroom Garlic Penne",
    "Chocolate Brownie Shake",
  ])
    assert.ok(!js.includes(name), name);
});
test("catalog endpoints and photography are authenticated; only promotional hero is public", async () => {
  let now = 1800000000000;
  const handler = createHandler({
    secret: "test-catalog-session-secret".repeat(3),
    now: () => now,
    verify: async () => ({ passed: true, passkeyVerified: true }),
  });
  const req = (path, method = "GET", data, cookies = []) => ({
    rawPath: path.split("?")[0],
    rawQueryString: path.split("?")[1] || "",
    requestContext: { http: { method } },
    headers: { origin: ORIGIN, "content-type": "application/json" },
    body: JSON.stringify(data),
    cookies,
  });
  for (const p of ["/api/menu", "/api/menu/1", "/menu/pub-burger.webp"])
    assert.equal((await handler(req(p))).statusCode, 401);
  assert.equal((await handler(req("/brand/pub-spread.webp"))).statusCode, 200);
  const start = await handler(
    req("/api/start", "POST", { next: "/menu?category=burgers&page=1" }),
  );
  const end = await handler(
    req(
      "/api/complete",
      "POST",
      {
        actionId: JSON.parse(start.body).actionId,
        id: "a".repeat(36),
        token: "b".repeat(72),
      },
      start.cookies,
    ),
  );
  assert.equal(JSON.parse(end.body).redirect, "/menu?category=burgers&page=1");
  const response = await handler(
    req("/api/menu?page=2", "GET", undefined, end.cookies),
  );
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).page, 2);
  assert.equal(response.headers["cache-control"], "private, no-store");
  assert.equal(
    (await handler(req("/api/menu/1", "GET", undefined, end.cookies)))
      .statusCode,
    200,
  );
  now += 900000;
  assert.equal(
    (await handler(req("/api/menu", "GET", undefined, end.cookies))).statusCode,
    401,
  );
});
