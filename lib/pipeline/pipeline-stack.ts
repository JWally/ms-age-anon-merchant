import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CodePipeline,
  CodePipelineSource,
  CodeBuildStep,
  ManualApprovalStep,
} from "aws-cdk-lib/pipelines";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import { AppStage } from "./pipeline-stages";
import { PIPELINE } from "./constants";

export interface PipelineStackProps extends StackProps {
  rootDomain: string;
  repo: string;
  secretsManager: string;
  siteDomains: string[];
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const { rootDomain, siteDomains, repo } = props;

    // Define GitHub source using props
    const source = CodePipelineSource.connection(repo, "main", {
      triggerOnPush: true,
      connectionArn:
        "arn:aws:codeconnections:us-east-1:263318538229:connection/5e42184e-acde-441b-8273-47d29bf27bd5",
    });

    const pipeline = new CodePipeline(this, id, {
      crossAccountKeys: true,
      synth: new CodeBuildStep("Synth", {
        input: source,
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
          environmentVariables: {
            NODE_VERSION: { value: "20" },
          },
        },
        commands: [
          "n $NODE_VERSION",
          "npm ci",
          "npm run site:build",
          // "npm run lint:fix",
          // "npm run test",
          "npx cdk synth",
        ],
        rolePolicyStatements: [
          new PolicyStatement({
            actions: ["route53:ListHostedZonesByName"],
            resources: ["*"],
          }),
        ],
      }),
    });

    PIPELINE.forEach((PIPE_STAGE, ndx) => {
      const stage = new AppStage(
        this,
        PIPE_STAGE.name,
        rootDomain,
        {
          env: {
            account: props.env?.account,
            region: PIPE_STAGE.regions[0],
          },
        },
        siteDomains,
      );
      const deploy = pipeline.addStage(stage);

      if (ndx < PIPELINE.length - 1)
        deploy.addPost(new ManualApprovalStep(`PromoteFrom${PIPE_STAGE.name}`));
    });
  }
}
