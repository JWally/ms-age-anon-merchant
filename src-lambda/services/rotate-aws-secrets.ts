// services/rotate-aws-secrets.ts

import { EcMakeSigKeys } from "@justinwwolcott/ez-web-crypto";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  PutSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { Logger } from "@aws-lambda-powertools/logger";

/**
 * Shape of the JSON object stored in Secrets Manager with key versioning
 */
interface SecretData {
  CURRENT_KEY_ID: string;
  CURRENT_SIGNATURE_PUBLIC_KEY: string;
  CURRENT_SIGNATURE_PRIVATE_KEY: string;
  PREVIOUS_KEY_ID?: string;
  PREVIOUS_SIGNATURE_PUBLIC_KEY?: string;
  KEY_ROTATED_AT: string;
}

/** Initialize Lambda Powertools logger */
const logger = new Logger({ serviceName: "KeyRotationLambda" });

/**
 * Lambda handler: Rotates signature keys with proper versioning.
 * Keeps the previous key for a grace period to allow verification of older signatures.
 */
export const handler = async (): Promise<void> => {
  // Read environment variables
  const REGION = process.env.AWS_REGION || "us-east-1";
  const SECRET_ARN = process.env.SECRET_ARN;

  logger.info("Lambda invoked: rotating signature keys", {
    region: REGION,
    secretArn: SECRET_ARN,
  });

  if (!SECRET_ARN) {
    const errMsg = "Environment variable SECRET_ARN is missing.";
    logger.error(errMsg);
    throw new Error(errMsg);
  }

  // Initialize Secrets Manager client
  const client = new SecretsManagerClient({ region: REGION });

  // Fetch existing secret to preserve previous key
  let existingData: SecretData | null = null;
  try {
    const getCommand = new GetSecretValueCommand({ SecretId: SECRET_ARN });
    const getResponse = await client.send(getCommand);

    if (getResponse.SecretString) {
      existingData = JSON.parse(getResponse.SecretString);
      logger.info("Retrieved existing keys for rotation", {
        currentKeyId: existingData.CURRENT_KEY_ID,
        hasPreviousKey: !!existingData.PREVIOUS_KEY_ID,
      });
    }
  } catch (fetchErr) {
    // First time setup - no existing keys
    logger.warn("No existing secret found, creating initial keys", {
      error: (fetchErr as Error).message,
    });
  }

  // Generate new signature key pair
  let signatureKeys: { publicKey: string; privateKey: string };
  try {
    // Force new signature keys
    signatureKeys = await EcMakeSigKeys(true);
    logger.info("Generated new signature key pair");
  } catch (sigErr) {
    logger.error("Failed to generate signature keys", {
      error: (sigErr as Error).message,
    });
    throw sigErr;
  }

  // Create new key ID with timestamp
  const newKeyId = `sig-${Date.now()}`;
  const rotationTimestamp = new Date().toISOString();

  // Build the new secret payload with key rotation
  const newSecretData: SecretData = {
    // New key becomes current
    CURRENT_KEY_ID: newKeyId,
    CURRENT_SIGNATURE_PUBLIC_KEY: signatureKeys.publicKey,
    CURRENT_SIGNATURE_PRIVATE_KEY: signatureKeys.privateKey,

    // Current key becomes previous (if it exists)
    PREVIOUS_KEY_ID: existingData?.CURRENT_KEY_ID,
    PREVIOUS_SIGNATURE_PUBLIC_KEY: existingData?.CURRENT_SIGNATURE_PUBLIC_KEY,

    // Timestamp for tracking
    KEY_ROTATED_AT: rotationTimestamp,
  };

  const newSecretJson = JSON.stringify(newSecretData);

  // Log the rotation (with private keys redacted)
  logger.info("Prepared new secret with key rotation", {
    newKeyId,
    previousKeyId: newSecretData.PREVIOUS_KEY_ID || "none",
    rotatedAt: rotationTimestamp,
  });

  // Write the updated secret to Secrets Manager
  try {
    const putCommand = new PutSecretValueCommand({
      SecretId: SECRET_ARN,
      SecretString: newSecretJson,
    });
    const putResponse = await client.send(putCommand);

    logger.info("Successfully rotated keys in Secrets Manager", {
      versionId: putResponse.VersionId,
      newKeyId,
      previousKeyId: newSecretData.PREVIOUS_KEY_ID,
    });
  } catch (putErr) {
    logger.error("Failed to write rotated keys to Secrets Manager", {
      error: (putErr as Error).message,
    });
    throw putErr;
  }

  logger.info("Key rotation completed successfully", {
    newKeyId,
    hadPreviousKey: !!existingData,
  });
};
