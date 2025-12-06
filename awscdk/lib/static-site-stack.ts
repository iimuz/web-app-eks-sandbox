import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";

export class StaticSiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========================================
    // Configuration: Update these values
    // ========================================

    // Allowed IP addresses (CIDR notation)
    // Example: ['203.0.113.0/24', '198.51.100.1/32']
    // Set to empty array [] to allow all IPs (WAF will be created but not restrict)
    const allowedIpAddresses: string[] = [
      // Add your IP addresses here
      // '203.0.113.0/24',  // Example: Office network
      // '198.51.100.1/32', // Example: Specific IP
    ];

    // Allowed IPv6 addresses (CIDR notation)
    // Example: ['2001:db8::1/128']
    // Set to empty array [] to allow all IPv6 IPs
    const allowedIpv6Addresses: string[] = [
      // Add your IPv6 addresses here
      // '2001:db8::1/128', // Example: Specific IPv6
    ];

    // ========================================
    // S3 Bucket (Private)
    // ========================================
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      bucketName: undefined, // Auto-generated unique name
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false, // Enable if you want version history
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For sample only - change for production
      autoDeleteObjects: true, // For sample only - change for production
    });

    // Note: We specify region in stack props (us-east-1), so S3 bucket
    // will be created in us-east-1 by default. To create in ap-northeast-1,
    // we would need a cross-region stack setup, which is complex.
    // For simplicity, bucket will be in us-east-1 in this implementation.
    // For production with specific region needs, consider using cross-region references.

    // ========================================
    // CloudFront Origin Access Control (OAC)
    // ========================================
    const oac = new cloudfront.CfnOriginAccessControl(this, "OAC", {
      originAccessControlConfig: {
        name: `OAC-${this.stackName}`,
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
        description: "Origin Access Control for S3 static website",
      },
    });

    // ========================================
    // WAF - IP Set (only if IP restriction is enabled)
    // ========================================
    const ipSet =
      allowedIpAddresses.length > 0
        ? new wafv2.CfnIPSet(this, "AllowedIPSet", {
            name: `${this.stackName}-allowed-ips`,
            scope: "CLOUDFRONT", // CLOUDFRONT scope must be in us-east-1
            ipAddressVersion: "IPV4",
            addresses: allowedIpAddresses,
            description: "Allowed IP addresses for accessing the website",
          })
        : undefined;

    const ipSetV6 =
      allowedIpv6Addresses.length > 0
        ? new wafv2.CfnIPSet(this, "AllowedIPSetV6", {
            name: `${this.stackName}-allowed-ips-v6`,
            scope: "CLOUDFRONT", // CLOUDFRONT scope must be in us-east-1
            ipAddressVersion: "IPV6",
            addresses: allowedIpv6Addresses,
            description: "Allowed IPv6 addresses for accessing the website",
          })
        : undefined;

    // ========================================
    // WAF - Web ACL
    // ========================================
    const webAcl = new wafv2.CfnWebACL(this, "WebACL", {
      name: `${this.stackName}-webacl`,
      scope: "CLOUDFRONT",
      defaultAction:
        allowedIpAddresses.length > 0 || allowedIpv6Addresses.length > 0
          ? { block: {} } // Block by default if IP restriction is enabled
          : { allow: {} }, // Allow by default if no IPs specified
      rules: [
        ...(ipSet
          ? [
              {
                name: "AllowSpecificIPs",
                priority: 1,
                statement: {
                  ipSetReferenceStatement: {
                    arn: ipSet.attrArn,
                  },
                },
                action: { allow: {} },
                visibilityConfig: {
                  sampledRequestsEnabled: true,
                  cloudWatchMetricsEnabled: true,
                  metricName: "AllowSpecificIPsRule",
                },
              },
            ]
          : []),
        ...(ipSetV6
          ? [
              {
                name: "AllowSpecificIPsV6",
                priority: 2,
                statement: {
                  ipSetReferenceStatement: {
                    arn: ipSetV6.attrArn,
                  },
                },
                action: { allow: {} },
                visibilityConfig: {
                  sampledRequestsEnabled: true,
                  cloudWatchMetricsEnabled: true,
                  metricName: "AllowSpecificIPsV6Rule",
                },
              },
            ]
          : []),
      ],
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: `${this.stackName}-webacl`,
      },
      description: "Web ACL for IP-based access control",
    });

    // ========================================
    // CloudFront Distribution
    // ========================================
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
      ],
      webAclId: webAcl.attrArn,
      comment: "Static website distribution with WAF",
    });

    // Update CloudFront to use OAC
    const cfnDistribution = distribution.node
      .defaultChild as cloudfront.CfnDistribution;
    cfnDistribution.addPropertyOverride(
      "DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity",
      "",
    );
    cfnDistribution.addPropertyOverride(
      "DistributionConfig.Origins.0.OriginAccessControlId",
      oac.attrId,
    );

    // ========================================
    // S3 Bucket Policy - Allow CloudFront
    // ========================================
    const bucketPolicyStatement = new cdk.aws_iam.PolicyStatement({
      sid: "AllowCloudFrontServicePrincipal",
      effect: cdk.aws_iam.Effect.ALLOW,
      principals: [
        new cdk.aws_iam.ServicePrincipal("cloudfront.amazonaws.com"),
      ],
      actions: ["s3:GetObject"],
      resources: [websiteBucket.arnForObjects("*")],
      conditions: {
        StringEquals: {
          "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
        },
      },
    });

    websiteBucket.addToResourcePolicy(bucketPolicyStatement);

    // ========================================
    // Outputs
    // ========================================
    new cdk.CfnOutput(this, "BucketName", {
      value: websiteBucket.bucketName,
      description: "S3 bucket name for website files",
      exportName: `${this.stackName}-BucketName`,
    });

    new cdk.CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
      description: "CloudFront distribution ID",
      exportName: `${this.stackName}-DistributionId`,
    });

    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.distributionDomainName,
      description: "CloudFront distribution domain name",
      exportName: `${this.stackName}-DomainName`,
    });

    new cdk.CfnOutput(this, "WebsiteURL", {
      value: `https://${distribution.distributionDomainName}`,
      description: "Website URL",
    });

    new cdk.CfnOutput(this, "WebACLArn", {
      value: webAcl.attrArn,
      description: "WAF Web ACL ARN",
      exportName: `${this.stackName}-WebACLArn`,
    });
  }
}
