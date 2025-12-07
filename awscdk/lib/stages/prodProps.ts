import { SandboxStageProps } from "./stage";
import { defaultStageProps } from "./defaultProps";

export const prodStageProps: SandboxStageProps = {
  ...defaultStageProps,
  allowedIpAddresses: [],
  allowedIpv6Addresses: [],
};
