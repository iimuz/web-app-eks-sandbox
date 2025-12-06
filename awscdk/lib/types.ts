import * as cdk from "aws-cdk-lib";

export interface Config {
  readonly stage: string;
  readonly awsRegion: string;
  readonly awsAccount: string;
  readonly allowedIpAddresses: string[];
  readonly allowedIpv6Addresses: string[];
}

export interface WebAppEksSandboxStackProps extends cdk.StackProps {
  readonly config: Config;
}
