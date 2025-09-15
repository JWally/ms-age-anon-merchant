import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import createHttpError from "http-errors";
import { Logger } from "@aws-lambda-powertools/logger";
import { Metrics } from "@aws-lambda-powertools/metrics";
import { createHash } from "crypto";

import middy from "@middy/core";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import warmup from "@middy/warmup";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import cors from "@middy/http-cors";

import { EcSignData, EcVerifySig } from "@justinwwolcott/ez-web-crypto";
import { isWarmingUp, onWarmup } from "../../helpers/middy-helpers";
import { POWERTOOLS_SERVICE_NAME } from "../../helpers/constants";
import {
  signPayload,
  getCurrentKeyId,
  getPublicKeys,
} from "../../services/key-management";

import { base64traverse, get64 } from "../../helpers/misc";
import { get } from "lodash";
import { server } from "@passwordless-id/webauthn";

// ============================================================================
// POWERTOOLS INITIALIZATION
// ============================================================================
const TOOL_NAME = `${POWERTOOLS_SERVICE_NAME}-verification`;

export const logger = new Logger({ serviceName: TOOL_NAME });
export const metrics = new Metrics({
  namespace: POWERTOOLS_SERVICE_NAME,
  serviceName: TOOL_NAME,
});

// ============================================================================
// CONSTANTS
// ============================================================================
const SESSION_TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

// ============================================================================
// MAIN LAMBDA HANDLER
// ============================================================================
/**
 * Handles verification verification requests with multiple security layers:
 * 1. Session key verification
 * 2. WebAuthn PassKey authentication
 * 3. Bank KYC data validation (age verification, IP consistency)
 *
 * @param event - API Gateway proxy event containing request data
 * @returns API Gateway proxy result with success or error response
 */
