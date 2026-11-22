// Loopback fixture only. The deployed handler has no test-verifier switch.
import http from "node:http";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { createHandler, ORIGIN } from "../lambda/app.mjs";
const handler = createHandler({
  secret: "browser-test-fixture-only".repeat(3),
  root: resolve("build/lambda"),
  verify: async () => ({ passed: true, passkeyVerified: true }),
});
const server = http.createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  const url = new URL(req.url, "http://localhost");
  const result = await handler({
    rawPath: url.pathname,
    rawQueryString: url.search.slice(1),
    requestContext: { http: { method: req.method } },
    headers: { ...req.headers, origin: ORIGIN },
    body,
    cookies: (req.headers.cookie || "").split(";"),
  });
  res.writeHead(result.statusCode, {
    ...result.headers,
    ...(result.cookies?.length ? { "set-cookie": result.cookies } : {}),
  });
  res.end(
    result.isBase64Encoded ? Buffer.from(result.body, "base64") : result.body,
  );
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = "http://localhost:" + server.address().port;
const browser = await chromium.launch({ headless: true });
await mkdir("artifacts/catalog", { recursive: true });

async function assertTouchTarget(control, minimumSize) {
  const box = await control.boundingBox();
  assert.ok(
    box && box.width >= minimumSize && box.height >= minimumSize,
    `${control} needs a ${minimumSize}px touch target, got ${JSON.stringify(box)}`,
  );
}

async function assertFontSize(control, minimumSize) {
  const size = await control.evaluate((el) =>
    parseFloat(getComputedStyle(el).fontSize),
  );
  assert.ok(
    size >= minimumSize,
    `${control} needs ${minimumSize}px text, got ${size}px`,
  );
}

async function assertSmallPhoneReflow(page) {
  const previousSize = page.viewportSize();
  await page.setViewportSize({ width: 320, height: 568 });
  for (const fontSize of ["100%", "200%"]) {
    const style = await page.addStyleTag({
      content: `html { font-size: ${fontSize} !important; }`,
    });
    const width = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    assert.ok(
      width <= 320,
      `${new URL(page.url()).pathname} is ${width}px wide at ${fontSize} text`,
    );
    await style.evaluate((el) => el.remove());
  }
  await page.setViewportSize(previousSize);
}

async function assertSmallPhoneEntry(page) {
  const firstChoice = page.locator("#entry button");
  const agentChoice = page.locator(".agent-entry summary");
  const passport = page.getByRole("button", {
    name: /Open the passport check/,
  });
  const guide = page.getByRole("link", { name: /Fortress agent instructions/ });
  const previousSize = page.viewportSize();
  await page.setViewportSize({ width: 320, height: 568 });
  await firstChoice.focus();
  await page.keyboard.press("Tab");
  assert.ok(await agentChoice.evaluate((el) => el === document.activeElement));
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  assert.ok(await guide.evaluate((el) => el === document.activeElement));
  await page.keyboard.press("Tab");
  assert.ok(await passport.evaluate((el) => el === document.activeElement));

  for (const control of [firstChoice, agentChoice, passport]) {
    await assertTouchTarget(control, 48);
    await assertFontSize(control, 18);
  }
  const largeText = await page.addStyleTag({
    content: "html { font-size: 200% !important; }",
  });
  for (const control of [firstChoice, agentChoice, passport]) {
    await assertFontSize(control, 36);
  }
  const clipped = await page.locator(".gate-welcome").evaluate((panel) => {
    const { left, right } = panel.getBoundingClientRect();
    const nodes = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = nodes.nextNode(); node; node = nodes.nextNode()) {
      if (!node.textContent.trim()) continue;
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (rect.left < left - 1 || rect.right > right + 1)
          return node.textContent.trim();
      }
    }
    return null;
  });
  assert.equal(
    clipped,
    null,
    `Entry text overflows the phone panel: ${clipped}`,
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await largeText.evaluate((el) => el.remove());
  await agentChoice.press("Space");
  assert.equal(await passport.isVisible(), false);
  await page.setViewportSize(previousSize);
}

