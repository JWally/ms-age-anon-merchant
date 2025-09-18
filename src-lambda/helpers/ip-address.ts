// imports
import { APIGatewayProxyEvent } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { createHash } from "crypto";
import { isIP, isIPv4, isIPv6 } from "net";

interface IpExtractionResult {
  ip: string | null;
  source: "x-forwarded-for" | "http-api-v2" | "rest-api" | "none";
  originalXff?: string;
  originalSourceIp?: string;
}

function stripPort(ip: string): string {
  if (!ip) return ip;
  // [IPv6]:port
  const m = ip.match(/^\[([^\]]+)\]:(\d+)$/);
  if (m) return m[1];
  // bare :port (IPv4 or unbracketed IPv6 with trailing :port)
  // use last colon to avoid chopping IPv6 colons
  const lastColon = ip.lastIndexOf(":");
  if (lastColon > -1 && ip.indexOf(":") === lastColon) {
    // single colon → likely host:port (IPv4 or hostname)
    const maybePort = ip.slice(lastColon + 1);
    if (/^\d+$/.test(maybePort)) return ip.slice(0, lastColon);
  }
  return ip;
}

function normalizeAndValidateIp(ip: string): string | null {
  if (!ip || typeof ip !== "string") return null;

  // Take first, trim
  let candidate = ip.trim();

  // Reject obvious garbage early
  if (!/^[\w\.\:\[\],\-]+$/.test(candidate)) return null;

  candidate = stripPort(candidate);

  // ::ffff:1.2.3.4 → 1.2.3.4
  const mapped = candidate.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) candidate = mapped[1];

  // Lowercase IPv6
  if (candidate.includes(":")) candidate = candidate.toLowerCase();

  // Final validation via Node
  const v = isIP(candidate);
  if (v === 4) {
    // Extra strict: disallow leading-zero octets
    const ok = candidate
      .split(".")
      .every((o) => /^\d+$/.test(o) && String(+o) === o && +o <= 255);
    return ok ? candidate : null;
  }
  if (v === 6) return candidate;

  return null;
}

function pickFromXff(xff: string): string | null {
  // RFC 7239 “Forwarded” header exists too, but XFF is more common with API GW.
  // Take the first non-empty token
  const first = String(xff)
    .split(",")
    .map((s) => s.trim())
    .find(Boolean);
  return first ? normalizeAndValidateIp(first) : null;
}

function extractIpWithSource(event: APIGatewayProxyEvent): IpExtractionResult {
  const headers = event.headers || {};
  const originalXff = headers["x-forwarded-for"] ?? headers["X-Forwarded-For"];
  const httpSrc = (event as any).requestContext?.http?.sourceIp as
    | string
    | undefined;
  const restSrc = event.requestContext?.identity?.sourceIp;

  // 1) XFF (only if present)
  if (originalXff) {
    const ip = pickFromXff(originalXff);
    if (ip) {
      // Optional guard: if we also have a direct source IP and it’s not an AWS edge,
      // consider preferring the direct source IP to avoid spoofing.
      return {
        ip,
        source: "x-forwarded-for",
        originalXff,
        originalSourceIp: httpSrc ?? restSrc ?? undefined,
      };
    }
  }

  // 2) HTTP API v2
  if (httpSrc) {
    const ip = normalizeAndValidateIp(httpSrc);
    if (ip)
      return {
        ip,
        source: "http-api-v2",
        originalXff,
        originalSourceIp: httpSrc,
      };
  }

  // 3) REST API v1
  if (restSrc) {
    const ip = normalizeAndValidateIp(restSrc);
    if (ip)
      return { ip, source: "rest-api", originalXff, originalSourceIp: restSrc };
  }

  return {
    ip: null,
    source: "none",
    originalXff,
    originalSourceIp: httpSrc ?? restSrc ?? undefined,
  };
}

export function getClientIp(
  event: APIGatewayProxyEvent,
  logger?: Logger,
): string | null {
  const res = extractIpWithSource(event);
  if (logger) {
    logger.debug("IP extraction details", {
      extractedIp: res.ip,
      source: res.source,
      hasXff: Boolean(res.originalXff),
      // Avoid logging raw IPs unless explicitly enabled
      xffSample: process.env.DEBUG_IP === "1" ? res.originalXff : undefined,
      srcSample:
        process.env.DEBUG_IP === "1" ? res.originalSourceIp : undefined,
    });
  }
  return res.ip;
}

export function getClientIpWithDetails(
  event: APIGatewayProxyEvent,
): IpExtractionResult {
  return extractIpWithSource(event);
}

export function areIpsEquivalent(a: string, b: string): boolean {
  const aa = normalizeAndValidateIp(a);
  const bb = normalizeAndValidateIp(b);
  return aa !== null && bb !== null && aa === bb;
}

export function createIpHash(ip: string, nonce: string): string | null {
  const norm = normalizeAndValidateIp(ip);
  if (!norm) return null;
  return createHash("sha256")
    .update(nonce + norm)
    .digest("hex");
}