export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    // ========================================================================
    // STEP 1: EXTRACT AND VALIDATE REQUEST DATA
    // ========================================================================
    const { body, headers } = event;
    const ipAddress = event.requestContext.identity.sourceIp;
    const origin = event.headers.origin;
    const verificationToken = event.headers["x-verification-token"] || "";

    // Retrieve server keys for potential future use (though not used in current flow)
    const [serverPublicKeyInfo] = (await getPublicKeys()).filter((el) => {
      return el.status === "current";
    });
    const serverKeyId = await getCurrentKeyId();

    // Validate required fields are present
    if (!ipAddress) {
      throw createHttpError(400, "Missing IP address in request context");
    }
    if (!headers) {
      throw createHttpError(400, "Missing headers in request");
    }
    if (!body) {
      throw createHttpError(400, "Missing request body");
    }
    if (!verificationToken) {
      throw createHttpError(401, "Missing verification token");
    }
    if (!origin) {
      throw createHttpError(400, "Missing origin header");
    }

    // ========================================================================
    // STEP 2: VERIFY USER'S SESSION KEY AND SIGNATURE
    // ========================================================================
    /**
     * The verification token is a three-part string: key.timestamp.signature
     * We verify that the signature matches the key+timestamp combination
     */
    const tokenParts = verificationToken.split(".");
    if (tokenParts.length !== 3) {
      throw createHttpError(401, "Invalid verification token format");
    }

    const [vtKey, vtStamp, vtSig] = tokenParts;

    console.log(base64traverse(body));

    // Verify the session key signature using elliptic curve cryptography
    const validVt = await EcVerifySig(
      vtKey,
      vtSig,
      btoa(`${vtKey}.${vtStamp}`),
    );

    if (!validVt) {
      throw createHttpError(401, "Invalid session key signature");
    }

    // ========================================================================
    // STEP 3: VERIFY WEBAUTHN PASSKEY AUTHENTICATION
    // ========================================================================
    /**
     * Extract credential information from the WebAuthn response
     * This includes the credential ID, public key, and algorithm
     */
    const credentialKey = {
      id: get(body, "id"),
      publicKey: get64(
        body,
        "response.clientDataJSON.challenge.target.payload.credential.publicKey",
      ),
      algorithm:
        get64(
          body,
          "response.clientDataJSON.challenge.target.payload.credential.algorithm",
        ) == "-7"
          ? "ES256" // ECDSA with P-256 and SHA-256
          : "RS256", // RSASSA-PKCS1-v1_5 with SHA-256
      transports: ["platform"],
    };

    // Validate credential key components
    if (!credentialKey.id || !credentialKey.publicKey) {
      throw createHttpError(400, "Invalid PassKey credential data");
    }

    // Set up expected values for PassKey verification
    const expected = {
      challenge: get64(body, "response.clientDataJSON.challenge"),
      origin: origin,
      userVerified: true, // Requires user verification (biometric/PIN)
      counter: -1, // -1 means don't verify counter (replay protection)
      verbose: true,
    };

    if (!expected.challenge) {
      throw createHttpError(400, "Missing challenge in PassKey response");
    }

    // Perform PassKey verification
    const passkeyResults = await server.verifyAuthentication(
      // @ts-expect-error: Library expects string but we're passing structured data
      body,
      credentialKey,
      expected,
    );

    if (!passkeyResults.userVerified) {
      throw createHttpError(
        401,
        "PassKey verification failed - user not verified",
      );
    }

    // ========================================================================
    // STEP 4: VERIFY BANK KYC (KNOW YOUR CUSTOMER) DATA
    // ========================================================================
    /**
     * Extract and verify bank-provided KYC data including:
     * - Age verification (over 18 and over 21)
     * - IP address consistency check
     * - Timestamp freshness validation
     */
    const kycTarget: string = get64(
      body,
      "response.clientDataJSON.challenge.target",
    ) as string;
    const kycSignature = get64(
      body,
      "response.clientDataJSON.challenge.signature",
    );
    const kycKeyId = get64(body, "response.clientDataJSON.challenge.keyId");

    if (!kycTarget || !kycSignature || !kycKeyId) {
      throw createHttpError(400, "Missing KYC verification data");
    }

    // Parse the KYC payload
    let kycData;
    try {
      kycData = JSON.parse(atob(kycTarget));
    } catch (error) {
      throw createHttpError(400, "Invalid KYC data format");
    }

    const {
      over_18,
      over_21,
      nonce,
      ipAddressHash,
      timestamp: kycTimestamp,
    } = kycData;

    // Log KYC data for audit trail (consider removing sensitive data in production)
    logger.info("KYC verification data", {
      kycKeyId,
      over_18,
      over_21,
      kycTimestamp,
      // Don't log nonce or ipAddressHash for security
    });

    // ========================================================================
    // STEP 4.1: AGE VERIFICATION
    // ========================================================================
    if (!over_18) {
      throw createHttpError(
        403,
        "User does not meet minimum age requirement (18+)",
      );
    }

    if (!over_21) {
      throw createHttpError(403, "User does not meet age requirement (21+)");
    }

    // ========================================================================
    // STEP 4.2: IP ADDRESS CONSISTENCY CHECK
    // ========================================================================
    /**
     * Verify that the current request IP matches the one used during
     * bank verification (hashed with nonce for privacy)
     */
    if (!nonce || !ipAddressHash) {
      throw createHttpError(400, "Missing IP verification data");
    }

    const currentIpAddressHash = createHash("sha256")
      .update(nonce + ipAddress)
      .digest("hex");

    if (ipAddressHash !== currentIpAddressHash) {
      throw createHttpError(
        403,
        "IP address mismatch - request must originate from verified location",
      );
    }

    // ========================================================================
    // STEP 4.3: TIMESTAMP FRESHNESS VALIDATION
    // ========================================================================
    /**
     * Ensure the bank signature is recent (within 5 minutes)
     * to prevent replay attacks with old signatures
     */
    if (!kycTimestamp) {
      throw createHttpError(400, "Missing timestamp in KYC data");
    }

    const signatureAge = Date.now() - parseInt(kycTimestamp);
    if (signatureAge > SESSION_TOKEN_EXPIRY_MS) {
      throw createHttpError(
        401,
        "Bank verification has expired - please re-authenticate",
      );
    }

    // ========================================================================
    // STEP 5: LOG SUCCESS AND RETURN RESPONSE
    // ========================================================================
    // Convert body to base64 for logging (consider security implications)
    const bodyData = base64traverse(body);

    // Log successful verification
    logger.info("Verification successful", {
      origin,
      hasVerificationToken: true,
      // Don't log actual token for security
    });

    // Record success metric
    metrics.addMetric("VerificationSuccess", "Count", 1);

    // Build a response Nonce for Session Management
    // for 1 hour
    const sessionTTL = Date.now() + 1000 * 60 * 60;

    const sessionTarget = `${serverPublicKeyInfo.publicKey}.${vtKey}.${sessionTTL}`;
    const sessionSignature = await signPayload(btoa(sessionTarget));
    const sessionToken = `${sessionTarget}.${sessionSignature}`;

    // Return successful response
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        origin,
        sessionToken,
      }),
    };
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================

    // If it's already an HTTP error, log and re-throw it
    if (error instanceof createHttpError.HttpError) {
      logger.error("Verification failed", {
        statusCode: error.statusCode,
        message: error.message,
        error,
      });
      metrics.addMetric("VerificationError", "Count", 1);
      metrics.addMetric(`VerificationError${error.statusCode}`, "Count", 1);
      throw error;
    }

    // For unexpected errors, log and throw a generic 500
    logger.error("Unexpected error during verification", { error });
    metrics.addMetric("VerificationError", "Count", 1);
    metrics.addMetric("VerificationError500", "Count", 1);
    throw createHttpError(
      500,
      "An unexpected error occurred during verification",
    );
  }
};

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================
/**
 * Configure the middleware stack for the Lambda handler
 * Order matters: warmup should be first, error handler should be last
 */
export const handler = middy(lambdaHandler)
  // Handle Lambda warmup requests (prevents cold starts)
  .use(warmup({ isWarmingUp, onWarmup }))
  // Normalize HTTP headers to lowercase
  .use(httpHeaderNormalizer())
  // Parse JSON body automatically
  .use(httpJsonBodyParser())
  // Enable CORS for cross-origin requests
  .use(
    cors({
      origin: "*", // Consider restricting this in production
      credentials: true,
    }),
  )
  // Handle HTTP errors and format responses
  .use(
    httpErrorHandler({
      fallbackMessage: "An unexpected error occurred",
      logger: (error) => logger.error("HTTP middleware error", { error }),
    }),
  );
