import { test } from "node:test";
import assert from "node:assert/strict";
import { createHandler, ORIGIN } from "../lambda/app.mjs";
const secret = "test-only-secret".repeat(4);
const event = (path, method = "GET", body, cookies = []) => ({
  rawPath: path,
  requestContext: { http: { method } },
  headers: { origin: ORIGIN, "content-type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
  cookies,
});
const pair = (response) => response.cookies.map((x) => x.split(";")[0]);
async function enter(handler, next = "/") {
  const start = await handler(event("/api/start", "POST", { next }));
  const proof = {
    ...JSON.parse(start.body),
    id: "a".repeat(36),
    token: "b".repeat(72),
  };
  return {
    response: await handler(event("/api/complete", "POST", proof, pair(start))),
    proof,
    start,
  };
}
test("only the public welcome and its brand assets are available before verification", async () => {
  const handler = createHandler({ secret });
  for (const path of ["/menu/1", "/events", "/reservations", "/verification"]) {
    const result = await handler(event(path));
    assert.equal(result.statusCode, 302, path);
    assert.match(result.headers.location, /^\/verify\?/);
    assert.equal(result.body, "");
    assert.equal(result.headers["cache-control"], "private, no-store");
  }
  for (const path of [
    "/index.html",
    "/assets/index.js",
    "/food.jpg",
    "/api/session",
  ])
    assert.equal((await handler(event(path))).statusCode, 401, path);
  for (const cookies of [[], ["__Host-hornpub_session=forged.cookie"]]) {
    const landing = await handler(event("/", "GET", undefined, cookies));
    assert.equal(landing.statusCode, 200);
    const markup = Buffer.from(landing.body, "base64").toString("utf8");
    assert.match(markup, /Click here if you’re a HUMAN/);
    assert.match(
      markup,
      /property="og:image"\s+content="https:\/\/hornpub\.click\/brand\/hornpub-social\.jpg"/,
    );
    assert.ok(!markup.includes('id="root"'));
  }
  const preview = await handler(event("/brand/hornpub-social.jpg"));
  assert.equal(preview.statusCode, 200);
  assert.equal(preview.headers["content-type"], "image/jpeg");
  const verifyPage = await handler(event("/verify"));
  assert.equal(verifyPage.statusCode, 200);
  assert.match(verifyPage.headers["x-robots-tag"], /noindex/);
});
test("accepted human check grants private content and expires after 15 minutes", async () => {
  let time = 1800000000000;
  let verified;
  const handler = createHandler({
    secret,
    now: () => time,
    verify: async (input) => {
      verified = input;
      return { passed: true, passkeyVerified: true };
    },
  });
  const { response } = await enter(handler, "/menu/1");
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).redirect, "/menu/1");
  assert.equal(verified.siteKey, "site_test_demo.forceauth");
  assert.equal(verified.operation.action, "browse");
  assert.equal(verified.operation.url, ORIGIN + "/api/complete");
  assert.match(
    response.cookies[0],
    /Secure; HttpOnly; SameSite=Strict; Max-Age=900/,
  );
  const cookies = pair(response);
  assert.equal(
    (await handler(event("/", "GET", undefined, cookies))).statusCode,
    200,
  );
  assert.equal(
    (await handler(event("/verification", "GET", undefined, cookies)))
      .statusCode,
    200,
  );
  assert.equal(
    (await handler(event("/../package.json", "GET", undefined, cookies)))
      .statusCode,
    404,
  );
  time += 900000;
  assert.equal(
    (await handler(event("/menu", "GET", undefined, cookies))).statusCode,
    302,
  );
});
test("bad, missing, mismatched and expired proofs fail closed", async () => {
  for (const result of [
    null,
    {},
    { passed: false, passkeyVerified: true },
    { passed: true },
    {
      passed: true,
      flow: "agent",
      audience: "https://other.example",
      authorized: true,
      action: "browse",
    },
  ]) {
    const handler = createHandler({ secret, verify: async () => result });
    assert.equal((await enter(handler)).response.statusCode, 403);
  }
  let time = 1800000000000;
  let calls = 0;
  const handler = createHandler({
    secret,
    now: () => time,
    verify: async () => {
      calls++;
      throw Error();
    },
  });
  assert.equal(
    (await handler(event("/api/complete", "POST", {}))).statusCode,
    403,
  );
  const { start, proof } = await enter(handler);
  assert.equal(calls, 1);
  assert.equal(
    (
      await handler(
        event(
          "/api/complete",
          "POST",
          { ...proof, actionId: "wrong" },
          pair(start),
        ),
      )
    ).statusCode,
    403,
  );
  time += 600000;
  assert.equal(
    (await handler(event("/api/complete", "POST", proof, pair(start))))
      .statusCode,
    403,
  );
  assert.equal(calls, 1);
});
test("same-origin POST, safe return URLs and no public mutation endpoints", async () => {
  const handler = createHandler({
    secret,
    verify: async () => ({ passed: true, passkeyVerified: true }),
  });
  for (const origin of ["https://evil.example", undefined]) {
    const request = event("/api/start", "POST", {});
    request.headers.origin = origin;
    assert.equal((await handler(request)).statusCode, 403);
  }
  for (const next of [
    "//evil.example",
    "https://evil.example",
    "/../secret",
    "/gate.js",
    "/menu/1?next=evil",
  ])
    assert.equal(
      JSON.parse((await enter(handler, next)).response.body).redirect,
      "/",
    );
  assert.equal(
    (await handler(event("/api/order", "POST", {}))).statusCode,
    405,
  );
});
test("passport admission enforces browse authorization and caps session by both expirations", async () => {
  let time = 1800000000000;
  const valid = {
    passed: true,
    flow: "agent",
    audience: ORIGIN,
    authorized: true,
    action: "browse",
    expiresAt: time + 300000,
    doi: {
      sites: ["hornpub.click"],
      actions: ["browse"],
      expiresAt: new Date(time + 120000).toISOString(),
    },
    phoneIps: ["192.0.2.1"],
    deviceId: "example-hash",
  };
  for (const change of [
    { authorized: false },
    { action: "purchase" },
    { expiresAt: time - 1 },
    { doi: null },
  ]) {
    const handler = createHandler({
      secret,
      now: () => time,
      verify: async () => ({ ...valid, ...change }),
    });
    assert.equal((await enter(handler)).response.statusCode, 403);
  }
  const handler = createHandler({
    secret,
    now: () => time,
    verify: async () => valid,
  });
  const { response } = await enter(handler);
  assert.equal(response.statusCode, 200);
  assert.match(response.cookies[0], /Max-Age=120$/);
  const cookies = pair(response);
  const receipt = await handler(
    event("/verification", "GET", undefined, cookies),
  );
  assert.match(receipt.body, /192.0.2.1/);
  assert.match(receipt.body, /example-hash/);
  assert.match(receipt.body, /browse/);
  time += 120000;
  assert.equal(
    (await handler(event("/menu", "GET", undefined, cookies))).statusCode,
    302,
  );
});
