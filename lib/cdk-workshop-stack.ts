import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { HitCounter } from './hitcounter-stack';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // * Create lambda function
    const hello = new lambda.Function(this, 'helloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X, // execution runtime environment
      code: lambda.Code.fromAsset('lambda'), // Load code from lambda directory
      handler: 'hello.handler', // file is 'hello.js', and function tis 'handler
    });

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello,
    });

    // * Create API Gateway REST API resource backed by 'hello' lambda that define before
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler,
    });

    // * Create dynamo table viewer
    new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello Hits',
      table: helloWithCounter.table,
    });
  }
}



