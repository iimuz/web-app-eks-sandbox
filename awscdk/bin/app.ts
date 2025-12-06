#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { WebAppEksSandboxStack } from "../lib/web-app-eks-sandbox-stack";

const app = new cdk.App();

// Determine the stage from environment variables, defaulting to 'dev'
const stage = process.env.STAGE || "dev";
const stackName = `WebAppEksSandbox-${stage}`;

new WebAppEksSandboxStack(app, stackName, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1", // us-east-1 is required for CloudFront + WAF
  },
  description: `Web App EKS Sandbox stack for the ${stage} environment.`,
});
