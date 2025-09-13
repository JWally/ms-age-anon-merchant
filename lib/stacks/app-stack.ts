// lib/stacks/app-stack.ts
import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";

import { Construct } from "constructs";

import { LambdaConstruct } from "../constructs/lambda";
import { ApiGatewayConstruct } from "../constructs/api";
import { DomainConstruct } from "../constructs/domain";
import { WafConstruct } from "../constructs/waf";
import { WARMUP_EVENT } from "../../src-lambda/helpers/constants";
import { StaticSiteConstruct } from "../constructs/static-site";

interface AppStackProps extends cdk.StackProps {
  environment: string;
  stackName: string;
  rootDomain: string;
  stage: string;
  region: string;
  account: string;
  siteDomains?: string[];
}

export class TheStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);
    const { environment, stackName, rootDomain, stage, region, siteDomains } =
      props;

    // Create End-Point Lambda functions
    const lambdaConstruct = new LambdaConstruct(this, "Lambda", {
      environment,
      stackName,
      stage,
      projectName: id,
    });

    // Create API Gateway
    const apiGateway = new ApiGatewayConstruct(
      this,
      "Api",
      lambdaConstruct,
      stackName,
    );

    // Add WAF
    new WafConstruct(this, "Waf", {
      environment,
      apiGateway: apiGateway.api,
    });

    // Create custom domain and map it to API Gateway
    new DomainConstruct(this, "Domain", {
      stackName,
      rootDomain,
      stage,
      api: apiGateway.api,
      region,
    });

    // Static Site Construct From Loops
    if (!siteDomains || siteDomains.length === 0) {
      throw new Error("SITE DOMAINS NOT LOADED - EXITING");
    }
    siteDomains?.forEach((domain: string) => {
      new StaticSiteConstruct(this, `static-${stage}-${domain}`, {
        customDomain: `${stage}.${domain}`,
        rootDomain: domain,
      });
    });

    /// ///////////////////////////////////////////////////////////////////////
    ///
    ///  LAMBDA HEATERS
    ///
    /// ///////////////////////////////////////////////////////////////////////

    // These ping the lambdas every minute to reduce the number of cold starts

    // after you create warmupRule...
    const funcs = [lambdaConstruct.verifyFunction];

    // Warmup rule

    for (let i = 0; i < funcs.length; i++) {
      const fn = funcs[i];

      const warmupRule = new events.Rule(this, `WarmupRule-${i}`, {
        schedule: events.Schedule.rate(cdk.Duration.minutes(1)), // minimum is 1 minute
      });

      warmupRule.addTarget(
        new targets.LambdaFunction(fn, {
          event: events.RuleTargetInput.fromObject(WARMUP_EVENT),
        }),
      );
    }
  }
}
