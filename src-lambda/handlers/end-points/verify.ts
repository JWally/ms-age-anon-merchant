import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import createHttpError from "http-errors";

import { Logger } from "@aws-lambda-powertools/logger";
import { Metrics } from "@aws-lambda-powertools/metrics";

import middy from "@middy/core";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import warmup from "@middy/warmup";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import cors from "@middy/http-cors";

import { isWarmingUp, onWarmup } from "../../helpers/middy-helpers";
import { POWERTOOLS_SERVICE_NAME } from "../../helpers/constants";

import { base64traverse } from "../../helpers/misc";

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
    // 2) Extract body, headers, and ipAddress
    // ------------------------------------------------------------------------
    const { body, headers } = event;
    const ipAddress = event.requestContext.identity.sourceIp;
    const origin = event.headers.origin;

    // const resp

    if (!ipAddress) throw new Error("No Ip Address on identity");
    if (!headers) throw new Error("No headers given on request");
    if (!body) throw new Error("No Body Provided on Event");

    const bodyData = base64traverse(body);

    const credentialKey = {
      id: get(body, "id"),
      publicKey: get(
        body,
        "response.clientDataJSON.challenge.target.payload.credential.publicKey",
      ),
      algorithm: get(
        body,
        "response.clientDataJSON.challenge.target.payload.credential.algorithm",
      ),
      transports: ["platform"],
    };

    // @ts-expect-error: *eyes-roll*
    logger.info(bodyData);

    logger.info(body);

    metrics.addMetric("Success", "Count", 1);
    // ------------------------------------------------------------------------
    // 4) Return successful update to client
    // ------------------------------------------------------------------------
    return {
      statusCode: 200,
      body: JSON.stringify({ body }),
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
