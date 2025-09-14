// services/key-management.ts

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { Logger } from "@aws-lambda-powertools/logger";
import { EcSignData } from "@justinwwolcott/ez-web-crypto";

interface SecretData {
  CURRENT_KEY_ID: string;
  CURRENT_SIGNATURE_PUBLIC_KEY: string;
  CURRENT_SIGNATURE_PRIVATE_KEY: string;
  PREVIOUS_KEY_ID?: string;
  PREVIOUS_SIGNATURE_PUBLIC_KEY?: string;
  KEY_ROTATED_AT: string;
}

interface PublicKeyInfo {
  keyId: string;
  publicKey: string;
  status: "current" | "previous";
  createdAt: number;
}

interface CachedKeys {
  keys: SecretData;
  timestamp: number;
  expires: number;
}

// Initialize logger
const logger = new Logger({ serviceName: "KeyManagement" });

// Initialize Secrets Manager client (reuse across invocations)
const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// In-memory cache for keys
let keyCache: CachedKeys | null = null;

// Cache duration: 15 minutes (configurable via environment)
const CACHE_DURATION = parseInt(process.env.KEY_CACHE_DURATION_MS || "900000");

/**
 * Get the secret ARN from environment variables
 */
function getSecretArn(): string {
  const secretArn = process.env.SECRET_ARN;
  if (!secretArn) {
    throw new Error("SECRET_ARN environment variable is required");
  }
  return secretArn;
}

/**
 * Check if cached keys are still valid
 */
function isCacheValid(): boolean {
  if (!keyCache) {
    return false;
  }

  const now = Date.now();
  const isValid = now < keyCache.expires;

  if (!isValid) {
    logger.debug("Key cache expired", {
      cacheAge: now - keyCache.timestamp,
      cacheDuration: CACHE_DURATION,
    });
  }

  return isValid;
}

/**
 * Fetch keys from AWS Secrets Manager
 */
async function fetchKeysFromSecretsManager(): Promise<SecretData> {
  const secretArn = getSecretArn();

  logger.debug("Fetching keys from Secrets Manager", { secretArn });

  try {
    const command = new GetSecretValueCommand({
      SecretId: secretArn,
    });

    const response = await secretsClient.send(command);

    if (!response.SecretString) {
      throw new Error("Secret value is empty");
    }

    const secretData: SecretData = JSON.parse(response.SecretString);

    // Validate that all required keys are present
    const requiredKeys: (keyof SecretData)[] = [
      "CURRENT_KEY_ID",
      "CURRENT_SIGNATURE_PUBLIC_KEY",
      "CURRENT_SIGNATURE_PRIVATE_KEY",
      "KEY_ROTATED_AT",
    ];

    for (const key of requiredKeys) {
      if (!secretData[key]) {
        throw new Error(`Required key '${key}' is missing from secret`);
      }
    }

    logger.info("Successfully fetched keys from Secrets Manager", {
      currentKeyId: secretData.CURRENT_KEY_ID,
      hasPreviousKey: !!secretData.PREVIOUS_KEY_ID,
    });

    return secretData;
  } catch (error) {
    logger.error("Failed to fetch keys from Secrets Manager", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get keys with caching - checks cache first, falls back to Secrets Manager
 */
export async function getCachedKeys(): Promise<SecretData> {
  // Check if we have valid cached keys
  if (isCacheValid()) {
    logger.debug("Using cached keys");
    return keyCache!.keys;
  }

  // Cache miss or expired - fetch from Secrets Manager
  logger.debug("Cache miss or expired, fetching fresh keys");

  try {
    const keys = await fetchKeysFromSecretsManager();

    // Update cache
    const now = Date.now();
    keyCache = {
      keys,
      timestamp: now,
      expires: now + CACHE_DURATION,
    };

    logger.debug("Updated key cache", {
      cacheExpires: new Date(keyCache.expires).toISOString(),
    });

    return keys;
  } catch (error) {
    // If we have expired cache but can't fetch new keys,
    // we could optionally return expired keys as fallback
    if (keyCache && keyCache.keys) {
      logger.warn(
        "Failed to fetch fresh keys, using expired cache as fallback",
        {
          error: error instanceof Error ? error.message : String(error),
          cacheAge: Date.now() - keyCache.timestamp,
        },
      );
      return keyCache.keys;
    }

    // No cache and can't fetch - propagate error
    throw error;
  }
}

/**
 * Get all public keys for verification (current and previous)
 */
export async function getPublicKeys(): Promise<PublicKeyInfo[]> {
  const keys = await getCachedKeys();
  const publicKeys: PublicKeyInfo[] = [];

  // Add current key
  publicKeys.push({
    keyId: keys.CURRENT_KEY_ID,
    publicKey: keys.CURRENT_SIGNATURE_PUBLIC_KEY,
    status: "current",
    createdAt: new Date(keys.KEY_ROTATED_AT).getTime(),
  });

  // Add previous key if it exists (for grace period)
  if (keys.PREVIOUS_KEY_ID && keys.PREVIOUS_SIGNATURE_PUBLIC_KEY) {
    // Estimate previous key creation time (90 days before current)
    const previousCreatedAt =
      new Date(keys.KEY_ROTATED_AT).getTime() - 90 * 24 * 60 * 60 * 1000;

    publicKeys.push({
      keyId: keys.PREVIOUS_KEY_ID,
      publicKey: keys.PREVIOUS_SIGNATURE_PUBLIC_KEY,
      status: "previous",
      createdAt: previousCreatedAt,
    });
  }

  return publicKeys;
}

/**
 * Get the current key ID
 */
export async function getCurrentKeyId(): Promise<string> {
  const keys = await getCachedKeys();
  return keys.CURRENT_KEY_ID;
}

/**
 * Sign a payload using the current private signature key
 */
export async function signPayload(payload: string): Promise<string> {
  try {
    const keys = await getCachedKeys();

    logger.debug("Signing payload", {
      payloadLength: payload.length,
      keyId: keys.CURRENT_KEY_ID,
    });

    // Use the EcSignData function from ez-web-crypto
    const signature = await EcSignData(
      keys.CURRENT_SIGNATURE_PRIVATE_KEY,
      payload,
    );

    logger.debug("Successfully signed payload");
    return signature;
  } catch (error) {
    logger.error("Failed to sign payload", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Force refresh the key cache (useful for testing or manual refresh)
 */
export async function refreshKeyCache(): Promise<void> {
  logger.info("Forcing key cache refresh");
  keyCache = null;
  await getCachedKeys();
}

/**
 * Clear the key cache (useful for testing)
 */
export function clearKeyCache(): void {
  logger.debug("Clearing key cache");
  keyCache = null;
}

/**
 * Get cache statistics (useful for monitoring)
 */
export function getCacheStats(): {
  isCached: boolean;
  cacheAge?: number;
  timeUntilExpiry?: number;
} {
  if (!keyCache) {
    return { isCached: false };
  }

  const now = Date.now();
  return {
    isCached: true,
    cacheAge: now - keyCache.timestamp,
    timeUntilExpiry: keyCache.expires - now,
  };
}
