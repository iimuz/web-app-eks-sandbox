import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { WebAppEksSandboxStackProps } from "./types";
import { WafConstruct } from "./constructs/core/waf";

export class WebAppEksSandboxWafStack extends cdk.Stack {
  public readonly webAclArn: string;

  constructor(scope: Construct, id: string, props: WebAppEksSandboxStackProps) {
    super(scope, id, {
      ...props,
      description: `WAF stack for Web App EKS Sandbox in ${props.config.stage}`,
    });

    const wafConstruct = new WafConstruct(this, "Waf", {
      config: props.config,
    });

    this.webAclArn = wafConstruct.webAclArn;

    new cdk.CfnOutput(this, "WebAclArn", {
      value: this.webAclArn,
    });
  }
}
