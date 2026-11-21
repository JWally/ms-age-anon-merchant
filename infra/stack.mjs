import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  SecretValue,
} from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  HeadersFrameOption,
  HeadersReferrerPolicy,
  HttpVersion,
  OriginRequestPolicy,
  PriceClass,
  ResponseHeadersPolicy,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { FunctionUrlOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  Code,
  Function as LambdaFunction,
  FunctionUrlAuthType,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import {
  AaaaRecord,
  ARecord,
  HostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const DOMAIN = "hornpub.click";
const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'self' https://captcha.wolcott.cc https://fortress.wolcott.cc",
  "style-src 'self' 'unsafe-inline' https://captcha.wolcott.cc",
  "connect-src 'self' https://captcha.wolcott.cc wss://captcha.wolcott.cc https://fortress.wolcott.cc https://collect.edge.wolcott.cc https://sigint.sigint.wolcott.cc https://dns.sigint.wolcott.cc",
  "img-src 'self' data: https://fortress.wolcott.cc https://dns.sigint.wolcott.cc",
  "frame-src https://fortress.wolcott.cc https://collect.edge.wolcott.cc",
  "worker-src 'self' blob: https://fortress.wolcott.cc",
  "font-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

export class HornpubStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const zone = HostedZone.fromHostedZoneAttributes(this, "Zone", {
      hostedZoneId: "Z0478264BJYKL1B27OVB",
      zoneName: "hornpub.click",
    });
    const certificate = new Certificate(this, "Certificate", {
      domainName: DOMAIN,
      validation: CertificateValidation.fromDns(zone),
    });
    const sessionSecret = new Secret(this, "SessionSecret", {
      generateSecretString: { passwordLength: 48, excludePunctuation: true },
    });
    const merchantSecret = new Secret(this, "MerchantVerifySecret", {
      secretName: "hornpub/merchant-verify",
      generateSecretString: { passwordLength: 48, excludePunctuation: true },
      removalPolicy: RemovalPolicy.RETAIN,
    });
    const backend = new LambdaFunction(this, "Backend", {
      runtime: Runtime.NODEJS_22_X,
      handler: "app.handler",
      code: Code.fromAsset(join(root, "build/lambda")),
      memorySize: 128,
      timeout: Duration.seconds(15),
      reservedConcurrentExecutions: 20,
      environment: {
        COOKIE_SECRET: SecretValue.secretsManager(
          sessionSecret.secretArn,
        ).unsafeUnwrap(),
        MERCHANT_SECRET_ARN: merchantSecret.secretArn,
      },
    });
    merchantSecret.grantRead(backend);
    const url = backend.addFunctionUrl({
      authType: FunctionUrlAuthType.AWS_IAM,
    });
    const headers = new ResponseHeadersPolicy(this, "Headers", {
      securityHeadersBehavior: {
        strictTransportSecurity: {
          accessControlMaxAge: Duration.days(365),
          includeSubdomains: true,
          override: true,
        },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: HeadersFrameOption.DENY, override: true },
        referrerPolicy: {
          referrerPolicy: HeadersReferrerPolicy.NO_REFERRER,
          override: true,
        },
        contentSecurityPolicy: {
          contentSecurityPolicy: CONTENT_SECURITY_POLICY,
          override: true,
        },
      },
    });
    const apiBehavior = {
      origin: FunctionUrlOrigin.withOriginAccessControl(url),
      allowedMethods: AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
      cachePolicy: CachePolicy.CACHING_DISABLED,
      originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      responseHeadersPolicy: headers,
    };
    const distribution = new Distribution(this, "Distribution", {
      domainNames: [DOMAIN],
      certificate,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: HttpVersion.HTTP2,
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        ...apiBehavior,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,
      },
      errorResponses: [403, 404, 500, 502, 503].map((httpStatus) => ({
        httpStatus,
        ttl: Duration.seconds(0),
      })),
    });
    new ARecord(this, "AliasIpv4", {
      zone,
      recordName: DOMAIN,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
    new AaaaRecord(this, "AliasIpv6", {
      zone,
      recordName: DOMAIN,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
    new CfnOutput(this, "SiteUrl", { value: `https://${DOMAIN}` });
    new CfnOutput(this, "BackendName", { value: backend.functionName });
    new CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
    });
  }
}
