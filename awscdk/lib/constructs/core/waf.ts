import * as cdk from "aws-cdk-lib";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";
import { Config } from "../../types";

export interface WafConstructProps {
  readonly config: Config;
}

export class WafConstruct extends Construct {
  public readonly webAclArn: string;

  constructor(scope: Construct, id: string, props: WafConstructProps) {
    super(scope, id);

    const { config } = props;
    const stackName = cdk.Stack.of(this).stackName;

    // ========================================
    // WAF & IP Set Configuration
    // ========================================
    const ipSet =
      config.allowedIpAddresses.length > 0
        ? new wafv2.CfnIPSet(this, "AllowedIPSet", {
            name: `${stackName}-allowed-ips`,
            scope: "CLOUDFRONT",
            ipAddressVersion: "IPV4",
            addresses: config.allowedIpAddresses,
          })
        : undefined;

    const ipSetV6 =
      config.allowedIpv6Addresses.length > 0
        ? new wafv2.CfnIPSet(this, "AllowedIPSetV6", {
            name: `${stackName}-allowed-ips-v6`,
            scope: "CLOUDFRONT",
            ipAddressVersion: "IPV6",
            addresses: config.allowedIpv6Addresses,
          })
        : undefined;

    const webAcl = new wafv2.CfnWebACL(this, "WebACL", {
      name: `${stackName}-webacl`,
      scope: "CLOUDFRONT",
      defaultAction: { allow: {} },
      rules: [
        ...(ipSet
          ? [
              {
                name: "AllowSpecificIPs",
                priority: 1,
                statement: { ipSetReferenceStatement: { arn: ipSet.attrArn } },
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
                name: "AllowSpecificIPv6s",
                priority: 2,
                statement: {
                  ipSetReferenceStatement: { arn: ipSetV6.attrArn },
                },
                action: { allow: {} },
                visibilityConfig: {
                  sampledRequestsEnabled: true,
                  cloudWatchMetricsEnabled: true,
                  metricName: "AllowSpecificIPv6sRule",
                },
              },
            ]
          : []),
      ],
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: `${stackName}-webacl`,
      },
    });

    this.webAclArn = webAcl.attrArn;
  }
}
