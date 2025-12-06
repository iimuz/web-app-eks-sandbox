import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { WebAppEksSandboxStack } from "./web-app-eks-sandbox-stack";
import { WebAppEksSandboxWafStack } from "./web-app-eks-sandbox-waf-stack";
import { WebAppEksSandboxStackProps } from "./types";

export class WebAppEksSandboxStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: WebAppEksSandboxStackProps) {
    super(scope, id, props);

    const wafStack = new WebAppEksSandboxWafStack(
      this,
      "WebAppEksSandboxWafStack",
      {
        ...props,
        env: {
          region: "us-east-1",
          account: props.env?.account,
        },
        crossRegionReferences: true,
      },
    );

    new WebAppEksSandboxStack(this, "WebAppEksSandboxStack", {
      ...props,
      webAclArn: wafStack.webAclArn,
      crossRegionReferences: true,
    });
  }
}
