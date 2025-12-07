import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { WafConstruct } from "@/lib/constructs/core/waf";

export interface WafStackProps extends cdk.StackProps {
  readonly allowedIpAddresses: string[];
  readonly allowedIpv6Addresses: string[];
}

export class WafStack extends cdk.Stack {
  public readonly webAclArn: string;

  constructor(scope: Construct, id: string, props: WafStackProps) {
    super(scope, id, {
      ...props,
      description: `WAF stack for Sandbox`,
    });

    const wafConstruct = new WafConstruct(this, "Waf", {
      allowedIpAddresses: props.allowedIpAddresses,
      allowedIpv6Addresses: props.allowedIpv6Addresses,
    });
    this.webAclArn = wafConstruct.webAclArn;
  }
}
