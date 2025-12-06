#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { devConfig } from "../config/dev";
import { prodConfig } from "../config/prod";
import { Config } from "../lib/types";
import { WebAppEksSandboxStage } from "../lib/web-app-eks-sandbox-stage";

const app = new cdk.App();

const stageName = app.node.tryGetContext("stage") || "dev"; // Default to 'dev'

let config: Config;
if (stageName === "prod") {
  config = prodConfig;
} else if (stageName === "dev") {
  config = devConfig;
} else {
  throw new Error(`Unknown stage: ${stageName}. Please specify 'dev' or 'prod'.`);
}

new WebAppEksSandboxStage(app, stageName, {
  env: {
    account: config.awsAccount,
    region: config.awsRegion,
  },
  config,
});
