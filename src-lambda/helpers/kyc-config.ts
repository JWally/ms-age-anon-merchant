// helpers/bank-config.ts

/**
 * Standard key info structure after parsing
 */
export interface BankKeyInfo {
  keyId: string;
  publicKey: string;
  status: string;
  createdAt?: number;
}

/**
 * Function type for parsing bank-specific key endpoint responses
 */
export type KeyParserFunction = (
  response: unknown,
) => Record<string, BankKeyInfo>;

/**
 * Configuration for approved banks that can provide KYC verification
 * In production, this would likely be stored in a database or secure config service
 */
export interface BankConfig {
  domain: string;
  wellKnownPath: string;
  name: string;
  enabled: boolean;
  keyParser: KeyParserFunction;
}

/**
 * IronBank key parser - handles their simple format
 */
function parseIronBankKeys(response: unknown): Record<string, BankKeyInfo> {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid response format from IronBank keys endpoint");
  }

  const data = response as { keys?: unknown[] };
  if (!Array.isArray(data.keys)) {
    throw new Error("Expected keys array in IronBank response");
  }

  const keyMap: Record<string, BankKeyInfo> = {};

  for (const key of data.keys) {
    if (!key || typeof key !== "object") continue;

    const keyData = key as {
      keyId?: string;
      publicKey?: string;
      status?: string;
      createdAt?: number;
    };

    if (!keyData.keyId || !keyData.publicKey) {
      continue; // Skip invalid keys
    }

    keyMap[keyData.keyId] = {
      keyId: keyData.keyId,
      publicKey: keyData.publicKey, // This is the base64 public key we need
      status: keyData.status || "unknown",
      createdAt: keyData.createdAt,
    };
  }

  return keyMap;
}

/**
 * JWKS (JSON Web Key Set) parser for standard JWKS format
 */
function parseJwksKeys(response: unknown): Record<string, BankKeyInfo> {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid JWKS response format");
  }

  const data = response as { keys?: unknown[] };
  if (!Array.isArray(data.keys)) {
    throw new Error("Expected keys array in JWKS response");
  }

  const keyMap: Record<string, BankKeyInfo> = {};

  for (const key of data.keys) {
    if (!key || typeof key !== "object") continue;

    const keyData = key as {
      kid?: string;
      x?: string;
      y?: string;
      kty?: string;
      use?: string;
    };

    if (!keyData.kid || keyData.kty !== "EC") {
      continue; // Only support EC keys for now
    }

    // Convert JWKS EC key to our format (this would need proper implementation)
    // For demo, we'll just use a placeholder
    keyMap[keyData.kid] = {
      keyId: keyData.kid,
      publicKey: `${keyData.x}${keyData.y}`, // Simplified - real implementation would convert properly
      status: keyData.use === "sig" ? "current" : "unknown",
    };
  }

  return keyMap;
}

export const APPROVED_BANKS: Record<string, BankConfig> = {
  "dev-jw.ironbank.click": {
    domain: "dev-jw.ironbank.click",
    wellKnownPath: "/.well-known/keys",
    name: "Iron Bank QA",
    enabled: true,
    keyParser: parseIronBankKeys,
  },
  "qa.ironbank.click": {
    domain: "qa.ironbank.click",
    wellKnownPath: "/.well-known/keys",
    name: "Iron Bank QA",
    enabled: true,
    keyParser: parseIronBankKeys,
  },
  "prod.ironbank.click": {
    domain: "prod.ironbank.click",
    wellKnownPath: "/.well-known/keys",
    name: "Iron Bank",
    enabled: true,
    keyParser: parseIronBankKeys,
  },
  "app.ironbank.click": {
    domain: "app.ironbank.click",
    wellKnownPath: "/.well-known/keys",
    name: "Iron Bank - THE APP",
    enabled: true,
    keyParser: parseIronBankKeys,
  },
  "api.democredit.com": {
    domain: "api.democredit.com",
    wellKnownPath: "/.well-known/jwks.json",
    name: "Demo Credit Union",
    enabled: false, // Can disable banks temporarily
    keyParser: parseJwksKeys,
  },
};

/**
 * Check if a bank domain is approved for KYC verification
 */
export function isBankApproved(domain: string): boolean {
  const bankConfig = APPROVED_BANKS[domain];
  return bankConfig?.enabled ?? false;
}

/**
 * Get bank configuration by domain
 */
export function getBankConfig(domain: string): BankConfig | null {
  return APPROVED_BANKS[domain] || null;
}
