import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ConsoleConstruct } from './constructs/console';
import { CoreConstruct } from './constructs/core';

export class WebAppEksSandboxStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Create the console resources (S3 bucket)
    const consoleConstruct = new ConsoleConstruct(this, 'ConsoleResources');

    // 2. Create the core resources (CloudFront, WAF) and pass the console bucket
    new CoreConstruct(this, 'CoreResources', {
      consoleBucket: consoleConstruct.bucket,
    });
  }
}
