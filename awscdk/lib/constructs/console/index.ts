import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class ConsoleConstruct extends Construct {
  public readonly bucket: s3.IBucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // ========================================
    // S3 Bucket for Console
    // ========================================
    this.bucket = new s3.Bucket(this, "WebsiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For sample only
      autoDeleteObjects: true, // For sample only
    });

    // ========================================
    // Outputs
    // ========================================
    new cdk.CfnOutput(this, "BucketName", {
      value: this.bucket.bucketName,
      description: "S3 bucket name for console files",
    });
  }
}
