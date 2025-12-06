import { Config } from "@/lib/types";
import { defaultConfig } from "./default";

export const devConfig: Config = {
  ...defaultConfig,
  stage: "dev",
  awsRegion: defaultConfig.awsRegion!,
  awsAccount: defaultConfig.awsAccount!,
  allowedIpAddresses: [
    // '192.0.2.0/24' // TODO: Add your development IP address here
  ],
  allowedIpv6Addresses: defaultConfig.allowedIpv6Addresses!,
};
