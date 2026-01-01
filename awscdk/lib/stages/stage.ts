import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ServiceStack } from '@/lib/stacks/service';
import { WafStack } from '@/lib/stacks/waf';

export interface SandboxStageProps extends cdk.StackProps {
  readonly allowedIpAddresses: string[];
  readonly allowedIpv6Addresses: string[];
}

export class SandboxStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: SandboxStageProps) {
    super(scope, id, props);

    const wafStack = new WafStack(this, 'Waf', {
      env: {
        region: 'us-east-1',
        account: props.env?.account,
      },
      crossRegionReferences: true,
      allowedIpAddresses: props.allowedIpAddresses,
      allowedIpv6Addresses: props.allowedIpv6Addresses,
    });

    new ServiceStack(this, 'Service', {
      env: props.env,
      crossRegionReferences: true,
      webAclArn: wafStack.webAclArn,
    });
  }
}
