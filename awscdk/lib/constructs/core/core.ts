import * as cdk from "aws-cdk-lib";
import {
  Function,
  FunctionCode,
  FunctionEventType,
  Distribution,
  ViewerProtocolPolicy,
  AllowedMethods,
} from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as path from "path"; // Import path module

export interface CoreConstructProps {
  readonly consoleBucket: s3.IBucket;
  readonly webAclArn: string;
}

export class CoreConstruct extends Construct {
  constructor(scope: Construct, id: string, props: CoreConstructProps) {
    super(scope, id);

    const { consoleBucket, webAclArn } = props;
    const stackName = cdk.Stack.of(this).stackName;

    // ========================================
    // CloudFront Function for URL Rewrite
    // ========================================
    const rewriteFunction = new Function(this, "RewriteFunction", {
      functionName: `${stackName}-rewrite-console-path`,
      code: FunctionCode.fromFile({
        filePath: path.join(
          __dirname,
          "../../../assets/functions/rewrite-console-path.js",
        ),
      }),
      comment: "Rewrites /console path to root for S3 origin",
    });

    // ========================================
    // CloudFront Distribution
    // ========================================
    const distribution = new Distribution(this, "Distribution", {
      comment: `Distribution for ${stackName}`,
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new origins.HttpOrigin("invalid.example.com"),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        "/console*": {
          origin: origins.S3BucketOrigin.withOriginAccessControl(consoleBucket),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
          functionAssociations: [
            {
              function: rewriteFunction,
              eventType: FunctionEventType.VIEWER_REQUEST,
            },
          ],
        },
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
      webAclId: webAclArn,
    });

    // ========================================
    // Outputs
    // ========================================
    new cdk.CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
    });
    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.distributionDomainName,
    });
    new cdk.CfnOutput(this, "WebsiteURL", {
      value: `https://${distribution.distributionDomainName}`,
    });
  }
}
