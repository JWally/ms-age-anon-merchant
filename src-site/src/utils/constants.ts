export const STACK_STAGES: string[] = ["dev", "qa", "uat", "prod"];

export const ACCOUNTED_FOR_STAGES: string[] = [...STACK_STAGES, "dev-jw"];

const [TEST_ENV] = document.location.host.split(".");

let demo_stage;

if (ACCOUNTED_FOR_STAGES.includes(TEST_ENV)) {
  demo_stage = TEST_ENV;
} else {
  demo_stage = "dev-jw";
}

export const DEMO_STAGE = demo_stage;

export const DEMO_API_URL: string = `https://api-${DEMO_STAGE}.iron-bank.net/v1/checkout`;
