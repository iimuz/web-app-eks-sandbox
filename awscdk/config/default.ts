import { Config } from "@/lib/types";

export const defaultConfig: Partial<Omit<Config, "stage">> = {
  awsRegion: "us-east-1", // us-east-1 is required for CloudFront + WAF
  awsAccount: process.env.CDK_DEFAULT_ACCOUNT!,
  allowedIpAddresses: [], // Default to no IP restrictions
  allowedIpv6Addresses: [], // Default to no IPv6 restrictions
};
