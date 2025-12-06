import { Config } from "@/lib/types";

export const defaultConfig: Partial<Omit<Config, "stage">> = {
  awsRegion: "us-west-2",
  awsAccount: process.env.CDK_DEFAULT_ACCOUNT!,
  allowedIpAddresses: [], // Default to no IP restrictions
  allowedIpv6Addresses: [], // Default to no IPv6 restrictions
};
