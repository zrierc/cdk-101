import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // * Create lambda function
    const hello = new lambda.Function(this, 'helloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X, // execution runtime environment
      code: lambda.Code.fromAsset('lambda'), // Load code from lambda directory
      handler: 'hello.handler', // file is 'hello.js', and function tis 'handler
    });

    // * Create API Gateway REST API resource backed by 'hello' lambda that define before
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: hello,
    });
  }
}







