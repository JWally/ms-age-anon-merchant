import { test } from "node:test";
import assert from "node:assert/strict";
import { App, DefaultStackSynthesizer } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { HornpubStack } from "../infra/stack.mjs";
test("every site request is gated, uncached and uses an IAM-protected origin", () => {
  const stack = new HornpubStack(new App(), "Test", {
    env: { account: "263318538229", region: "us-east-1" },
    synthesizer: new DefaultStackSynthesizer({ qualifier: "probe2025" }),
  });
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::Lambda::Url", { AuthType: "AWS_IAM" });
  template.hasResourceProperties("AWS::CloudFront::OriginAccessControl", {
    OriginAccessControlConfig: {
      OriginAccessControlOriginType: "lambda",
      SigningBehavior: "always",
      SigningProtocol: "sigv4",
    },
  });
  const config = Object.values(
    template.findResources("AWS::CloudFront::Distribution"),
  )[0].Properties.DistributionConfig;
  assert.equal(
    config.DefaultCacheBehavior.CachePolicyId,
    "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
  );
  assert.equal(config.CacheBehaviors, undefined);
  assert.equal(config.Origins.length, 1);
  assert.deepEqual(config.Aliases, ["hornpub.click"]);
  assert.equal(
    Object.keys(template.findResources("AWS::S3::Bucket")).length,
    0,
  );
});
