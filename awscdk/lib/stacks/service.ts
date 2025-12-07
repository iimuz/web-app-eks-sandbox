import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ConsoleConstruct } from "@/lib/constructs/console";
import { CoreConstruct } from "@/lib/constructs/core/core";

export interface ServiceStackProps extends cdk.StackProps {
  readonly webAclArn: string;
}

export class ServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, {
      ...props,
      description: `Web App Service stack.`,
    });

    // 1. Create the console resources (S3 bucket)
    const consoleConstruct = new ConsoleConstruct(this, "ConsoleResources");

    // 2. Create the core resources (CloudFront, WAF) and pass the console bucket
    new CoreConstruct(this, "CoreResources", {
      consoleBucket: consoleConstruct.bucket,
      webAclArn: props.webAclArn,
    });
  }
}
