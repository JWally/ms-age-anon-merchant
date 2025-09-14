import * as path from "path";
import { Construct } from "constructs";
import { Duration, aws_iam as iam } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";

interface KeyRotationConstructProps {
  readonly environment: string;
  readonly stackName: string;
  readonly stage: string;
  readonly projectName: string;
}

export class SecretConstruct extends Construct {
  public readonly secret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props: KeyRotationConstructProps) {
    super(scope, id);

    const { stackName, environment, projectName, stage } = props;

    //
    // ────────────────────────────────────────────────────────
    // 1) CREATE A NEW SECRET IN SECRETS MANAGER
    // ────────────────────────────────────────────────────────
    this.secret = new secretsmanager.Secret(this, `SECURITY_KEY_${id}`, {
      secretName: `${stage}/${projectName}`, // e.g. "prod/my-app"
      description: "Auto-rotated secret for service keys",
    });

    //
    // ────────────────────────────────────────────────────────
    // 2) DEFINE COMMON LAMBDA CONFIGURATION OPTIONS
    // ────────────────────────────────────────────────────────
    const commonConfig: Omit<lambda.NodejsFunctionProps, "entry" | "handler"> =
      {
        runtime: Runtime.NODEJS_20_X,
        memorySize: 2048,
        tracing: Tracing.ACTIVE,
        bundling: {
          minify: true,
          sourceMap: true,
          target: "node20",
          keepNames: true,
          format: OutputFormat.CJS,
          mainFields: ["module", "main"],
          environment: {
            NODE_ENV: "production",
          },
        },
        environment: {
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
          ENVIRONMENT: environment,
          POWERTOOLS_SERVICE_NAME: stackName,
          POWERTOOLS_METRICS_NAMESPACE: stackName,
          LOG_LEVEL: "INFO",
        },
      };

    //
    // ────────────────────────────────────────────────────────
    // 3) DEFINE THE ROTATION LAMBDA FUNCTION
    // ────────────────────────────────────────────────────────
    const rotationFunction = new lambda.NodejsFunction(
      this,
      `${stackName}-secret-rotation`,
      {
        ...commonConfig,
        entry: path.join(
          __dirname,
          "../../src-lambda/services/rotate-aws-secrets.ts",
        ),
        handler: "handler", // assumes your rotate-aws-secrets.ts exports a `handler` function
        functionName: `${stackName}-secret-rotation`,
        environment: {
          // Preserve commonConfig.environment keys and override/add SECRET_ARN
          ...commonConfig.environment,
          SECRET_ARN: this.secret.secretArn,
        },
      },
    );

    //
    // ────────────────────────────────────────────────────────
    // 4) GRANT LAMBDA PERMISSIONS TO READ & WRITE THE SECRET
    // ────────────────────────────────────────────────────────
    this.secret.grantRead(rotationFunction);
    this.secret.grantWrite(rotationFunction);

    //
    // ────────────────────────────────────────────────────────
    // 5) SCHEDULE THE ROTATION LAMBDA EVERY 14 DAYS VIA EVENTBRIDGE
    // ────────────────────────────────────────────────────────
    const rotationSchedule = new events.Rule(this, "RotationSchedule", {
      schedule: events.Schedule.rate(Duration.days(14)),
      description:
        "Trigger the rotation Lambda to rotate the secret every 14 days",
    });
    rotationSchedule.addTarget(
      new targets.LambdaFunction(rotationFunction, {
        // use Event invocation to avoid waiting for a response
        event: events.RuleTargetInput.fromObject({}),
      }),
    );

    //
    // ────────────────────────────────────────────────────────
    // 6) IMMEDIATELY INVOKE THE ROTATION LAMBDA ON DEPLOYMENT
    // ────────────────────────────────────────────────────────
    //
    //    We create an AwsCustomResource that calls Lambda.Invoke right after
    //    CloudFormation creates or updates this construct. By using a changing
    //    physical resource ID (based on current timestamp), we ensure that any
    //    re-deployment will re-invoke the Lambda as needed.
    //
    new AwsCustomResource(this, "InvokeRotationFunctionOnCreate", {
      onCreate: {
        service: "Lambda",
        action: "invoke",
        parameters: {
          FunctionName: rotationFunction.functionName,
          InvocationType: "Event", // "Event" = asynchronous invoke, does not block
          Payload: JSON.stringify({ action: "rotate" }), // or {} if your handler ignores it
        },
        // Use a timestamp so that any stack update will re-invoke
        physicalResourceId: PhysicalResourceId.of(Date.now().toString()),
      },
      policy: AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ["lambda:InvokeFunction"],
          resources: [rotationFunction.functionArn],
        }),
      ]),
    });
  }
}
