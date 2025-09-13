// lib/constructs/lambda.ts

import * as path from "path";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";

import { OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import { Duration } from "aws-cdk-lib";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

interface LambdaConstructProps {
  environment: string;
  stackName: string;
  stage: string;
  projectName: string;
}

/**
 * LambdaConstruct
 * ---------------
 * Creates:
 *  - Four NodejsFunction Lambdas (verify, web, mobile)
 *  - The secrets manager read permission for each Lambda
 *  - CloudWatch alarms for each function (errors, throttles, high duration)
 *
 * TODO: Wire these alarms to an SNS topic or Chatbot for notifications
 */
export class LambdaConstruct extends Construct {
  public readonly verifyFunction: lambda.NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    const { environment, stackName, projectName, stage } = props;

    // 2) Common Lambda configuration
    const commonConfig = {
      runtime: Runtime.NODEJS_20_X,
      memorySize: 1024,
      bundling: {
        minify: true,
        sourceMap: true,
        target: "node20",
        keepNames: true,
        format: OutputFormat.CJS,
        mainFields: ["module", "main"],
        environment: { NODE_ENV: "production" },
      },
      environment: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        ENVIRONMENT: environment,
        POWERTOOLS_SERVICE_NAME: stackName,
        POWERTOOLS_METRICS_NAMESPACE: stackName,
        LOG_LEVEL: "INFO",
      },
      tracing: Tracing.ACTIVE,
      LogRetention: RetentionDays.TWO_WEEKS,
    };

    // 3) IAM Logging Policy
    const IAM_LOGGING_POLICY = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
      ],
      resources: ["*"],
    });

    // 4) Create Lambdas
    this.verifyFunction = new lambda.NodejsFunction(
      this,
      `${stackName}-verify`,
      {
        ...commonConfig,
        entry: path.join(
          __dirname,
          "../../src-lambda/handlers/end-points/verify.ts",
        ),
        functionName: `${stackName}-verify`,
      },
    );

    // 5) Attach logging policy
    this.verifyFunction.addToRolePolicy(IAM_LOGGING_POLICY);

    // 6) Create alarms for each Lambda
    this.createLambdaAlarms(this.verifyFunction, "verifyFn");
  }

  /**
   * createLambdaAlarms
   * ------------------
   * Creates CloudWatch alarms for a single Lambda:
   *   - Errors > threshold
   *   - Throttles > threshold
   *   - High Duration p95
   *
   * Adjust thresholds as needed.
   */
  private createLambdaAlarms(fn: lambda.NodejsFunction, alarmPrefix: string) {
    // Error count alarm (in 5 minutes)
    new cloudwatch.Alarm(this, `${alarmPrefix}-Errors`, {
      metric: fn.metricErrors({
        period: Duration.minutes(5),
        statistic: "Sum",
      }),
      threshold: 5, // e.g. 5 errors in 5 minutes
      evaluationPeriods: 1,
      alarmDescription: `Lambda ${fn.functionName} has > 5 errors in a 5-minute interval`,
    });

    // Throttle alarm
    new cloudwatch.Alarm(this, `${alarmPrefix}-Throttles`, {
      metric: fn.metricThrottles({
        period: Duration.minutes(5),
        statistic: "Sum",
      }),
      threshold: 1, // 1 throttle in 5 minutes
      evaluationPeriods: 1,
      alarmDescription: `Lambda ${fn.functionName} is throttled`,
    });

    // High Duration (p95)
    new cloudwatch.Alarm(this, `${alarmPrefix}-HighDuration`, {
      metric: fn.metricDuration({
        period: Duration.minutes(5),
        statistic: "p95",
      }),
      threshold: 3000, // e.g. 3 seconds p95 threshold
      evaluationPeriods: 2,
      alarmDescription: `Lambda ${fn.functionName} p95 duration > 3s over 2 intervals`,
    });

    // TODO: Attach these alarms to an SNS topic or Slack/Chatbot. For example:
    // alarm.addAlarmAction(new actions.SnsAction(myTopic));
  }
}
