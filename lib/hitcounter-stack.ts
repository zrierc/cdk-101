import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface HitCounterProps {
  /** Func to count url hits */
  downstream: lambda.IFunction;

  /**
   * The read capacity units for the table
   *
   * Must be greater than 5 and lower than 20
   *
   * @default 5
   */
  readCapacity?: number;
}

export class HitCounter extends Construct {
  /** Allow accessing the counter function */
  public readonly handler: lambda.Function;

  /** THe hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    if (
      props.readCapacity !== undefined &&
      (props.readCapacity < 5 || props.readCapacity > 20)
    ) {
      throw new Error('readCapacity must be greater than 5 and less than 20');
    }
    super(scope, id);

    //  * Create dynamodb table
    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: {
        name: 'path',
        type: dynamodb.AttributeType.STRING,
      },
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      readCapacity: props.readCapacity ?? 5,
    });

    this.table = table;

    // * create lambda function
    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hitcounter.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName,
      },
    });

    // * Grant the lambda role/premission to read/write dynamodb table
    table.grantReadWriteData(this.handler);

    // * Grant the lambda role invoke premission to the downstream function
    props.downstream.grantInvoke(this.handler);
  }
}



















