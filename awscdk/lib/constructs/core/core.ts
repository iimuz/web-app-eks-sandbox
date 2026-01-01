import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import {
  Distribution,
  ViewerProtocolPolicy,
  AllowedMethods,
  Function,
  FunctionCode,
  FunctionEventType,
} from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface CoreConstructProps {
  readonly consoleBucket: s3.IBucket;
  readonly webAclArn: string;
}

export class CoreConstruct extends Construct {
  constructor(scope: Construct, id: string, props: CoreConstructProps) {
    super(scope, id);

    const { consoleBucket, webAclArn } = props;
    const stackName = cdk.Stack.of(this).stackName;

    const basicAuthFunction = new Function(this, 'BasicAuthFunction', {
      code: FunctionCode.fromFile({
        filePath: path.join(
          __dirname,
          '../../../assets/functions/basic-auth.js'
        ),
      }),
    });

    // ========================================
    // CloudFront Distribution
    // ========================================
    const distribution = new Distribution(this, 'Distribution', {
      comment: `Distribution for ${stackName}`,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(consoleBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        '/console*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(consoleBucket),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
          functionAssociations: [
            {
              function: basicAuthFunction,
              eventType: FunctionEventType.VIEWER_REQUEST,
            },
          ],
        },
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/console/index.html',
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/console/index.html',
        },
      ],
      webAclId: webAclArn,
    });

    // ========================================
    // Outputs
    // ========================================
    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
    });
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
    });
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
    });

    const stageName = cdk.Stage.of(this)?.stageName.toLowerCase() || 'dev';
    new ssm.StringParameter(this, 'DistributionIdParam', {
      parameterName: `/${stageName}/service/console/distribution-id`,
      stringValue: distribution.distributionId,
    });
  }
}
