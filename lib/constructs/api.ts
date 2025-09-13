// lib/constructs/api.ts

import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as logs from "aws-cdk-lib/aws-logs";
import { LambdaConstruct } from "./lambda";
import { verificationSchemaForAPIGW } from "../helpers/schemas";

/**
 * ApiGatewayConstruct
 * -------------------
 * Creates:
 * - A REST API Gateway
 * - Log group for the API
 * - CORS (restricted to GET, POST, OPTIONS)
 * - Alarms for 4XX, 5XX, p95 latency, throttles, and potential "no traffic"
 *
 * TODO: Connect these alarms to an SNS Topic or Chatbot for notifications.
 */
export class ApiGatewayConstruct extends Construct {
  public readonly api: apigateway.RestApi;

  constructor(
    scope: Construct,
    id: string,
    lambdaConstruct: LambdaConstruct,
    stackName: string,
  ) {
    super(scope, id);

    const name = stackName || "no-name";

    // Create the log group for access logs
    const logGroup = new logs.LogGroup(this, `${stackName}-api-logs`, {
      retention: logs.RetentionDays.TWO_WEEKS,
    });

    // Create the API Gateway
    this.api = new apigateway.RestApi(this, name, {
      restApiName: stackName,
      cloudWatchRole: true,
      defaultCorsPreflightOptions: {
        allowOrigins: [`*`], // Example: Restrict to main domain; or use an array for multiple
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["*"],
      },
      deployOptions: {
        stageName: "prod",
        tracingEnabled: true,
        dataTraceEnabled: false,
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
      },
    });

    // Make Models
    const { bodyValidator, verificationModel } = this.makeVerificationModels();

    // ////////////////////////////////////////////////////////////////////////
    //
    // Add routes and resources
    //
    // ////////////////////////////////////////////////////////////////////////

    // Create /v1 as the root resource
    const v1 = this.api.root.addResource("v1");

    // Attach checkout to v1
    const verifyResource = v1.addResource("verify");

    // Give checkout a post method
    verifyResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaConstruct.verifyFunction, {
        // If there's no matching model for the Content-Type, immediately fail
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      }),
      {
        requestValidator: bodyValidator,
        requestModels: {
          "application/json": verificationModel,
        },
        // require the header so no header -> 400
        requestParameters: {
          "method.request.header.Content-Type": true,
        },
      },
    );
  }

  // ////////////////////////////////////////////////////////////////////////
  //
  // ** ATTACH VALIDATION MODELS TO APIGW **
  //
  // ////////////////////////////////////////////////////////////////////////
  private makeVerificationModels() {
    //
    // Anything not validated, triggering 4xx or 5xx needs CORS enabled
    // so this:
    //
    this.api.addGatewayResponse("Default4xx", {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers": "'*'",
        "Access-Control-Allow-Methods": "'OPTIONS,POST,GET'",
      },
      // Optionally specify a custom response body / statusCode, etc.
    });

    this.api.addGatewayResponse("Default5xx", {
      type: apigateway.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers": "'*'",
        "Access-Control-Allow-Methods": "'OPTIONS,POST,GET'",
      },
    });

    // 1) Create a Request Validator:
    const bodyValidator = new apigateway.RequestValidator(
      this,
      "BodyValidator",
      {
        restApi: this.api,
        validateRequestBody: true,
        validateRequestParameters: false, // or true if you also want param validation
      },
    );

    // 2) Create Models for each schema. For example, for timestamp:
    const verificationModel = new apigateway.Model(this, "VerificationModel", {
      restApi: this.api,
      contentType: "application/json",
      schema: verificationSchemaForAPIGW, // The schema you exported
      modelName: "VerificationModel",
    });

    return { verificationModel, bodyValidator };
  }
}
