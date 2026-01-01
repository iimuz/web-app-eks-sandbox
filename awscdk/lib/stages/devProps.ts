import { SandboxStageProps } from './stage';
import { defaultStageProps } from './defaultProps';

export const devStageProps: SandboxStageProps = {
  ...defaultStageProps,
  allowedIpAddresses: [],
  allowedIpv6Addresses: [],
};
