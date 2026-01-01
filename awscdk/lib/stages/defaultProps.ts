import { SandboxStageProps } from './stage';

export const defaultStageProps: SandboxStageProps = {
  env: {
    region: 'us-west-2',
    account: process.env.CDK_DEFAULT_ACCOUNT!,
  },
  allowedIpAddresses: [], // Default to no IP restrictions
  allowedIpv6Addresses: [], // Default to no IPv6 restrictions
};
