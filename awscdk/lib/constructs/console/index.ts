import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class ConsoleConstruct extends Construct {
  public readonly bucket: s3.IBucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, "ConsoleBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For sample only
      autoDeleteObjects: true, // For sample only
    });

    new cdk.CfnOutput(this, "BucketName", {
      value: this.bucket.bucketName,
      description: "S3 bucket name for console files",
    });

    const stageName = cdk.Stage.of(this)?.stageName.toLowerCase() || "dev";
    new ssm.StringParameter(this, "BucketNameParam", {
      parameterName: `/${stageName}/service/console/bucket-name`,
      stringValue: this.bucket.bucketName,
    });
  }
}
