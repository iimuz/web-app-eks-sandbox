import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { WebAppEksSandboxStack } from "./web-app-eks-sandbox-stack";
import { WebAppEksSandboxStackProps } from "./types";

export class WebAppEksSandboxStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: WebAppEksSandboxStackProps) {
    super(scope, id, props);

    new WebAppEksSandboxStack(this, "WebAppEksSandboxStack", props);
  }
}
