import { App, DefaultStackSynthesizer } from "aws-cdk-lib";
import { HornpubStack } from "./stack.mjs";

const app = new App();
new HornpubStack(app, "HornpubFortressDemo", {
  env: { account: "263318538229", region: "us-east-1" },
  synthesizer: new DefaultStackSynthesizer({ qualifier: "probe2025" }),
});