try {
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["phone", 390, 844],
  ]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(origin);
    await page.locator("#entry button").waitFor();
    assert.equal(
      (await page.locator("h1").innerText()).replace(/\s+/g, " ").trim(),
      "COME HUNGRY. LEAVE STUFFED",
    );
    assert.equal(
      await page.locator(".scene-copy > p:last-child").innerText(),
      "Stacked burgers. Cold beer. Awful Puns.",
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.evaluate(() => document.fonts.ready);
    assert.ok(
      await page.evaluate(() => document.fonts.check("900 32px Poppins")),
    );
    await page.screenshot({
      path: `artifacts/catalog/gate-${name}.png`,
      fullPage: true,
    });
    if (name === "phone") await assertSmallPhoneEntry(page);
    await page
      .getByText("Click here if you’re an AGENT", { exact: false })
      .click();
    const guide = page.getByRole("link", {
      name: "Open the Fortress agent instructions",
    });
    assert.equal(
      await guide.getAttribute("href"),
      "https://captcha.wolcott.cc/agent/#document-of-intent",
    );
    assert.ok(
      await page
        .getByRole("button", { name: /Open the passport check/ })
        .isVisible(),
    );
    const start = await context.request.post(origin + "/api/start", {
      data: { next: "/menu" },
    });
    const { actionId } = await start.json();
    const done = await context.request.post(origin + "/api/complete", {
      data: { actionId, id: "a".repeat(36), token: "b".repeat(72) },
    });
    assert.equal(done.status(), 200);
    await page.goto(origin + "/");
    await page.locator(".menu-card").first().waitFor();
    assert.equal(await page.locator(".menu-card").count(), 12);
    await page.locator("img").evaluateAll(async (xs) =>
      Promise.all(
        xs.map((x) => {
          x.loading = "eager";
          return x.decode();
        }),
      ),
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: `artifacts/catalog/menu-${name}.png`,
      fullPage: true,
    });
    const header = page.locator(".pub-header");
    const tabLink = header.getByRole("link", { name: /Your tab/ });
    assert.equal(await tabLink.count(), name === "phone" ? 0 : 1);
    await page.evaluate(() =>
      window.scrollTo({ top: 600, behavior: "instant" }),
    );
    await page.waitForFunction(
      () =>
        window.scrollY > 500 &&
        document.querySelector(".pub-header").getBoundingClientRect().top === 0,
    );
    if (name === "phone") {
      await page.screenshot({ path: "artifacts/catalog/sticky-nav-phone.png" });
      const menuToggle = header.getByRole("button", { name: "Toggle menu" });
      await assertTouchTarget(menuToggle, 44);
      await menuToggle.click();
      await page.keyboard.press("Tab");
      assert.ok(
        await header
          .getByRole("link", { name: "The menu", exact: true })
          .evaluate((link) => link === document.activeElement),
      );
      await page.keyboard.press("Escape");
      assert.equal(await menuToggle.getAttribute("aria-expanded"), "false");
      assert.ok(
        await menuToggle.evaluate((el) => el === document.activeElement),
      );
      await menuToggle.press("Enter");
      await tabLink.click();
      assert.equal(new URL(page.url()).pathname, "/cart");
      assert.equal(await tabLink.count(), 0);
    }
    if (name === "desktop") {
      const ids = new Set();
      for (let n = 1; n <= 10; n++) {
        await page.waitForFunction(
          (n) =>
            document
              .querySelector(".results-line")
              ?.textContent.includes(`Showing ${(n - 1) * 12 + 1}–${n * 12}`),
          n,
        );
        for (const id of await page
          .locator(".menu-card")
          .evaluateAll((xs) => xs.map((x) => x.dataset.productId))) {
          assert.ok(!ids.has(id));
          ids.add(id);
        }
        if (n < 10)
          await page.getByRole("link", { name: "Next →", exact: true }).click();
      }
      assert.equal(ids.size, 120);
      console.log("Browser followed all 10 menu pages: 120 unique products.");
    }
    await page.goto(origin + "/menu?category=burgers");
    await page
      .getByRole("heading", { name: "Burgers & Sliders", exact: true })
      .waitFor();
    await page.locator(".menu-card").first().waitFor();
    assert.equal(await page.locator(".menu-card").count(), 12);
    const search = page.getByLabel("Search the menu");
    if (name === "phone") {
      await assertSmallPhoneReflow(page);
      await assertFontSize(search, 16);
    }
    await search.fill("no-such-food");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page
      .getByRole("heading", { name: "No bites on that one." })
      .waitFor();
    await page.goto(origin + "/menu?q=chicken&sort=price-asc");
    await page.locator(".menu-card").first().waitFor();
    const prices = await page.locator(".food-price").allTextContents();
    assert.deepEqual(
      prices.map((x) => Number(x.slice(1))),
      prices.map((x) => Number(x.slice(1))).sort((a, b) => a - b),
    );
    await page.goto(origin + "/menu/1");
    await page
      .getByRole("heading", { name: "The Sampler", exact: true })
      .waitFor();
    await page.locator(".product-picture img").evaluate((x) => x.decode());
    await page.screenshot({
      path: `artifacts/catalog/product-${name}.png`,
      fullPage: true,
    });
    if (name === "phone") {
      await assertSmallPhoneReflow(page);
      for (const label of ["Decrease quantity", "Increase quantity"]) {
        await assertTouchTarget(
          page.getByRole("button", { name: label, exact: true }),
          44,
        );
      }
    }
    await page
      .getByRole("button", { name: "Increase quantity", exact: true })
      .click();
    await page.getByRole("button", { name: /Add to your tab/ }).click();
    await page.getByRole("link", { name: "View your tab →" }).click();
    await page
      .getByRole("heading", { name: "Your tab.", exact: true })
      .waitFor();
    assert.match(await page.locator(".tab-summary").innerText(), /\$57\.90/);
    if (name === "phone") await assertSmallPhoneReflow(page);
    await page.screenshot({
      path: `artifacts/catalog/cart-${name}.png`,
      fullPage: true,
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.getByRole("button", { name: /Finish demo order/ }).click();
    await page.getByRole("heading", { name: "That’s a wrap." }).waitFor();
    if (name === "phone") {
      await page.getByRole("button", { name: "Toggle menu" }).click();
      await page
        .getByRole("navigation", { name: "Primary", exact: true })
        .getByRole("link", { name: "The menu" })
        .click();
      await page.locator(".menu-card").first().waitFor();
    }
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      name +
        ": gate, catalog, filters, search, details, quantity, tab and demo completion passed.",
    );
  }
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
