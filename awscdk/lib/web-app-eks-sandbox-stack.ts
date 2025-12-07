import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ConsoleConstruct } from "./constructs/console";
import { CoreConstruct } from "./constructs/core/core";
import { WebAppEksSandboxStackProps } from "./types";

export interface WebAppEksSandboxAppStackProps extends WebAppEksSandboxStackProps {
  readonly webAclArn: string;
}

export class WebAppEksSandboxStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: WebAppEksSandboxAppStackProps,
  ) {
    super(scope, id, {
      ...props,
      description: `Web App EKS Sandbox stack for the ${props.config.stage} environment.`,
    });

    const { config, webAclArn } = props;

    // 1. Create the console resources (S3 bucket)
    const consoleConstruct = new ConsoleConstruct(this, "ConsoleResources");

    // 2. Create the core resources (CloudFront, WAF) and pass the console bucket
    new CoreConstruct(this, "CoreResources", {
      consoleBucket: consoleConstruct.bucket,
      webAclArn: webAclArn,
    });
  }
}
