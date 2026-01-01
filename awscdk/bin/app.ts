#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { SandboxStage, SandboxStageProps } from '@/lib/stages/stage';
import { devStageProps } from '@/lib/stages/devProps';
import { prodStageProps } from '@/lib/stages/prodProps';

const app = new cdk.App();

const stageName = app.node.tryGetContext('stage') || 'Dev'; // Default to 'Dev'

let stageProps: SandboxStageProps;
if (stageName === 'Prod') {
  stageProps = prodStageProps;
} else if (stageName === 'Dev') {
  stageProps = devStageProps;
} else {
  throw new Error(
    `Unknown stage: ${stageName}. Please specify 'Dev' or 'Prod'.`
  );
}

new SandboxStage(app, stageName, stageProps);
