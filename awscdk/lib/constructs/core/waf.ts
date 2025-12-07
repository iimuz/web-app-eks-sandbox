import * as cdk from "aws-cdk-lib";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";

export interface WafConstructProps {
  readonly allowedIpAddresses: string[];
  readonly allowedIpv6Addresses: string[];
}

export class WafConstruct extends Construct {
  public readonly webAclArn: string;

  constructor(scope: Construct, id: string, props: WafConstructProps) {
    super(scope, id);

    const stackName = cdk.Stack.of(this).stackName;

    // ========================================
    // WAF & IP Set Configuration
    // ========================================
    const ipSet =
      props.allowedIpAddresses.length > 0
        ? new wafv2.CfnIPSet(this, "AllowedIPSet", {
            name: `${stackName}-allowed-ips`,
            scope: "CLOUDFRONT",
            ipAddressVersion: "IPV4",
            addresses: props.allowedIpAddresses,
          })
        : undefined;

    const ipSetV6 =
      props.allowedIpv6Addresses.length > 0
        ? new wafv2.CfnIPSet(this, "AllowedIPSetV6", {
            name: `${stackName}-allowed-ips-v6`,
            scope: "CLOUDFRONT",
            ipAddressVersion: "IPV6",
            addresses: props.allowedIpv6Addresses,
          })
        : undefined;

    // Build OR statement for allowed IPs (IPv4 and/or IPv6)
    const ipStatements: wafv2.CfnWebACL.StatementProperty[] = [];
    if (ipSet) {
      ipStatements.push({ ipSetReferenceStatement: { arn: ipSet.attrArn } });
    }
    if (ipSetV6) {
      ipStatements.push({ ipSetReferenceStatement: { arn: ipSetV6.attrArn } });
    }

    const webAcl = new wafv2.CfnWebACL(this, "WebACL", {
      name: `${stackName}-webacl`,
      scope: "CLOUDFRONT",
      defaultAction: { block: {} },
      rules:
        ipStatements.length > 0
          ? [
              {
                name: "AllowWhitelistedIPs",
                priority: 1,
                statement:
                  ipStatements.length === 1
                    ? ipStatements[0]
                    : { orStatement: { statements: ipStatements } },
                action: { allow: {} },
                visibilityConfig: {
                  sampledRequestsEnabled: true,
                  cloudWatchMetricsEnabled: true,
                  metricName: "AllowWhitelistedIPsRule",
                },
              },
            ]
          : [],
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: `${stackName}-webacl`,
      },
    });

    this.webAclArn = webAcl.attrArn;
  }
}
