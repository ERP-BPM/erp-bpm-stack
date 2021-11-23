import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_apigateway as apigateway } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';

export class ErpBpmCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'erp-bpm-api');

    const layer = new lambda.LayerVersion(this, "erp-layer", {
      code: new lambda.AssetCode("../erp-bpm-integration-api/layer/")
    });

    const fnTest = new lambda.Function(this, "test-func", {
      layers: [layer],
      timeout: Duration.seconds(30),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "handlers/test.handler",
      memorySize: 512,
      code: new lambda.AssetCode("../erp-bpm-integration-api/dist/"),
    });

    const fnSend = new lambda.Function(this, "send-func", {
      layers: [layer],
      timeout: Duration.seconds(30),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "handlers/sendMessage.handler",
      memorySize: 512,
      code: new lambda.AssetCode("../erp-bpm-integration-api/dist/"),
    });

    const fnStart = new lambda.Function(this, "start-func", {
      layers: [layer],
      timeout: Duration.seconds(30),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "handlers/startProccess.handler",
      memorySize: 512,
      code: new lambda.AssetCode("../erp-bpm-integration-api/dist/"),
    });

    api.root.addMethod('ANY', new apigateway.LambdaIntegration(fnTest));

    const send = api.root.addResource('send');
    send.addMethod('ANY', new apigateway.LambdaIntegration(fnSend));

    const start = api.root.addResource('start');
    start.addMethod('ANY', new apigateway.LambdaIntegration(fnStart));
  }
}
