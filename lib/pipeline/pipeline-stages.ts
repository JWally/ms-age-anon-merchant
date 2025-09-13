// file: pipeline-stacks.ts
import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { TheStack } from "../stacks/app-stack";

export class AppStage extends Stage {
  constructor(
    scope: Construct,
    id: string,
    rootDomain: string,
    props?: StageProps,
    siteDomains?: string[],
  ) {
    super(scope, id, props);
    new TheStack(this, "ms-age-anon-merchant", {
      // You might pass the environment from stage-level or override it here
      env: props?.env,
      environment: id.toLowerCase(), // e.g. 'dev', 'qa', 'uat', 'prod'
      stackName: `ms-age-anon-merchant-${id.toLowerCase()}-stack`,
      rootDomain: rootDomain,
      stage: id.toLowerCase().split("-")[0],
      region: props?.env?.region ?? "us-east-1",
      account: props?.env?.account ?? "XXXXXXX",
      siteDomains: siteDomains,
    });
  }
}
