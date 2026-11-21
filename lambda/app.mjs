import {
  createHmac,
  timingSafeEqual,
  randomUUID,
  createHash,
} from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { listMenu, getMenuItem } from "./catalog.mjs";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export const ORIGIN = "https://hornpub.click";
const SITE_KEY = "site_test_demo.forceauth";
const SESSION = "__Host-hornpub_session";
const PENDING = "__Host-hornpub_pending";
const headers = {
  "cache-control": "private, no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
};
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};
const reply = (statusCode, data, cookies = []) => ({
  statusCode,
  headers: { ...headers, "content-type": "application/json" },
  body: JSON.stringify(data),
  cookies,
});
const cookie = (name, value, seconds) =>
  `${name}=${value}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${seconds}`;
function sign(value, secret) {
  const body = deflateRawSync(Buffer.from(JSON.stringify(value))).toString(
    "base64url",
  );
  return (
    body + "." + createHmac("sha256", secret).update(body).digest("base64url")
  );
}
function read(event, name, secret, type, now) {
  const raw = (event.cookies || [event.headers?.cookie || ""])
    .join(";")
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(name + "="))
    ?.slice(name.length + 1);
  if (!raw || raw.length > 3800) return null;
  try {
    const [body, mac, extra] = raw.split(".");
    const expected = createHmac("sha256", secret).update(body).digest();
    const actual = Buffer.from(mac, "base64url");
    if (
      extra ||
      actual.length !== expected.length ||
      !timingSafeEqual(actual, expected)
    )
      return null;
    const value = JSON.parse(
      inflateRawSync(Buffer.from(body, "base64url"), {
        maxOutputLength: 16384,
      }),
    );
    return value.type === type &&
      Number.isSafeInteger(value.exp) &&
      value.exp > now
      ? value
      : null;
  } catch {
    return null;
  }
}
function destination(value) {
  if (
    typeof value !== "string" ||
    value.length > 500 ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\r\n]/.test(value)
  )
    return "/";
  const url = new URL(value, ORIGIN);
  if (
    url.origin !== ORIGIN ||
    !/^\/(?:menu(?:\/\d+)?|order|cart|order-confirmation|order-summary|reservations|events)?$/.test(
      url.pathname,
    )
  )
    return "/";
  if (url.search && url.pathname !== "/menu") return "/";
  const allowed = new URLSearchParams();
  for (const key of ["category", "q", "sort", "page"])
    if (url.searchParams.has(key))
      allowed.set(key, url.searchParams.get(key).slice(0, 100));
  return url.pathname + (allowed.size ? "?" + allowed.toString() : "");
}
function html(body) {
  return {
    statusCode: 200,
    headers: { ...headers, "content-type": "text/html; charset=utf-8" },
    body,
  };
}
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let keyPromise;
async function verifyCaptcha(input) {
  keyPromise ||= new SecretsManagerClient({})
    .send(
      new GetSecretValueCommand({ SecretId: process.env.MERCHANT_SECRET_ARN }),
    )
    .then((x) => x.SecretString)
    .catch((error) => {
      keyPromise = null;
      throw error;
    });
  const response = await fetch("https://captcha.wolcott.cc/api/verify", {
    method: "POST",
    headers: {
      authorization: "Bearer " + (await keyPromise),
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("verifier_unavailable");
  return response.json();
}

export function createHandler({
  secret,
  verify = verifyCaptcha,
  now = Date.now,
  root = process.env.LAMBDA_TASK_ROOT || "build/lambda",
}) {
  if (!secret || secret.length < 32) throw new Error("Missing session secret");
  async function asset(area, path, method) {
    if (
      !/^\/[a-zA-Z0-9_./-]+$/.test(path) ||
      path.split("/").some((x) => x === ".." || x === ".")
    )
      return reply(404, { error: "not_found" });
    try {
      const data = await readFile(join(root, area, path));
      const extension = path.slice(path.lastIndexOf("."));
      return {
        statusCode: 200,
        headers: {
          ...headers,
          "content-type": mime[extension] || "application/octet-stream",
        },
        body: method === "HEAD" ? "" : data.toString("base64"),
        isBase64Encoded: true,
      };
    } catch {
      return reply(404, { error: "not_found" });
    }
  }
  return async (event) => {
    const path = event.rawPath;
    const method = event.requestContext?.http?.method;
    const current = now();
    if (
      method === "POST" &&
      ["/api/start", "/api/complete", "/api/logout"].includes(path)
    ) {
      if (event.headers?.origin !== ORIGIN)
        return reply(403, { error: "origin_not_allowed" });
      if (path === "/api/logout")
        return reply(200, { ok: true }, [
          cookie(SESSION, "", 0),
          cookie(PENDING, "", 0),
        ]);
      let input, raw;
      try {
        raw = event.isBase64Encoded
          ? Buffer.from(event.body, "base64").toString()
          : event.body;
        if (
          !event.headers?.["content-type"]?.startsWith("application/json") ||
          typeof raw !== "string" ||
          Buffer.byteLength(raw) > 4096
        )
          throw new Error();
        input = JSON.parse(raw);
        if (!input || typeof input !== "object" || Array.isArray(input))
          throw new Error();
      } catch {
        return reply(400, { error: "invalid_body" });
      }
      if (path === "/api/start") {
        const actionId = "hornpub-access:" + randomUUID();
        return reply(200, { actionId, siteKey: SITE_KEY }, [
          cookie(
            PENDING,
            sign(
              {
                type: "pending",
                actionId,
                next: destination(input.next),
                exp: current + 600000,
              },
              secret,
            ),
            600,
          ),
        ]);
      }
      const pending = read(event, PENDING, secret, "pending", current);
      if (!pending || pending.actionId !== input.actionId)
        return reply(403, { error: "check_expired" });
      if (
        !/^[0-9a-f-]{36}$/i.test(input.id || "") ||
        !/^[0-9a-f-]{72}$/i.test(input.token || "")
      )
        return reply(400, { error: "invalid_proof" });
      let result;
      try {
        result = await verify({
          id: input.id,
          token: input.token,
          actionId: pending.actionId,
          siteKey: SITE_KEY,
          operation: {
            id: pending.actionId,
            action: "browse",
            url: ORIGIN + "/api/complete",
            method: "POST",
            bodyDigest: createHash("sha256").update(raw).digest("base64url"),
          },
        });
      } catch {
        return reply(503, { error: "captcha_unavailable" });
      }
      const agent = result?.flow === "agent";
      const approved = agent
        ? result.audience === ORIGIN &&
          result.authorized === true &&
          result.action === "browse"
        : result?.passkeyVerified === true;
      if (result?.passed !== true || !approved)
        return reply(403, { error: "captcha_rejected" });
      let exp = current + 900000;
      const receipt = {
        flow: agent ? "agent" : "human",
        verifiedAt: new Date(current).toISOString(),
      };
      if (agent) {
        const doiExpiry = Date.parse(result.doi?.expiresAt);
        if (
          !Number.isSafeInteger(result.expiresAt) ||
          !Number.isFinite(doiExpiry)
        )
          return reply(403, { error: "invalid_grant" });
        exp = Math.min(exp, result.expiresAt, doiExpiry);
        for (const key of [
          "phoneIps",
          "deviceId",
          "audience",
          "doi",
          "doiHash",
          "expiresAt",
          "approvedAt",
          "assurance",
          "authorized",
          "authorizationId",
          "action",
          "spending",
          "humanApprovedThisOperation",
        ])
          if (Object.hasOwn(result, key)) receipt[key] = result[key];
      }
      if (exp <= current) return reply(403, { error: "grant_expired" });
      const signed = sign({ type: "session", exp, receipt }, secret);
      if (signed.length > 3700) return reply(403, { error: "grant_too_large" });
      return reply(200, { ok: true, redirect: pending.next }, [
        cookie(SESSION, signed, Math.floor((exp - current) / 1000)),
        cookie(PENDING, "", 0),
      ]);
    }
    if (!["GET", "HEAD"].includes(method))
      return reply(405, { error: "method_not_allowed" });
    if (path === "/gate.css" || path === "/gate.js")
      return asset("public", path, method);
    if (/^\/brand\/poppins-(400|600|700|800|900)\.woff2$/.test(path))
      return asset("public", path, method);
    if (
      [
        "/brand/pub-spread.webp",
        "/brand/hornpub-trumpet.png",
        "/brand/wordmark.css",
        "/brand/hornpub-lettering.woff2",
        "/brand/hornpub-social.jpg",
      ].includes(path)
    )
      return asset("public", path, method);
    if (path === "/robots.txt")
      return {
        statusCode: 200,
        headers: { ...headers, "content-type": "text/plain" },
        body: "User-agent: *\nAllow: /$\nAllow: /brand/\nAllow: /gate.css$\nAllow: /gate.js$\nDisallow: /\n",
      };
    if (path === "/verify") {
      const entry = await asset("public", "/index.html", method);
      entry.headers["x-robots-tag"] = "noindex, follow";
      return entry;
    }
    const session = read(event, SESSION, secret, "session", current);
    if (!session) {
      if (path === "/") return asset("public", "/index.html", method);
      if (path?.startsWith("/api/") || path?.includes("."))
        return reply(401, { error: "verification_required" });
      return {
        statusCode: 302,
        headers: {
          ...headers,
          location:
            "/verify?next=" +
            encodeURIComponent(
              destination(
                path + (event.rawQueryString ? "?" + event.rawQueryString : ""),
              ),
            ),
        },
        body: "",
      };
    }
    if (path === "/api/session") return reply(200, { expiresAt: session.exp });
    if (path === "/api/menu") {
      const data = listMenu(new URLSearchParams(event.rawQueryString || ""));
      return reply(data.error ? 400 : 200, data);
    }
    if (/^\/api\/menu\/\d+$/.test(path)) {
      const item = getMenuItem(Number(path.split("/").pop()));
      return reply(item ? 200 : 404, item || { error: "item_not_found" });
    }
    if (path === "/verification")
      return html(
        `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your verification · HornPub</title><link rel="stylesheet" href="/gate.css"><link rel="stylesheet" href="/brand/wordmark.css"><main class="card receipt"><a class="pub-logo" href="/"><img class="trumpet" src="/brand/hornpub-trumpet.png" width="64" height="64" alt="">HornPub</a><h1>You’re in.</h1><p>This is the verification information HornPub received.</p><details><summary>View verification details</summary><pre>${escape(JSON.stringify(session.receipt, null, 2))}</pre></details><a class="button" href="/">Back to the pub</a></main></html>`,
      );
    if (destination(path) === path)
      return asset("private", "/index.html", method);
    return asset("private", path, method);
  };
}
export const handler = (event) =>
  createHandler({ secret: process.env.COOKIE_SECRET })(event);
