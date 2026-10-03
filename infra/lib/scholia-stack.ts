import {CfnOutput, Duration, Stack, type StackProps} from 'aws-cdk-lib'
import {Certificate} from 'aws-cdk-lib/aws-certificatemanager'
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  Function as CfFunction,
  FunctionCode,
  FunctionEventType,
  OriginRequestPolicy,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import {FunctionUrlOrigin} from 'aws-cdk-lib/aws-cloudfront-origins'
import {Platform} from 'aws-cdk-lib/aws-ecr-assets'
import {PolicyStatement} from 'aws-cdk-lib/aws-iam'
import {DockerImageCode, DockerImageFunction, FunctionUrlAuthType, InvokeMode} from 'aws-cdk-lib/aws-lambda'
import {RetentionDays} from 'aws-cdk-lib/aws-logs'
import type {Construct} from 'constructs'

type Props = StackProps & {domainName?: string; certificateArn?: string}

// Cheapest shape that still streams: one container Lambda behind a Function URL, fronted by CloudFront
// for HTTPS and the custom domain. Idle cost is zero.
export class ScholiaStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    const env = (name: string, fallback?: string) => {
      const v = process.env[name] ?? fallback
      if (v === undefined) throw new Error(`${name} must be set in the environment`)
      return v
    }

    const fn = new DockerImageFunction(this, 'Web', {
      code: DockerImageCode.fromImageAsset('..', {
        platform: Platform.LINUX_AMD64,
        buildArgs: {NEXT_PUBLIC_SANITY_PROJECT_ID: env('NEXT_PUBLIC_SANITY_PROJECT_ID')},
        exclude: ['node_modules', '.next', 'data', 'infra', '.git'],
      }),
      memorySize: 1536,
      timeout: Duration.seconds(120),
      logRetention: RetentionDays.TWO_WEEKS,
      environment: {
        NEXT_PUBLIC_SANITY_PROJECT_ID: env('NEXT_PUBLIC_SANITY_PROJECT_ID'),
        NEXT_PUBLIC_SANITY_DATASET: env('NEXT_PUBLIC_SANITY_DATASET', 'production'),
        SANITY_ORGANIZATION_TOKEN: env('SANITY_ORGANIZATION_TOKEN'),
        SANITY_CONTEXT_MCP_URL: env('SANITY_CONTEXT_MCP_URL'),
        SANITY_WRITE_TOKEN: env('SANITY_WRITE_TOKEN'),
        TAVILY_API_KEY: env('TAVILY_API_KEY'),
        BEDROCK_MODEL_AGENT: env('BEDROCK_MODEL_AGENT', 'us.amazon.nova-2-lite-v1:0'),
        BEDROCK_MODEL_FAST: env('BEDROCK_MODEL_FAST', 'us.amazon.nova-micro-v1:0'),
      },
    })
    fn.addToRolePolicy(
      new PolicyStatement({actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'], resources: ['*']}),
    )

    // IAM auth + origin access control: only CloudFront can invoke the Function URL.
    // Browsers must send x-amz-content-sha256 on POST (the chat transport does).
    const url = fn.addFunctionUrl({authType: FunctionUrlAuthType.AWS_IAM, invokeMode: InvokeMode.RESPONSE_STREAM})

    // Only the custom domain is served; the *.cloudfront.net hostname answers 403.
    const hostGuard = props.domainName
      ? new CfFunction(this, 'HostGuard', {
          code: FunctionCode.fromInline(`function handler(event) {
  var host = event.request.headers.host && event.request.headers.host.value;
  if (host !== '${props.domainName}') {
    return {statusCode: 403, statusDescription: 'Forbidden', body: {encoding: 'text', data: 'Use https://${props.domainName}'}};
  }
  return event.request;
}`),
        })
      : undefined

    const cert = props.certificateArn ? Certificate.fromCertificateArn(this, 'Cert', props.certificateArn) : undefined
    const dist = new Distribution(this, 'Cdn', {
      defaultBehavior: {
        origin: FunctionUrlOrigin.withOriginAccessControl(url, {readTimeout: Duration.seconds(60)}),
        functionAssociations: hostGuard ? [{function: hostGuard, eventType: FunctionEventType.VIEWER_REQUEST}] : undefined,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: props.domainName && cert ? [props.domainName] : undefined,
      certificate: cert,
      comment: 'Scholia',
    })

    new CfnOutput(this, 'FunctionUrl', {value: url.url})
    new CfnOutput(this, 'CloudFrontDomain', {value: dist.distributionDomainName})
  }
}
