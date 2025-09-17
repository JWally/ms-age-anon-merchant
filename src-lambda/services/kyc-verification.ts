// services/bank-verification.ts

import { Logger } from "@aws-lambda-powertools/logger";
import { EcVerifySig } from "@justinwwolcott/ez-web-crypto";
import createHttpError from "http-errors";
import {
  APPROVED_BANKS,
  isBankApproved,
  getBankConfig,
  BankKeyInfo,
} from "../helpers/kyc-config";

interface BankKeyCache {
  keys: Record<string, BankKeyInfo>;
  timestamp: number;
  expires: number;
}

interface BankPayload {
  target: string;
  signature: string;
  keyId: string;
  domain: string;
}

interface KycData {
  over_18: boolean;
  over_21: boolean;
  nonce: string;
  ipAddressHash: string;
  payload: string;
  timestamp: number;
  publicKey: string;
  publicKeyLocation: string;
}

// Initialize logger
const logger = new Logger({ serviceName: "BankVerification" });

// In-memory cache for bank public keys (15 minute TTL)
const bankKeyCache = new Map<string, BankKeyCache>();
const BANK_KEY_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Fetch and parse bank keys from their well-known endpoint
 */
async function fetchBankKeys(
  domain: string,
): Promise<Record<string, BankKeyInfo>> {
  const bankConfig = getBankConfig(domain);
  if (!bankConfig) {
    throw createHttpError(403, `Bank domain '${domain}' is not approved`);
  }

  const keyUrl = `https://api-${domain}${bankConfig.wellKnownPath}`;

  logger.debug("Fetching bank keys", { domain, keyUrl });

  try {
    const response = await fetch(keyUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "KYC-Verifier/1.0",
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawData = await response.json();

    // Use the bank-specific parser function
    const parsedKeys = bankConfig.keyParser(rawData);

    logger.info("Successfully fetched and parsed bank keys", {
      domain,
      keyCount: Object.keys(parsedKeys).length,
      keyIds: Object.keys(parsedKeys),
    });

    return parsedKeys;
  } catch (error) {
    logger.error("Failed to fetch bank keys", {
      domain,
      keyUrl,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw createHttpError(
        503,
        `Unable to connect to bank ${domain} key endpoint`,
      );
    }

    throw createHttpError(502, `Failed to fetch keys from bank ${domain}`);
  }
}

/**
 * Get cached bank keys or fetch if not cached
 */
async function getCachedBankKeys(
  domain: string,
): Promise<Record<string, BankKeyInfo>> {
  const cached = bankKeyCache.get(domain);

  if (cached && Date.now() < cached.expires) {
    logger.debug("Using cached bank keys", {
      domain,
      keyCount: Object.keys(cached.keys).length,
    });
    return cached.keys;
  }

  // Cache miss or expired - fetch fresh keys
  logger.debug("Cache miss or expired, fetching fresh bank keys", { domain });

  const keys = await fetchBankKeys(domain);

  // Cache the keys
  bankKeyCache.set(domain, {
    keys,
    timestamp: Date.now(),
    expires: Date.now() + BANK_KEY_CACHE_DURATION,
  });

  return keys;
}

/**
 * Main verification function - much simpler now!
 */
export async function verifyBankKycSignature(
  bankPayloadBase64: string,
): Promise<KycData> {
  // Step 1: Decode the bank payload
  let bankPayload: BankPayload;
  try {
    bankPayload = JSON.parse(atob(bankPayloadBase64));
  } catch (error) {
    throw createHttpError(
      400,
      "Invalid bank payload - could not parse base64 JSON",
    );
  }

  const { target, signature, keyId, domain } = bankPayload;

  if (!target || !signature || !keyId || !domain) {
    throw createHttpError(400, "Missing required fields in bank payload");
  }

  // Step 2: Check if bank is approved
  if (!isBankApproved(domain)) {
    logger.warn("KYC request from non-approved bank", {
      domain,
      approvedBanks: Object.keys(APPROVED_BANKS),
    });
    throw createHttpError(
      403,
      `Bank domain '${domain}' is not approved for KYC verification`,
    );
  }

  const bankConfig = getBankConfig(domain)!;
  logger.info("Verifying KYC signature from approved bank", {
    domain,
    bankName: bankConfig.name,
    keyId,
  });

  // Step 3: Get the bank's public keys
  let bankKeys: Record<string, BankKeyInfo>;
  try {
    bankKeys = await getCachedBankKeys(domain);
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      throw error;
    }
    throw createHttpError(502, `Failed to retrieve keys from bank ${domain}`);
  }

  // Step 4: Find the specific key
  const keyInfo = bankKeys[keyId];
  if (!keyInfo) {
    logger.error("Requested key not found in bank's key set", {
      domain,
      requestedKeyId: keyId,
      availableKeyIds: Object.keys(bankKeys),
    });
    throw createHttpError(
      404,
      `Key '${keyId}' not found in bank's published key set`,
    );
  }

  // Step 5: Verify the signature
  let isValidSignature: boolean;
  try {
    isValidSignature = await EcVerifySig(keyInfo.publicKey, signature, target);
  } catch (error) {
    logger.error("Error during bank signature verification", {
      error: error instanceof Error ? error.message : String(error),
      domain,
      keyId,
    });
    throw createHttpError(500, "Failed to verify bank signature");
  }

  if (!isValidSignature) {
    logger.error("Invalid bank signature", {
      domain,
      keyId,
      keyStatus: keyInfo.status,
      signatureLength: signature.length,
      targetLength: target.length,
    });
    throw createHttpError(401, "Invalid bank signature - data may be forged");
  }

  // Step 6: Decode and return the KYC data
  let kycData: KycData;
  try {
    kycData = JSON.parse(atob(target));
  } catch (error) {
    throw createHttpError(
      400,
      "Invalid KYC target data - could not parse base64 JSON",
    );
  }

  logger.info("Bank signature verified successfully", {
    domain,
    bankName: bankConfig.name,
    keyId,
    keyStatus: keyInfo.status,
    over_18: kycData.over_18,
    over_21: kycData.over_21,
  });

  return kycData;
}

/**
 * Clear bank key cache (useful for testing)
 */
export function clearBankKeyCache(): void {
  logger.debug("Clearing bank key cache");
  bankKeyCache.clear();
}

/**
 * Get bank key cache statistics
 */
export function getBankKeyCacheStats(): {
  totalDomains: number;
  totalKeys: number;
  domains: Array<{
    domain: string;
    keyCount: number;
    cacheAge: number;
    keyIds: string[];
  }>;
} {
  const domains: Array<{
    domain: string;
    keyCount: number;
    cacheAge: number;
    keyIds: string[];
  }> = [];

  let totalKeys = 0;

  for (const [domain, cache] of bankKeyCache.entries()) {
    const keyIds = Object.keys(cache.keys);
    const keyCount = keyIds.length;
    totalKeys += keyCount;

    domains.push({
      domain,
      keyCount,
      cacheAge: Date.now() - cache.timestamp,
      keyIds,
    });
  }

  return {
    totalDomains: bankKeyCache.size,
    totalKeys,
    domains,
  };
}
