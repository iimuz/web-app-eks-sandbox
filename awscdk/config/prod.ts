import { Config } from "@/lib/types";
import { defaultConfig } from "./default";

export const prodConfig: Config = {
  ...defaultConfig,
  stage: "prod",
  awsRegion: defaultConfig.awsRegion!,
  awsAccount: defaultConfig.awsAccount!,
  allowedIpAddresses: [],
  allowedIpv6Addresses: defaultConfig.allowedIpv6Addresses!,
};
