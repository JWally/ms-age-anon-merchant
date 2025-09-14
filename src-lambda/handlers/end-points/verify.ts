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

import { EcVerifySig } from "@justinwwolcott/ez-web-crypto";
import { isWarmingUp, onWarmup } from "../../helpers/middy-helpers";
import { POWERTOOLS_SERVICE_NAME } from "../../helpers/constants";
import {
  signPayload,
  getCurrentKeyId,
  getPublicKeys,
} from "../../services/key-management";

import { base64traverse, get64 } from "../../helpers/misc";

// Powertools
const TOOL_NAME = `${POWERTOOLS_SERVICE_NAME}-checkout`;

// Initialize Powertools
export const logger = new Logger({ serviceName: TOOL_NAME });
export const metrics = new Metrics({
  namespace: POWERTOOLS_SERVICE_NAME,
  serviceName: TOOL_NAME,
});

import { get } from "lodash";
import { server } from "@passwordless-id/webauthn";

// This is the actual handler
export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    // ------------------------------------------------------------------------
    // 1) Extract body, headers, and ipAddress
    // ------------------------------------------------------------------------
    const { body, headers } = event;
    const ipAddress = event.requestContext.identity.sourceIp;
    const origin = event.headers.origin;
    const verificationToken = event.headers["x-verification-token"] || "";
    const serverPublicKey = await getPublicKeys();
    const serverKeyId = await getCurrentKeyId();

    if (!ipAddress) throw new Error("No Ip Address on identity");
    if (!headers) throw new Error("No headers given on request");
    if (!body) throw new Error("No Body Provided on Event");

    // ------------------------------------------------------------------------
    // 2) Verify The User's Session Key and Signature
    // ------------------------------------------------------------------------
    //
    const [vtKey, vtStamp, vtSig] = verificationToken.split(".");
    const validVt = await EcVerifySig(
      vtKey,
      vtSig,
      btoa(`${vtKey}.${vtStamp}`),
    );

    if (!validVt) {
      throw new Error("Invalid Session Key Signature");
    }

    // ------------------------------------------------------------------------
    // 3) Verify The PassKey
    // ------------------------------------------------------------------------
    //
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
          ? "ES256"
          : "RS256",
      transports: ["platform"],
    };

    const expected = {
      challenge: get64(body, "response.clientDataJSON.challenge"),
      origin: origin,
      userVerified: true, // should be set if `userVerification` was set to `required` in the authentication options (default)
      counter: -1,
      verbose: true,
    };

    const passkeyResults = await server.verifyAuthentication(
      // @ts-expect-error: No puppet - not a string
      body,
      credentialKey,
      expected,
    );

    if (!passkeyResults.userVerified) {
      throw new Error("PassKey Verification Failed");
    }

    // ------------------------------------------------------------------------
    // 4) Verify The Bank Data
    // ------------------------------------------------------------------------
    //
    const kycTarget = get64(body, "response.clientDataJSON.challenge.target");
    const kycSignature = get64(
      body,
      "response.clientDataJSON.challenge.signature",
    );
    const kycKeyId = get64(body, "response.clientDataJSON.challenge.keyId");


    const {over_18, over_21, nonce, ipAddressHash, timestamp} = JSON.parse(atob(kycTarget))

    console.log({ kycKeyId, kycSignature, kycTarget, over_18, over_21, nonce, ipAddressHash, timestamp});

    if(!over_18){
      throw new Error("User Not Over 18")
    }

    if(!over_21){
      throw new Error("User Not over 21")
    }

        // Hash IP address with nonce for privacy
    const currentIpAddressHash = createHash("sha256")
      .update(nonce + ipAddress)
      .digest("hex");

    if(ipAddressHash !== currentIpAddressHash){
      throw new Error("Inconsistent IP Address")
    }

    if(Date.now() - parseInt(timestamp) > (1000 * 5 * 60)){
      throw new Error("Bank Signature is too old")
    }

    const bodyData = base64traverse(body);

    // @ts-expect-error: *eyes-roll*
    logger.info(bodyData);

    logger.info(body);

    metrics.addMetric("Success", "Count", 1);
    // ------------------------------------------------------------------------
    // 4) Return successful update to client
    // ------------------------------------------------------------------------
    return {
      statusCode: 200,
      body: JSON.stringify({ origin, verificationToken }),
    };
  } catch (error) {
    logger.error("Error processing request", { error });
    metrics.addMetric("Error", "Count", 1);
    throw createHttpError(500, "Internal Server Error");
  }
};

// Configure middleware stack
export const handler = middy(lambdaHandler)
  .use(warmup({ isWarmingUp, onWarmup }))
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser())
  .use(cors({ origin: "*", credentials: true }))
  .use(
    httpErrorHandler({
      fallbackMessage: "An unexpected error occurred",
      logger: (error) => logger.error("HTTP error", { error }),
    }),
  );
